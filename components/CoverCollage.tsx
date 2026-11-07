"use client";

import { useEffect, useState } from "react";
import PhotoCredit, { loadPhoto, type LoadedPhoto } from "./PhotoCredit";

export interface CoverCandidate {
  src: string;
}

// The list cover, like the app's: the chosen cover photo, or a collage of the first
// item photos that exist (1 = full, 2 = halves, 3 = one big and two stacked).
// Many items (a movie, a trip) have no photo, so candidates are tried in order and
// only the ones that load are used. Google photos are credited in the top corner.
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
  const [photos, setPhotos] = useState<LoadedPhoto[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const all: LoadedPhoto[] = [];
    const load = async (src: string) => {
      const photo = await loadPhoto(src, controller.signal);
      if (photo) all.push(photo);
      return photo;
    };
    const show = (list: LoadedPhoto[]) => {
      if (!controller.signal.aborted) setPhotos([...list]);
    };

    (async () => {
      if (cover) {
        const photo = await load(cover);
        if (photo) return show([photo]);
      }
      const found: LoadedPhoto[] = [];
      // A few at a time, stopping once there are three.
      for (let i = 0; i < candidates.length && found.length < 3; i += 3) {
        const batch = await Promise.all(candidates.slice(i, i + 3).map((c) => load(c.src)));
        for (const photo of batch) if (photo && found.length < 3) found.push(photo);
        if (found.length) show(found);
      }
      show(found);
    })();
    return () => {
      controller.abort();
      for (const photo of all) URL.revokeObjectURL(photo.url);
    };
  }, [cover, candidates]);

  const n = photos?.length ?? 0;
  const credits = (photos ?? []).flatMap((p) => (p.credit ? [p.credit] : []));
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
          {photos!.map(({ url }, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
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
      {credits.length > 0 && (
        <PhotoCredit credits={credits} className="absolute right-3 top-3 z-10" />
      )}
      <style>{`@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
