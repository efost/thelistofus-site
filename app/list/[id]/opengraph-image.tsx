import { getSharedList } from "@/lib/lists";
import { homeImage, listImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A shared list on The List";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await getSharedList(id);
  return list ? listImage(list) : homeImage();
}
