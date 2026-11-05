import "server-only";
import type { Item } from "./lists";

// Place photos, fetched the same way the app's PlacePhotoStore does: Find Place from
// the item's name and address, check the result's name resembles the item's, then the
// place's first photo. Every Google call goes through fetch() with a long revalidate,
// so Next's data cache (on disk under .next/cache) keeps each place to roughly one
// lookup a month however many people open the page.

const KEY = process.env.GOOGLE_PLACES_API_KEY;
const MONTH = 60 * 60 * 24 * 30;

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

// Places that came back with nothing, so a busy page doesn't keep asking. Cleared on restart.
const misses = new Map<string, number>();
const MISS_TTL = 1000 * 60 * 60 * 6;

export async function placePhoto(item: Item, size: PhotoSize): Promise<Photo | null> {
  const query = photoQuery(item);
  if (!KEY || !query) return null;

  const missAt = misses.get(query);
  if (missAt && Date.now() - missAt < MISS_TTL) return null;

  try {
    const placeId = await findPlaceId(query, item.name);
    const reference = placeId && (await firstPhotoReference(placeId));
    const photo = reference && (await photoByReference(reference, size));
    if (!photo) misses.set(query, Date.now());
    return photo || null;
  } catch (error) {
    console.error(`Place photo for "${query}" failed:`, error);
    return null;
  }
}

/** A list's chosen cover: either a photo URL or a Google photo reference. */
export async function coverPhoto(reference: string, size: PhotoSize): Promise<Photo | null> {
  try {
    if (/^https:\/\//.test(reference)) return await download(reference);
    if (!KEY) return null;
    return await photoByReference(reference, size);
  } catch (error) {
    console.error("Cover photo failed:", error);
    return null;
  }
}

async function findPlaceId(query: string, name: string): Promise<string | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  url.search = new URLSearchParams({
    input: query,
    inputtype: "textquery",
    fields: "place_id,name",
    key: KEY!,
  }).toString();
  const response = await fetch(url, { next: { revalidate: MONTH } });
  const json = (await response.json()) as {
    candidates?: { place_id: string; name?: string }[];
    status: string;
  };
  const candidate = json.candidates?.[0];
  if (!candidate) {
    if (json.status !== "ZERO_RESULTS") console.warn(`Find place refused: ${json.status}`);
    return null;
  }
  // Google returns its nearest guess even for "Watch Severance"; only trust a
  // result whose name resembles the item's.
  if (candidate.name && !namesResemble(name, candidate.name)) return null;
  return candidate.place_id;
}

async function firstPhotoReference(placeId: string): Promise<string | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.search = new URLSearchParams({ place_id: placeId, fields: "photos", key: KEY! }).toString();
  const response = await fetch(url, { next: { revalidate: MONTH } });
  const json = (await response.json()) as {
    result?: { photos?: { photo_reference: string }[] };
    status: string;
  };
  return json.result?.photos?.[0]?.photo_reference ?? null;
}

async function photoByReference(reference: string, size: PhotoSize): Promise<Photo | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.search = new URLSearchParams({
    maxwidth: String(WIDTH[size]),
    photo_reference: reference,
    key: KEY!,
  }).toString();
  return download(url.toString());
}

async function download(url: string): Promise<Photo | null> {
  const response = await fetch(url, { next: { revalidate: MONTH } });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.startsWith("image/")) return null;
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
