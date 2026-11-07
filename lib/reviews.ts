import { collection, getDocs, limit, query, Timestamp, where } from "firebase/firestore";
import { cache } from "react";
import { isReaction, type Reaction } from "./categories";
import { firestore } from "./firebase";
import type { Item, Person } from "./lists";
import { person } from "./lists";

// Reviews people chose to share beyond their own list (the app's Done sheet:
// "Share with anyone looking at this place"). Stored in `reviews/<listId>_<itemId>`
// and matched to a place by `keys`. The app builds the same keys in
// ItemDetailView.swift (PublicReview.keys), so keep the two in step.

export interface PublicReview {
  id: string;
  author: Person | null;
  reaction: Reaction | null;
  review: string;
  completedAt: string | null;
}

/** Lowercased letters and digits only, "&" as "and", without a leading "the". */
export function normalizedName(name: string) {
  let text = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, "and")
    .trim();
  if (text.startsWith("the ")) text = text.slice(4);
  return text.replace(/[^\p{L}\p{N}]/gu, "");
}

export function reviewKeys(
  item: Pick<Item, "name" | "category" | "lat" | "long"> & { placeId?: string },
) {
  const keys: string[] = [];
  const id = item.placeId?.trim();
  if (id && !id.startsWith("ChIJ") && !id.startsWith("GhIJ")) keys.push(`place:${id}`);
  const name = normalizedName(item.name);
  if (!name) return keys;
  if (item.lat !== null && item.long !== null) {
    keys.push(`name:${name}@${item.lat.toFixed(2)},${item.long.toFixed(2)}`);
  } else {
    keys.push(`name:${name}|${item.category}`);
  }
  return keys;
}

/** What other people thought of the same place, newest first, leaving out this item's own. */
export const getOtherReviews = cache(async (item: Item): Promise<PublicReview[]> => {
  const keys = reviewKeys(item);
  if (!keys.length) return [];
  try {
    const snapshot = await getDocs(
      query(
        collection(firestore(), "reviews"),
        where("keys", "array-contains-any", keys),
        limit(30),
      ),
    );
    return snapshot.docs
      .filter((d) => d.id !== `${item.listId}_${item.id}`)
      .map((d) => {
        const data = d.data();
        const review = typeof data.review === "string" ? data.review.trim() : "";
        return {
          id: d.id,
          author: person(data.authorName, data.authorId),
          reaction: isReaction(data.reaction) ? data.reaction : null,
          review,
          completedAt:
            data.completedAt instanceof Timestamp ? data.completedAt.toDate().toISOString() : null,
        };
      })
      .filter((r) => r.reaction || r.review)
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  } catch (error) {
    console.error("Couldn't load public reviews:", error);
    return [];
  }
});
