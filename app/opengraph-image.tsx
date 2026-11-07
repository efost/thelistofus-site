import { homeImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "The List: places and things to do, shared with the people you'll do them with";

export default function Image() {
  return homeImage();
}
