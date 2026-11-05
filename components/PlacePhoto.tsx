"use client";

import { useState } from "react";

// A place photo over the app's no-photo look (category emoji on a brand tint), so the
// emoji shows while loading and stays if there's no photo. Like the app, every place
// gets a tile whether or not Google has a picture of it.
export default function PlacePhoto({
  src,
  emoji,
  emojiSize = 22,
  className = "",
  imgClassName = "",
  alt = "",
  eager = false,
  tint = "var(--surface-tint)",
}: {
  src: string | null;
  emoji: string;
  emojiSize?: number;
  className?: string;
  imgClassName?: string;
  alt?: string;
  eager?: boolean;
  tint?: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">(src ? "loading" : "failed");
  return (
    <span className={`relative block overflow-hidden ${className}`} style={{ background: tint }}>
      {state !== "loaded" && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: emojiSize }}
          aria-hidden
        >
          {emoji}
        </span>
      )}
      {src && state !== "failed" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            state === "loaded" ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </span>
  );
}
