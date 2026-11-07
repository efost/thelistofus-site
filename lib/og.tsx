import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { fallbackEmoji, REACTIONS } from "./categories";
import type { Item, SharedList } from "./lists";
import { getCoverReference, peopleSentence, progressPercent } from "./lists";
import { coverPhoto, photoToDataURL, placePhoto, type Photo } from "./photos";

// Link previews (Messages, Slack, social) for lists and items: 1200×630 PNGs drawn
// with the app's fonts. Photos are fetched server-side and inlined.

export const OG_SIZE = { width: 1200, height: 630 };

async function fonts() {
  const dir = join(process.cwd(), "fonts");
  const [heading, body] = await Promise.all([
    readFile(join(dir, "TLBricolage-Bold.ttf")),
    readFile(join(dir, "TLDMSans-Regular.ttf")),
  ]);
  return [
    {
      name: "Bricolage",
      data: heading,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "DM Sans",
      data: body,
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}

async function iconDataURL() {
  const data = await readFile(join(process.cwd(), "public", "app-icon-512.png"));
  return `data:image/png;base64,${data.toString("base64")}`;
}

// Emoji are drawn from Twemoji's CDN. If that can't be reached, draw the image anyway
// without them rather than failing the whole preview.
// `draw` gets an `e` helper that passes text through, or strips its emoji in the fallback.
type Draw = (e: (text: string) => string) => React.ReactElement;
const keep = (text: string) => text;
const strip = (text: string) =>
  text.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, "").trim();

async function render(draw: Draw) {
  const options = { ...OG_SIZE, fonts: await fonts() };
  const headers = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=300",
  };
  try {
    const png = await new ImageResponse(draw(keep), {
      ...options,
      emoji: "twemoji",
    }).arrayBuffer();
    return new Response(png, { headers });
  } catch (error) {
    console.warn(
      "Link preview: drawing without emoji:",
      error instanceof Error ? error.message : error,
    );
    const png = await new ImageResponse(draw(strip), options).arrayBuffer();
    return new Response(png, { headers });
  }
}

function Brand({ icon, dark = false }: { icon: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon}
        width={44}
        height={44}
        style={{ borderRadius: 10, background: "#fff" }}
        alt=""
      />
      <span
        style={{
          fontFamily: "Bricolage",
          fontSize: 26,
          color: dark ? "#fff" : "#000",
        }}
      >
        The List
      </span>
    </div>
  );
}

