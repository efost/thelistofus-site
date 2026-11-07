"use client";

// Google asks for its place photos to carry the photographer's name (linked to their
// Maps profile when there is one) and to say they're from Google Maps. The photo
// routes send that as an X-Photo-Credit header, so photos that show a credit are
// fetched rather than set as a plain <img src>.

export interface Credit {
  author?: string;
  url?: string;
}

export interface LoadedPhoto {
  url: string;
  credit: Credit | null;
}

/** Fetches a photo and its credit. null when there's no photo. */
export async function loadPhoto(src: string, signal?: AbortSignal): Promise<LoadedPhoto | null> {
  try {
    const response = await fetch(src, { signal });
    if (!response.ok || !(response.headers.get("content-type") ?? "").startsWith("image/")) {
      return null;
    }
    const header = response.headers.get("x-photo-credit");
    let credit: Credit | null = null;
    if (header) {
      try {
        credit = JSON.parse(decodeURIComponent(header)) as Credit;
      } catch {
        credit = {};
      }
    }
    const blob = await response.blob();
    // Make sure it decodes before it's used.
    const url = URL.createObjectURL(blob);
    const ok = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
    if (!ok) {
      URL.revokeObjectURL(url);
      return null;
    }
    return { url, credit };
  } catch {
    return null;
  }
}

/** "Photo by Jane Doe · Google Maps", over the corner of a photo. */
export default function PhotoCredit({
  credits,
  className = "",
}: {
  credits: Credit[];
  className?: string;
}) {
  if (!credits.length) return null;
  const authors = credits.filter((c) => c.author);
  return (
    <span
      className={`pointer-events-auto inline-flex max-w-[80%] items-center gap-1 truncate rounded-full bg-black/45 px-2.5 py-1 text-[11px] leading-none text-white/90 backdrop-blur-sm ${className}`}
    >
      {authors.length ? (
        <>
          <span>{authors.length > 1 ? "Photos by" : "Photo by"}</span>
          {authors.map((c, i) => (
            <span key={`${c.author}-${i}`} className="truncate">
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {c.author}
                </a>
              ) : (
                c.author
              )}
              {i < authors.length - 1 ? "," : ""}
            </span>
          ))}
          <span aria-hidden>·</span>
        </>
      ) : null}
      <span>Google Maps</span>
    </span>
  );
}
