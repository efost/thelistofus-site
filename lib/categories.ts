// Mirrors ListItem.Category in the app (raw values are what Firestore stores).
// 🎟 and 🏖 get the emoji variation selector so browsers draw them in colour.

export const CATEGORIES: Record<string, { icon: string; label: string }> = {
  Bars: { icon: "🍺", label: "Bars" },
  Restaurants: { icon: "🍔", label: "Restaurants" },
  Hikes: { icon: "🥾", label: "Hikes" },
  Movies: { icon: "🎬", label: "Movies" },
  "TV Shows": { icon: "📺", label: "TV Shows" },
  Experiences: { icon: "🎟\uFE0F", label: "Experiences" },
  Wineries: { icon: "🍷", label: "Wineries" },
  Shopping: { icon: "👜", label: "Shopping" },
  Games: { icon: "🎮", label: "Games" },
  Museums: { icon: "🎭", label: "Museums" },
  Travel: { icon: "🏖\uFE0F", label: "Travel" },
};

export function categoryIcon(category?: string | null) {
  return (category && CATEGORIES[category]?.icon) || "";
}

/** "🍺 Bars", or "" for no category. */
export function categoryLabel(category?: string | null) {
  const c = category && CATEGORIES[category];
  return c ? `${c.icon} ${c.label}` : "";
}

/** The emoji shown where there's no photo (the app uses 📍 when there's no category). */
export function fallbackEmoji(category?: string | null) {
  return categoryIcon(category) || "📍";
}

export const REACTIONS = {
  notForMe: { emoji: "👎", label: "Not for me" },
  fine: { emoji: "😐", label: "It was fine" },
  liked: { emoji: "👍", label: "Liked it" },
  loved: { emoji: "❤️", label: "Loved it" },
} as const;

export type Reaction = keyof typeof REACTIONS;

export function isReaction(value: unknown): value is Reaction {
  return typeof value === "string" && value in REACTIONS;
}
