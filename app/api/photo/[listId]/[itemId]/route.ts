import { getSharedItem } from "@/lib/lists";
import { placePhoto, type PhotoSize } from "@/lib/photos";

// GET /api/photo/:listId/:itemId?size=thumb|full
// The place photo for an item on a shared list. Only serves items people can already
// see, so it isn't an open proxy to the Places API.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string; itemId: string }> },
) {
  const { listId, itemId } = await params;
  const size: PhotoSize =
    new URL(request.url).searchParams.get("size") === "thumb" ? "thumb" : "full";

  const found = await getSharedItem(listId, itemId);
  const photo = found && (await placePhoto(found.item, size));
  if (!photo) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }
  return new Response(photo.bytes, {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
