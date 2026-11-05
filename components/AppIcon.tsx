import Image from "next/image";

/** The app icon as a tile: white with the black/grey bars and blue checks. */
export default function AppIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden bg-white ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        boxShadow: "0 0 0 0.5px var(--hairline), 0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <Image src="/app-icon-512.png" alt="" width={size} height={size} priority />
    </span>
  );
}
