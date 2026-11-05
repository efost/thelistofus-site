import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Item } from "./lists";

// Place photos, found the same way the app's PlacePhotoStore does: Find Place from the
// item's name and address, check the result's name resembles the item's, then the
// place's first photo.
//
// Photos are kept on disk (outside the release folders, so they survive deploys) and a
// place with no photo is remembered for a week, so each place costs about one set of
// Google calls however many people open the page. Errors (quota, network) are never
// remembered, so they're retried next time. Lookups run a few at a time, since a list
// page asks for dozens of photos at once.

const KEY = process.env.GOOGLE_PLACES_API_KEY;
const CACHE_DIR = process.env.PHOTO_CACHE_DIR || join(tmpdir(), "thelistofus-photos");
const PHOTO_TTL = 1000 * 60 * 60 * 24 * 30;
const MISS_TTL = 1000 * 60 * 60 * 24 * 7;

export type PhotoSize = "thumb" | "full";
const WIDTH: Record<PhotoSize, number> = { thumb: 240, full: 1600 };

export interface Photo {
  bytes: ArrayBuffer;
  type: string;
}

/** Only items that look like real places get looked up (as in the app). */
export function photoQuery(item: Pick<Item, "name" | "address" | "city" | "isPlace">) {
  if (!item.isPlace) return null;
  return [item.name, item.address, item.city].filter(Boolean).join(", ");
}

/** A definite "no photo" (as opposed to an error worth retrying). */
class NoPhoto extends Error {}

export async function placePhoto(item: Item, size: PhotoSize): Promise<Photo | null> {
  const query = photoQuery(item);
  if (!KEY || !query) return null;
  return cached(`place:${query}:${size}`, async () => {
    const reference = await photoReferenceFor(query, item.name);
    return photoByReference(reference, size);
  });
}

/** A list's chosen cover: either a photo URL or a Google photo reference. */
export async function coverPhoto(reference: string, size: PhotoSize): Promise<Photo | null> {
  if (/^https:\/\//.test(reference)) {
    return cached(`url:${reference}`, () => download(reference));
  }
  if (!KEY) return null;
  return cached(`ref:${reference}:${size}`, () => photoByReference(reference, size));
}

// MARK: Disk cache

const inFlight = new Map<string, Promise<Photo | null>>();

async function cached(key: string, fetchPhoto: () => Promise<Photo>): Promise<Photo | null> {
  const name = createHash("sha1").update(key).digest("hex");
  const file = join(CACHE_DIR, name);
  const fresh = async (path: string, ttl: number) => {
    try {
      return Date.now() - (await stat(path)).mtimeMs < ttl;
    } catch {
      return false;
    }
  };

  if (await fresh(`${file}.none`, MISS_TTL)) return null;
  if (await fresh(file, PHOTO_TTL)) {
    try {
      const [bytes, type] = await Promise.all([readFile(file), readFile(`${file}.type`, "utf8")]);
      return {
        bytes: new Uint8Array(bytes).buffer,
        type,
      };
    } catch {
      // fall through and fetch again
    }
  }

  const running = inFlight.get(name);
  if (running) return running;
  const task = (async () => {
    try {
      const photo = await fetchPhoto();
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(file, Buffer.from(photo.bytes));
      await writeFile(`${file}.type`, photo.type);
      return photo;
    } catch (error) {
      if (error instanceof NoPhoto) {
        await mkdir(CACHE_DIR, { recursive: true }).catch(() => {});
        await writeFile(`${file}.none`, error.message).catch(() => {});
      } else {
        console.error(`Photo ${key} failed:`, error instanceof Error ? error.message : error);
      }
      return null;
    } finally {
      inFlight.delete(name);
    }
  })();
  inFlight.set(name, task);
  return task;
}

// MARK: Google Places (a few calls at a time)

let active = 0;
const waiting: (() => void)[] = [];
async function limited<T>(work: () => Promise<T>): Promise<T> {
  if (active >= 4) await new Promise<void>((resolve) => waiting.push(resolve));
  active++;
  try {
    return await work();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

async function placesJSON<T extends { status: string; error_message?: string }>(
  url: URL,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const json = await limited(async () => {
      const response = await fetch(url, { cache: "no-store" });
      return (await response.json()) as T;
    });
    if (json.status === "OVER_QUERY_LIMIT" && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    return json;
  }
}

async function photoReferenceFor(query: string, name: string): Promise<string> {
  const find = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  find.search = new URLSearchParams({
    input: query,
    inputtype: "textquery",
    fields: "place_id,name",
    key: KEY!,
  }).toString();
  const found = await placesJSON<{
    candidates?: { place_id: string; name?: string }[];
    status: string;
    error_message?: string;
  }>(find);
  if (found.status === "ZERO_RESULTS") throw new NoPhoto("no place");
  if (found.status !== "OK")
    throw new Error(`Find place: ${found.status} ${found.error_message ?? ""}`);
  const candidate = found.candidates?.[0];
  if (!candidate) throw new NoPhoto("no place");
  // Google returns its nearest guess even for "Watch Severance"; only trust a
  // result whose name resembles the item's.
  if (candidate.name && !namesResemble(name, candidate.name)) throw new NoPhoto("different place");

  const details = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  details.search = new URLSearchParams({
    place_id: candidate.place_id,
    fields: "photos",
    key: KEY!,
  }).toString();
  const place = await placesJSON<{
    result?: { photos?: { photo_reference: string }[] };
    status: string;
    error_message?: string;
  }>(details);
  if (place.status === "NOT_FOUND" || place.status === "ZERO_RESULTS")
    throw new NoPhoto("no place");
  if (place.status !== "OK")
    throw new Error(`Place details: ${place.status} ${place.error_message ?? ""}`);
  const reference = place.result?.photos?.[0]?.photo_reference;
  if (!reference) throw new NoPhoto("no photos");
  return reference;
}

function photoByReference(reference: string, size: PhotoSize): Promise<Photo> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.search = new URLSearchParams({
    maxwidth: String(WIDTH[size]),
    photo_reference: reference,
    key: KEY!,
  }).toString();
  return limited(() => download(url.toString()));
}

async function download(url: string): Promise<Photo> {
  const response = await fetch(url, { cache: "no-store" });
  const type = response.headers.get("content-type") ?? "";
  if (response.status === 404) throw new NoPhoto("photo gone");
  if (!response.ok || !type.startsWith("image/")) {
    throw new Error(`Photo download: HTTP ${response.status} ${type}`);
  }
  return { bytes: await response.arrayBuffer(), type };
}

// MARK: Name matching (port of PlaceNameMatch in PlacePhotoStore.swift)

const STOP_WORDS = new Set(
  (
    "the and a an of at in on to for with go visit try see watch eat drink hike walk trip " +
    "place restaurant bar cafe coffee shop store park museum hotel co inc ltd"
  ).split(" "),
);

function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function words(text: string) {
  return new Set(
    fold(text)
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w)),
  );
}

export function namesResemble(query: string, result: string) {
  const q = words(query);
  const r = words(result);
  if (q.size === 0 || r.size === 0) {
    const a = fold(query);
    const b = fold(result);
    return Boolean(a && b) && (a.includes(b) || b.includes(a));
  }
  for (const w of q) if (r.has(w)) return true;
  return false;
}

export function photoToDataURL(photo: Photo) {
  return `data:${photo.type};base64,${Buffer.from(photo.bytes).toString("base64")}`;
}
