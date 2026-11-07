import { getSharedList, type Person } from "@/lib/lists";
import { fallbackEmoji } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

// GET /api/clip/list/:id — a shared list as JSON for the App Clip, which shows it
// without Firebase (keeping the clip small). Same data the list page shows: first names
// only, no account ids, nothing from lists that aren't shared.

export const revalidate = 60;

const who = (p: Person | null) => (p ? { name: p.name, initial: p.initial, color: p.color } : null);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await getSharedList(id);
  if (!list) {
    return Response.json(
      { error: "not shared" },
      { status: 404, headers: { "Cache-Control": "public, max-age=60" } },
    );
  }
  const photo = (itemId: string) =>
    `${SITE_URL}/api/photo/${encodeURIComponent(id)}/${encodeURIComponent(itemId)}`;
  return Response.json(
    {
      id: list.id,
      name: list.name,
      emoji: list.emoji,
      description: list.description,
      cover: list.hasCoverPhoto ? `${SITE_URL}/api/cover/${encodeURIComponent(id)}` : null,
      people: list.people.map(who),
      memberCount: list.memberCount,
      done: list.done,
      total: list.total,
      url: `${SITE_URL}/list/${encodeURIComponent(id)}`,
      items: list.items.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        icon: fallbackEmoji(i.category),
        address: i.address,
        city: i.city,
        notes: i.notes,
        done: i.done,
        lat: i.lat,
        long: i.long,
        createdAt: i.createdAt,
        completedAt: i.completedAt,
        reaction: i.reaction,
        review: i.review,
        addedBy: who(i.addedBy),
        completedBy: who(i.completedBy),
        photo: i.isPlace ? photo(i.id) : null,
        placeId: i.placeId,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } },
  );
}
