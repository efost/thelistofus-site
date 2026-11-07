import { getCoverReference } from "@/lib/lists";
import { coverPhoto, creditHeader } from "@/lib/photos";

// GET /api/cover/:listId — the cover photo the list's owner picked, if any.
// Lists without one show a collage of their items' photos instead.
export async function GET(request: Request, { params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;
  const size = new URL(request.url).searchParams.get("size") === "thumb" ? "thumb" : "full";
  const reference = await getCoverReference(listId);
  const photo = reference && (await coverPhoto(reference, size));
  if (!photo) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }
  return new Response(photo.bytes, {
    headers: {
      "Content-Type": photo.type,
      ...creditHeader(photo),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
