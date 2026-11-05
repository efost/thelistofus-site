"use client";

import { useEffect, useState } from "react";

export interface CoverCandidate {
  src: string;
}

// The list cover, like the app's: the chosen cover photo, or a collage of the first
// item photos that exist (1 = full, 2 = halves, 3 = one big and two stacked).
// Many items (a movie, a trip) have no photo, so candidates are tried in order and
// only the ones that load are used.
export default function CoverCollage({
  cover,
  candidates,
  emoji,
  className = "",
  children,
  gap = 2,
}: {
  cover?: string | null;
  candidates: CoverCandidate[];
  emoji: string;
  className?: string;
  children?: React.ReactNode;
  gap?: number;
}) {
  const [photos, setPhotos] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = (src: string) =>
      new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    (async () => {
      if (cover) {
        const ok = await load(cover);
        if (ok) {
          if (!cancelled) setPhotos([ok]);
          return;
        }
      }
      const found: string[] = [];
      // A few at a time, stopping once there are three.
      for (let i = 0; i < candidates.length && found.length < 3; i += 3) {
        const batch = await Promise.all(candidates.slice(i, i + 3).map((c) => load(c.src)));
        for (const src of batch) if (src && found.length < 3) found.push(src);
        if (!cancelled && found.length) setPhotos([...found]);
      }
      if (!cancelled) setPhotos([...found]);
    })();
    return () => {
      cancelled = true;
    };
  }, [cover, candidates]);

  const n = photos?.length ?? 0;
  return (
    <div className={`relative overflow-hidden bg-[#141418] ${className}`}>
      {/* No photos (or still looking): the list's emoji on a dark brand wash. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${n ? "opacity-0" : "opacity-100"}`}
        style={{
          background:
            "radial-gradient(120% 90% at 85% 10%, rgba(158,9,171,0.55), transparent 60%), radial-gradient(110% 100% at 10% 100%, rgba(9,74,171,0.65), transparent 60%), #141418",
        }}
      >
        <span
          className="absolute right-6 top-6 select-none text-[88px] leading-none opacity-95 sm:right-10 sm:top-10 sm:text-[128px]"
          aria-hidden
        >
          {emoji}
        </span>
      </div>

      {n > 0 && (
        <div
          className="absolute inset-0 grid animate-[fadein_400ms_ease]"
          style={{
            gap,
            gridTemplateColumns: n === 1 ? "1fr" : "1fr 1fr",
            gridTemplateRows: n === 3 ? "1fr 1fr" : "1fr",
          }}
        >
          {photos!.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="h-full w-full object-cover"
              style={n === 3 && i === 0 ? { gridRow: "span 2" } : undefined}
            />
          ))}
        </div>
      )}

      {/* Bottom shade so white text reads over any photo. */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      <div className="relative h-full">{children}</div>
      <style>{`@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