function ProgressBar({ percent, light }: { percent: number; light?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        width: 220,
        height: 10,
        borderRadius: 999,
        background: light ? "rgba(255,255,255,0.35)" : "#f2f2f7",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.max(percent, 2)}%`,
          height: "100%",
          borderRadius: 999,
          background: light ? "#fff" : "linear-gradient(90deg, #094aab, #9e09ab)",
        }}
      />
    </div>
  );
}

/** Up to three photos: the list's cover, else its first places that have one. */
async function listPhotos(list: SharedList): Promise<Photo[]> {
  if (list.hasCoverPhoto) {
    const ref = await getCoverReference(list.id);
    const cover = ref && (await coverPhoto(ref, "full"));
    if (cover) return [cover];
  }
  const found: Photo[] = [];
  const places = list.items.filter((i) => i.isPlace).slice(0, 9);
  for (let i = 0; i < places.length && found.length < 3; i += 3) {
    const batch = await Promise.all(places.slice(i, i + 3).map((p) => placePhoto(p, "full")));
    for (const photo of batch) if (photo && found.length < 3) found.push(photo);
  }
  return found;
}

/** Google's credit for its photos, in the top-right corner. */
function Credit({ photos }: { photos: Photo[] }) {
  const google = photos.filter((p) => p.credit);
  if (!google.length) return null;
  const authors = google.flatMap((p) => (p.credit?.author ? [p.credit.author] : []));
  const text = authors.length
    ? `${authors.length > 1 ? "Photos" : "Photo"}: ${authors.join(", ")} · Google Maps`
    : "Photo: Google Maps";
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        right: 40,
        top: 40,
        maxWidth: 560,
        padding: "8px 16px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.45)",
        color: "rgba(255,255,255,0.9)",
        fontFamily: "DM Sans",
        fontSize: 20,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </div>
  );
}

function Collage({ photos }: { photos: string[] }) {
  const img = (src: string, w: number, h: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src.slice(-40)}
      src={src}
      width={w}
      height={h}
      style={{ objectFit: "cover" }}
      alt=""
    />
  );
  const { width: W, height: H } = OG_SIZE;
  if (photos.length === 1)
    return (
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {img(photos[0], W, H)}
      </div>
    );
  if (photos.length === 2)
    return (
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          gap: 4,
        }}
      >
        {img(photos[0], W / 2 - 2, H)}
        {img(photos[1], W / 2 - 2, H)}
      </div>
    );
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        gap: 4,
      }}
    >
      {img(photos[0], 700, H)}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {img(photos[1], W - 704, H / 2 - 2)}
        {img(photos[2], W - 704, H / 2 - 2)}
      </div>
    </div>
  );
}

// The same fade as the app's list cover (ListScreen.header): clear at the top quarter,
// 45% black by 60% down, 80% at the bottom, so white text reads over any photo. A light
// shade at the very top keeps the logo readable too.
const SHADE =
  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.8) 100%)";
const WASH =
  "radial-gradient(70% 90% at 90% 0%, rgba(158,9,171,0.75), rgba(158,9,171,0) 70%), radial-gradient(70% 100% at 0% 100%, rgba(9,74,171,0.85), rgba(9,74,171,0) 70%)";

export async function listImage(list: SharedList) {
  const [photos, icon] = await Promise.all([listPhotos(list), iconDataURL()]);
  const people = peopleSentence(list);
  return render((e) => (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#141418",
        backgroundImage: WASH,
        color: "#fff",
      }}
    >
      {photos.length ? (
        <Collage photos={photos.map(photoToDataURL)} />
      ) : (
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 70,
            top: 56,
            fontSize: 200,
          }}
        >
          {e(list.emoji || "📍")}
        </div>
      )}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: SHADE,
        }}
      />
      <div style={{ display: "flex", position: "absolute", left: 64, top: 52 }}>
        <Brand icon={icon} dark />
      </div>
      <Credit photos={photos} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 56,
        }}
      >
        <div
          style={{
            fontFamily: "Bricolage",
            fontSize: list.name.length > 22 ? 72 : 92,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {e(list.name)}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginTop: 26,
            fontFamily: "Bricolage",
            fontSize: 32,
          }}
        >
          <ProgressBar percent={progressPercent(list)} light />
          <span>
            {list.done} of {list.total} done
          </span>
          {people && <span style={{ fontFamily: "DM Sans", opacity: 0.85 }}>· {e(people)}</span>}
        </div>
      </div>
    </div>
  ));
}

export async function itemImage(list: SharedList, item: Item) {
  const [photo, icon] = await Promise.all([placePhoto(item, "full"), iconDataURL()]);
  const reaction = item.reaction ? REACTIONS[item.reaction] : null;
  const meta = [item.city, list.name].filter(Boolean).join(" · ");
  return render((e) => (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#141418",
        backgroundImage: WASH,
        color: "#fff",
      }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoToDataURL(photo)}
          width={1200}
          height={630}
          style={{ position: "absolute", objectFit: "cover" }}
          alt=""
        />
      ) : (
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 80,
            top: 60,
            fontSize: 210,
          }}
        >
          {e(fallbackEmoji(item.category))}
        </div>
      )}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: SHADE,
        }}
      />
      <div style={{ display: "flex", position: "absolute", left: 64, top: 52 }}>
        <Brand icon={icon} dark />
      </div>
      <Credit photos={photo ? [photo] : []} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 56,
        }}
      >
        {item.done && (
          <div style={{ display: "flex", marginBottom: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 22px 10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.92)",
                color: "#000",
                fontFamily: "Bricolage",
                fontSize: 28,
              }}
            >
              <span style={{ fontSize: 30 }}>{e(reaction?.emoji ?? "✅")}</span>
              {reaction ? reaction.label : "Done"}
              {item.completedBy ? (
                <span style={{ fontFamily: "DM Sans", color: "#636366" }}>
                  · {item.completedBy.name}
                </span>
              ) : null}
            </div>
          </div>
        )}
        <div
          style={{
            fontFamily: "Bricolage",
            fontSize: item.name.length > 24 ? 74 : 96,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {e(item.name)}
        </div>
        {meta && (
          <div
            style={{
              marginTop: 20,
              fontFamily: "DM Sans",
              fontSize: 34,
              opacity: 0.9,
            }}
          >
            {e(meta)}
          </div>
        )}
      </div>
    </div>
  ));
}

/** The home page preview: the design system's cover, rows of bars and checks. */
export async function homeImage() {
  const icon = await iconDataURL();
  const rows = [
    { done: true, w: 300 },
    { done: true, w: 210 },
    { done: false, w: 360 },
    { done: false, w: 250 },
    { done: true, w: 320 },
  ];
  return render(() => (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#fff",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 610,
          top: 0,
          width: 590,
          height: 630,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 230,
            height: 400,
            borderRadius: 28,
            background: "#094aab",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 414,
            width: 230,
            height: 240,
            borderRadius: 28,
            background: "#9e09ab",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 244,
            top: -30,
            width: 150,
            height: 210,
            borderRadius: 22,
            background: "#000",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 408,
            top: -30,
            width: 220,
            height: 210,
            borderRadius: 22,
            background: "#027aff",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 244,
            top: 194,
            width: 380,
            height: 470,
            borderRadius: 28,
            background: "#aeaeb2",
            display: "flex",
            flexDirection: "column",
            padding: "52px 0 0 40px",
            gap: 30,
          }}
        >
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: r.done ? "#027aff" : "#fff",
                }}
              />
              <div
                style={{
                  width: r.w * 0.75,
                  height: 20,
                  borderRadius: 10,
                  background: "#fff",
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 64,
          top: 60,
          bottom: 60,
          width: 540,
          justifyContent: "space-between",
        }}
      >
        <Brand icon={icon} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Bricolage",
              fontSize: 66,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: "#000",
            }}
          >
            All the places you keep meaning to check out.
          </div>
          <div
            style={{
              marginTop: 24,
              fontFamily: "DM Sans",
              fontSize: 32,
              lineHeight: 1.3,
              color: "#636366",
            }}
          >
            Bucket lists you build together.
          </div>
        </div>
      </div>
    </div>
  ));
}
