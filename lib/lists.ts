import { collection, doc, getDoc, getDocs, Timestamp, type DocumentData } from "firebase/firestore";
import { cache } from "react";
import { avatarHex, prefersDarkText } from "./avatar";
import { isReaction, type Reaction } from "./categories";
import { db } from "./firebase";
import { SAMPLE_LIST_ID, sampleList } from "./sample";

// Everything here is plain JSON (dates as ISO strings) so it can be handed straight
// to client components.

export interface Person {
  id?: string;
  /** First name only: the site never shows full names or emails. */
  name: string;
  initial: string;
  color: string;
  darkText: boolean;
}

export interface Item {
  id: string;
  listId: string;
  name: string;
  category: string;
  address: string;
  city: string;
  notes: string;
  done: boolean;
  lat: number | null;
  long: number | null;
  createdAt: string | null;
  completedAt: string | null;
  reaction: Reaction | null;
  review: string;
  addedBy: Person | null;
  completedBy: Person | null;
  /** Whether it looks like a real place (so it may have a photo and a map pin). */
  isPlace: boolean;
  /** Apple Maps place ID (older items may have a Google one, or none). */
  placeId: string;
}

export interface SharedList {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hasCoverPhoto: boolean;
  owner: Person | null;
  /** Everyone on the list we can put a name to, owner first. */
  people: Person[];
  /** Members, counting ones whose names we don't know. */
  memberCount: number;
  items: Item[];
  done: number;
  total: number;
  lastModifiedAt: string | null;
}

export function person(rawName: unknown, id?: unknown): Person | null {
  if (typeof rawName !== "string") return null;
  const trimmed = rawName.trim();
  // Older lists stored the owner's email as their name; never show an email.
  if (!trimmed || trimmed.includes("@")) return null;
  const name = trimmed.split(/\s+/)[0];
  const color = avatarHex(trimmed);
  return {
    id: typeof id === "string" && id ? id : undefined,
    name,
    initial: name.slice(0, 1).toUpperCase(),
    color,
    darkText: prefersDarkText(color),
  };
}

function iso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function coord(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value !== 0 ? value : null;
}

export function toItem(id: string, listId: string, d: DocumentData): Item {
  const lat = coord(d.lat);
  const long = coord(d.long);
  const address = text(d.address);
  const city = text(d.city);
  const name = text(d.name);
  const hasCoords = lat !== null && long !== null && Math.abs(lat) <= 90 && Math.abs(long) <= 180;
  const done = d.done === true || d.done === 1;
  return {
    id,
    listId,
    name,
    category: text(d.category) || "None",
    address,
    city,
    notes: text(d.notes),
    done,
    lat: hasCoords ? lat : null,
    long: hasCoords ? long : null,
    createdAt: iso(d.createdAt),
    completedAt: done ? iso(d.completedAt) : null,
    reaction: done && isReaction(d.reaction) ? d.reaction : null,
    review: done ? text(d.review) : "",
    addedBy: person(d.addedByName, d.addedById),
    completedBy: done ? person(d.completedByName, d.completedById) : null,
    isPlace: Boolean(name) && (Boolean(address) || Boolean(city) || hasCoords),
    placeId: text(d.placeId),
  };
}

/** Builds the list from its document and item documents. Shared by Firestore and the sample. */
export function assembleList(id: string, data: DocumentData, items: Item[]): SharedList {
  const named = items
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  const ownerId = text(data.ownerId);
  const byId = new Map<string, Person>();
  const byName = new Map<string, Person>();
  for (const item of named) {
    for (const p of [item.addedBy, item.completedBy]) {
      if (!p) continue;
      if (p.id) byId.set(p.id, p);
      else byName.set(p.name, p);
    }
  }

  const owner = person(data.ownerName, ownerId) ?? (ownerId ? (byId.get(ownerId) ?? null) : null);
  const people: Person[] = [];
  if (owner) people.push(owner);
  for (const p of byId.values()) if (p.id !== owner?.id) people.push(p);
  for (const p of byName.values())
    if (!people.some((known) => known.name === p.name)) people.push(p);

  const collaborators: unknown[] = Array.isArray(data.collaborators) ? data.collaborators : [];
  const memberIds = new Set(collaborators.filter((c): c is string => typeof c === "string"));
  if (ownerId) memberIds.add(ownerId);

  const done = named.filter((item) => item.done).length;
  return {
    id,
    name: text(data.name) || "Untitled list",
    emoji: text(data.emoji),
    description: text(data.description),
    hasCoverPhoto: Boolean(text(data.coverPhotoReference)),
    owner,
    people,
    memberCount: Math.max(memberIds.size, people.length),
    items: named,
    done,
    total: named.length,
    lastModifiedAt: iso(data.lastModifiedAt),
  };
}

/** A list anyone with the link can see, or null if it doesn't exist or isn't shared. */
export const getSharedList = cache(async (listId: string): Promise<SharedList | null> => {
  if (listId === SAMPLE_LIST_ID) return sampleList();
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(listId)) return null;
  try {
    const snapshot = await getDoc(doc(db, "lists", listId));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    if (data.isShared !== true) return null;

    const itemsSnapshot = await getDocs(collection(db, "lists", listId, "items"));
    const items = itemsSnapshot.docs.map((d) => toItem(d.id, listId, d.data()));
    return assembleList(listId, data, items);
  } catch (error) {
    // Unshared lists come back as permission-denied: treat like "not found".
    console.error(`Couldn't load list ${listId}:`, error);
    return null;
  }
});

/** The raw cover photo reference for a shared list (a URL or a Google photo reference). */
export const getCoverReference = cache(async (listId: string): Promise<string | null> => {
  if (listId === SAMPLE_LIST_ID) return null;
  try {
    const snapshot = await getDoc(doc(db, "lists", listId));
    const data = snapshot.data();
    if (!data || data.isShared !== true) return null;
    return text(data.coverPhotoReference) || null;
  } catch {
    return null;
  }
});

export async function getSharedItem(
  listId: string,
  itemId: string,
): Promise<{ list: SharedList; item: Item } | null> {
  const list = await getSharedList(listId);
  const item = list?.items.find((i) => i.id === itemId);
  return list && item ? { list, item } : null;
}

export function progressPercent(list: Pick<SharedList, "done" | "total">) {
  return list.total ? Math.round((list.done / list.total) * 100) : 0;
}

/** "Eric", "Eric and Jenna", "Eric, Jenna and 2 others". */
export function peopleSentence(list: SharedList): string {
  const names = list.people.slice(0, 2).map((p) => p.name);
  const others = list.memberCount - names.length;
  if (names.length === 0) return list.memberCount > 1 ? `${list.memberCount} people` : "";
  if (others <= 0) return names.join(" and ");
  if (names.length === 1) return `${names[0]} and ${others} other${others === 1 ? "" : "s"}`;
  return `${names[0]}, ${names[1]} and ${others} other${others === 1 ? "" : "s"}`;
}
