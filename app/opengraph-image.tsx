import { homeImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "The List: bucket lists you build together";

export default function Image() {
  return homeImage();
}
