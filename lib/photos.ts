import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Item } from "./lists";
import { SAMPLE_LIST_ID } from "./sample";

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

/** Who took a photo, as Google asks to be shown next to it. */
export interface PhotoCredit {
  /** The photographer, from the photo's html_attributions. */
  author?: string;
  /** Their Google Maps contributor page. */
  url?: string;
}

export interface Photo {
  bytes: ArrayBuffer;
  type: string;
  /** Set for Google photos (an empty credit still means "from Google"). */
  credit: PhotoCredit | null;
}

/** The credit as a response header (URL-encoded JSON), read by PlacePhoto and CoverCollage. */
export function creditHeader(photo: Photo): Record<string, string> {
  return photo.credit ? { "X-Photo-Credit": encodeURIComponent(JSON.stringify(photo.credit)) } : {};
}

/** "Jane Doe" and her contributor link, from `<a href="…">Jane Doe</a>`. */
export function parseAttribution(html: string | undefined): PhotoCredit {
  if (!html) return {};
  const url = html.match(/href="([^"]+)"/)?.[1];
  const author = html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  return {
    ...(author ? { author } : {}),
    ...(url && /^https:\/\//.test(url) ? { url } : {}),
  };
}

/** Only items that look like real places get looked up (as in the app). */
export function photoQuery(item: Pick<Item, "name" | "address" | "city" | "isPlace">) {
  if (!item.isPlace) return null;
  return [item.name, item.address, item.city].filter(Boolean).join(", ");
}

/** A definite "no photo" (as opposed to an error worth retrying). */
class NoPhoto extends Error {}

export async function placePhoto(item: Item, size: PhotoSize): Promise<Photo | null> {
  if (item.listId === SAMPLE_LIST_ID) return examplePhoto(item.id, size);
  const query = photoQuery(item);
  if (!KEY || !query) return null;
  return cached(`place2:${query}:${size}`, async () => {
    const { reference, credit } = await photoReferenceFor(query, item.name);
    return { ...(await photoByReference(reference, size)), credit };
  });
}

/**
 * The example list's own photos: public/example/<id>.jpg (1600px wide), with an
 * optional <id>-thumb.jpg for rows. Missing files just leave the emoji tile.
 */
async function examplePhoto(id: string, size: PhotoSize): Promise<Photo | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const dir = join(process.cwd(), "public", "example");
  const names = size === "thumb" ? [`${id}-thumb.jpg`, `${id}.jpg`] : [`${id}.jpg`];
  for (const name of names) {
    try {
      const bytes = await readFile(join(dir, name));
      return {
        bytes: new Uint8Array(bytes).buffer,
        type: "image/jpeg",
        credit: null,
      };
    } catch {
      // try the next one
    }
  }
  return null;
}

/** A list's chosen cover: either a photo URL or a Google photo reference. */
export async function coverPhoto(reference: string, size: PhotoSize): Promise<Photo | null> {
  if (/^https:\/\//.test(reference)) {
    return cached(`url:${reference}`, () => download(reference));
  }
  if (!KEY) return null;
  // The app saves only the reference, so there's no photographer to name; it's still
  // credited to Google.
  return cached(`ref2:${reference}:${size}`, async () => ({
    ...(await photoByReference(reference, size)),
    credit: {},
  }));
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
      const [bytes, type, credit] = await Promise.all([
        readFile(file),
        readFile(`${file}.type`, "utf8"),
        readFile(`${file}.credit`, "utf8").catch(() => ""),
      ]);
      return {
        bytes: new Uint8Array(bytes).buffer,
        type,
        credit: credit ? (JSON.parse(credit) as PhotoCredit) : null,
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
      if (photo.credit) await writeFile(`${file}.credit`, JSON.stringify(photo.credit));
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

async function photoReferenceFor(
  query: string,
  name: string,
): Promise<{ reference: string; credit: PhotoCredit }> {
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
    result?: {
      photos?: { photo_reference: string; html_attributions?: string[] }[];
    };
    status: string;
    error_message?: string;
  }>(details);
  if (place.status === "NOT_FOUND" || place.status === "ZERO_RESULTS")
    throw new NoPhoto("no place");
  if (place.status !== "OK")
    throw new Error(`Place details: ${place.status} ${place.error_message ?? ""}`);
  const photo = place.result?.photos?.[0];
  if (!photo?.photo_reference) throw new NoPhoto("no photos");
  return {
    reference: photo.photo_reference,
    credit: parseAttribution(photo.html_attributions?.[0]),
  };
}

function photoByReference(reference: string, size: PhotoSize): Promise<Omit<Photo, "credit">> {
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
  return { bytes: await response.arrayBuffer(), type, credit: null };
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
