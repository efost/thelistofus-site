import { createHash } from "node:crypto";

// Same recipe as AvatarColor.generate(name:joinedAt: .distantPast) in the app
// (ListItemCard.swift), which is what the app uses for a name it has no saved colour
// for. People's saved colours live on their user documents, which aren't public, so the
// site always uses this name-only version.
const DISTANT_PAST = "-62135596800"; // Int(Date.distantPast.timeIntervalSince1970)

export function avatarHex(name: string): string {
  const seed = `${name.trim().toLowerCase()}|${DISTANT_PAST}`;
  const d = createHash("sha256").update(seed, "utf8").digest();
  const hue = ((d[0] << 8) | d[1]) / 65535;
  const saturation = 0.45 + (d[2] / 255) * 0.35;
  const lightness = 0.38 + (d[3] / 255) * 0.34;
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const hex = (v: number) =>
    Math.trunc(v * 255)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** Whether a dark initial reads better than a white one on this colour (WCAG contrast). */
export function prefersDarkText(hex: string): boolean {
  const v = parseInt(hex.replace("#", ""), 16);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const r = lin(((v >> 16) & 0xff) / 255);
  const g = lin(((v >> 8) & 0xff) / 255);
  const b = lin((v & 0xff) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (lum + 0.05) / 0.05 > 1.05 / (lum + 0.05);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h * 6;
  const x = chroma * (1 - Math.abs((hh % 2) - 1));
  let rgb: [number, number, number];
  if (hh < 1) rgb = [chroma, x, 0];
  else if (hh < 2) rgb = [x, chroma, 0];
  else if (hh < 3) rgb = [0, chroma, x];
  else if (hh < 4) rgb = [0, x, chroma];
  else if (hh < 5) rgb = [x, 0, chroma];
  else rgb = [chroma, 0, x];
  const m = l - chroma / 2;
  return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
}
