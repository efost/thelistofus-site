"use client";

import { useEffect, useState } from "react";
import PhotoCredit, { loadPhoto, type Credit } from "./PhotoCredit";

// A place photo over the app's no-photo look (category emoji on a brand tint), so the
// emoji shows while loading and stays if there's no photo. Like the app, every place
// gets a tile whether or not there's a picture of it.
//
// With `credit`, the photo is fetched so its photographer can be shown in the corner
// (large photos; thumbnails rely on the footer's "from Google Maps" line).
export default function PlacePhoto({
  src,
  emoji,
  emojiSize = 22,
  className = "",
  imgClassName = "",
  alt = "",
  eager = false,
  credit = false,
  tint = "var(--surface-tint)",
}: {
  src: string | null;
  emoji: string;
  emojiSize?: number;
  className?: string;
  imgClassName?: string;
  alt?: string;
  eager?: boolean;
  credit?: boolean;
  tint?: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">(src ? "loading" : "failed");
  const [loaded, setLoaded] = useState<{
    url: string;
    credit: Credit | null;
  } | null>(null);

  useEffect(() => {
    if (!credit || !src) return;
    const controller = new AbortController();
    let url: string | null = null;
    loadPhoto(src, controller.signal).then((photo) => {
      if (controller.signal.aborted) {
        if (photo) URL.revokeObjectURL(photo.url);
        return;
      }
      if (!photo) return setState("failed");
      url = photo.url;
      setLoaded(photo);
      setState("loaded");
    });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [credit, src]);

  const imgSrc = credit ? loaded?.url : src;
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
      {imgSrc && state !== "failed" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={alt}
          loading={eager || credit ? "eager" : "lazy"}
          decoding="async"
          onLoad={credit ? undefined : () => setState("loaded")}
          onError={() => setState("failed")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            state === "loaded" ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
      {loaded?.credit && state === "loaded" && (
        <PhotoCredit credits={[loaded.credit]} className="absolute bottom-2.5 right-2.5" />
      )}
    </span>
  );
}
