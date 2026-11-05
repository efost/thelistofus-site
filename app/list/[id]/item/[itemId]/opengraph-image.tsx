import { getSharedItem } from "@/lib/lists";
import { homeImage, itemImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A place on The List";
export const revalidate = 300;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const found = await getSharedItem(id, itemId);
  return found ? itemImage(found.list, found.item) : homeImage();
}
