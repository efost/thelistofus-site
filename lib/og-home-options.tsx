import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { avatarHex, prefersDarkText } from "./avatar";
import { Brand, iconDataURL, render } from "./og";

// Exploration: four directions for the home page's link preview (1200×630). Rendered at
// /og-preview/<1-4> while we pick one.

const INK = "#000";
const MUTED = "#636366";
const BLUE = "#094AAB";
const PURPLE = "#9E09AB";
const SURFACE_2 = "#F2F2F7";

/** The hero's wash, on its light grey. */
const HERO_WASH = {
  backgroundColor: SURFACE_2,
  backgroundImage:
    "radial-gradient(45% 80% at 92% 8%, rgba(158,9,171,0.22), rgba(158,9,171,0) 70%), radial-gradient(45% 80% at 62% 100%, rgba(9,74,171,0.20), rgba(9,74,171,0) 70%)",
};

async function photo(id: string, thumb = false) {
  const data = await readFile(
    join(process.cwd(), "public", "example", `${id}${thumb ? "-thumb" : ""}.jpg`),
  );
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}

function Avatar({ name, size = 30, ring = "#fff" }: { name: string; size?: number; ring?: string }) {
  const bg = avatarHex(name);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 999,
        background: bg,
        border: `3px solid ${ring}`,
        color: prefersDarkText(bg) ? "rgba(0,0,0,0.85)" : "#fff",
        fontFamily: "Bricolage",
        fontSize: size * 0.42,
      }}
    >
      {name[0]}
    </div>
  );
}

function Avatars({ names, size, ring }: { names: string[]; size?: number; ring?: string }) {
  return (
    <div style={{ display: "flex" }}>
      {names.map((n, i) => (
        <div key={n} style={{ display: "flex", marginLeft: i ? -10 : 0 }}>
          <Avatar name={n} size={size} ring={ring} />
        </div>
      ))}
    </div>
  );
}

/** The hero headline, on its four lines, with one category coloured in. */
function Headline({
  size,
  emoji,
  noun,
  color,
  e,
  ink = INK,
}: {
  size: number;
  emoji?: string;
  noun: string;
  color?: string;
  e: (t: string) => string;
  ink?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontFamily: "Bricolage",
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: -size * 0.035,
        color: ink,
      }}
    >
      <span>A shared place for</span>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span>all the</span>
        {emoji ? <span style={{ marginLeft: size * 0.24 }}>{e(emoji)}</span> : null}
        <span style={{ marginLeft: size * 0.24, color: color ?? ink }}>{noun}</span>
      </div>
      <span>you keep meaning</span>
      <span>to check out.</span>
    </div>
  );
}

// 1. Hero echo: the hero's wash and headline, with the list screen as a tilted card.
export async function option1() {
  const [icon, a, b, c, t1, t2, t3, t4] = await Promise.all([
    iconDataURL(),
    photo("alcatraz-night-tour"),
    photo("golden-gate-park-dahlias", true),
    photo("foghorn-creamery", true),
    photo("alcatraz-night-tour", true),
    photo("golden-gate-park-dahlias", true),
    photo("lands-end-trail", true),
    photo("low-tide-rum-club", true),
  ]);
  const rows = [
    { name: "Alcatraz Night Tour", who: "Sam", src: t1 },
    { name: "Dahlia Garden", who: "Jenna", src: t2 },
    { name: "Lands End Trail", who: "Alex", src: t3 },
    { name: "Low Tide Rum Club", who: "Jenna", src: t4 },
  ];
  return render((e) => (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", ...HERO_WASH }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: 72,
          top: 60,
          bottom: 64,
        }}
      >
        <Brand icon={icon} />
        <Headline size={58} emoji="🍔" noun="restaurants" color="#c2410c" e={e} />
      </div>
      {/* The list screen, tilted like the hero's phone and running off the bottom. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 738,
          top: 64,
          width: 400,
          height: 640,
          borderRadius: 40,
          background: "#fff",
          overflow: "hidden",
          transform: "rotate(-4deg)",
          boxShadow: "0 30px 70px rgba(16,24,64,0.22), 0 6px 18px rgba(0,0,0,0.06)",
          border: "8px solid #111",
        }}
      >
        <div style={{ display: "flex", position: "relative", height: 232 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a} width={240} height={232} style={{ objectFit: "cover" }} alt="" />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 3 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b} width={141} height={115} style={{ objectFit: "cover" }} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c} width={141} height={114} style={{ objectFit: "cover", marginTop: 3 }} alt="" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              position: "absolute",
              left: 0,
              top: 0,
              width: 384,
              height: 232,
              padding: "0 20px 16px",
              backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)",
              color: "#fff",
            }}
          >
            <span style={{ fontFamily: "Bricolage", fontSize: 32 }}>SF weekends</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <Avatars names={["Sam", "Jenna", "Alex"]} size={30} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Bricolage", fontSize: 18 }}>
                <div style={{ display: "flex", width: 70, height: 6, borderRadius: 9, background: "rgba(255,255,255,0.35)" }}>
                  <div style={{ width: 30, height: 6, borderRadius: 9, background: "#fff" }} />
                </div>
                6/14
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "16px 18px 6px", fontFamily: "Bricolage", fontSize: 18 }}>
          <span style={{ background: "#000", color: "#fff", borderRadius: 999, padding: "7px 16px" }}>To do 8</span>
          <span style={{ border: "2px solid #E5E5EA", borderRadius: 999, padding: "5px 16px" }}>Done 6</span>
        </div>
        {rows.map((r) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", padding: "10px 18px", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.src} width={58} height={58} style={{ borderRadius: 14, objectFit: "cover" }} alt="" />
            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <span style={{ fontFamily: "Bricolage", fontSize: 21 }}>{r.name}</span>
              <span style={{ fontFamily: "DM Sans", fontSize: 16, color: MUTED }}>San Francisco</span>
            </div>
            <Avatar name={r.who} size={26} ring="#fff" />
          </div>
        ))}
      </div>
    </div>
  ));
}

const CATEGORIES = [
  { emoji: "🍺", noun: "Bars", color: "#b7791f" },
  { emoji: "🍔", noun: "Restaurants", color: "#c2410c" },
  { emoji: "🥾", noun: "Hikes", color: "#3f7d20" },
  { emoji: "🎬", noun: "Movies", color: "#6b21a8" },
  { emoji: "🎟️", noun: "Concerts", color: "#b91c1c" },
  { emoji: "🍷", noun: "Wineries", color: "#7f1d4d" },
  { emoji: "👜", noun: "Shops", color: "#be185d" },
  { emoji: "🏖️", noun: "Getaways", color: "#0d9488" },
  { emoji: "🎭", noun: "Museums", color: "#0369a1" },
];

// 2. Category cloud: the brand gradient, with what goes on a list as pills.
export async function option2() {
  const icon = await iconDataURL();
  // x, y, rotation, and whether it's checked off
  const spots: [number, number, number, boolean][] = [
    [712, 48, -4, false],
    [842, 116, 3, true],
    [668, 186, 2, false],
    [900, 246, -3, false],
    [700, 312, -2, true],
    [948, 374, 4, false],
    [684, 440, 3, false],
    [890, 500, -4, true],
    [716, 560, 2, false],
  ];
  return render((e) => (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: BLUE,
        backgroundImage: `radial-gradient(60% 90% at 100% 0%, rgba(200,100,255,0.55), rgba(200,100,255,0) 70%), linear-gradient(135deg, ${BLUE} 0%, ${PURPLE} 100%)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: 72,
          top: 60,
          bottom: 64,
        }}
      >
        <Brand icon={icon} dark />
        <Headline size={60} noun="things" e={e} ink="#fff" />
      </div>
      {CATEGORIES.map((c, i) => {
        const [x, y, r, done] = spots[i];
        return (
          <div
            key={c.noun}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "absolute",
              left: x,
              top: y,
              padding: "12px 24px 12px 16px",
              borderRadius: 999,
              background: "#fff",
              transform: `rotate(${r}deg)`,
              boxShadow: "0 14px 30px rgba(20,10,60,0.28)",
              fontFamily: "Bricolage",
              fontSize: 32,
              color: c.color,
            }}
          >
            {done ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: "#027AFF",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : null}
            <span>{e(c.emoji)}</span>
            <span>{c.noun}</span>
          </div>
        );
      })}
    </div>
  ));
}

// 3. Photo mosaic: the example list's places edge to edge, with a headline card.
export async function option3() {
  const ids: [string, string, string][] = [
    ["little-ember", "🍔", "Little Ember Café"],
    ["lands-end-trail", "🥾", "Lands End Trail"],
    ["low-tide-rum-club", "🍺", "Low Tide Rum Club"],
    ["point-reyes", "🏖️", "Point Reyes"],
    ["golden-gate-park-dahlias", "🌸", "Dahlia Garden"],
    ["fort-point", "🎟️", "Fort Point"],
  ];
  const [icon, ...srcs] = await Promise.all([iconDataURL(), ...ids.map(([id]) => photo(id))]);
  const W = 400;
  const H = 315;
  return render((e) => (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", background: "#000" }}>
      {ids.map(([id, emoji, name], i) => (
        <div
          key={id}
          style={{ display: "flex", position: "absolute", left: (i % 3) * W, top: Math.floor(i / 3) * H, width: W, height: H }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={srcs[i]} width={W} height={H} style={{ objectFit: "cover" }} alt="" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              position: "absolute",
              right: 16,
              bottom: 16,
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.92)",
              fontFamily: "Bricolage",
              fontSize: 19,
              color: INK,
            }}
          >
            <span>{e(emoji)}</span>
            <span>{name}</span>
          </div>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 34,
          position: "absolute",
          left: 56,
          top: 56,
          padding: "40px 48px 44px",
          borderRadius: 36,
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        }}
      >
        <Brand icon={icon} />
        <Headline size={52} emoji="🥾" noun="hikes" color="#3f7d20" e={e} />
      </div>
    </div>
  ));
}

// 4. Reviews: the checking-off and reviewing side, as stacked item cards.
export async function option4() {
  const items = [
    { id: "little-ember", name: "Little Ember Café", reaction: "❤️", label: "Loved it", who: "Jenna", review: "Worth every minute of the wait." },
    { id: "foghorn-creamery", name: "Foghorn Creamery", reaction: "❤️", label: "Loved it", who: "Alex", review: "Salted caramel. That’s the review." },
    { id: "fort-point", name: "Fort Point", reaction: "👍", label: "Liked it", who: "Alex", review: "Stand right under the bridge." },
  ];
  const [icon, ...srcs] = await Promise.all([iconDataURL(), ...items.map((i) => photo(i.id, true))]);
  const offsets = [0, 46, 14];
  return render((e) => (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", ...HERO_WASH }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: 72,
          top: 60,
          bottom: 64,
        }}
      >
        <Brand icon={icon} />
        <Headline size={56} noun="things" e={e} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "absolute", left: 640, top: 70 }}>
        {items.map((it, i) => (
          <div
            key={it.id}
            style={{
              display: "flex",
              gap: 18,
              marginLeft: offsets[i],
              width: 500,
              padding: 18,
              borderRadius: 28,
              background: "#fff",
              boxShadow: "0 18px 44px rgba(16,24,64,0.14), 0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={srcs[i]} width={112} height={112} style={{ borderRadius: 18, objectFit: "cover" }} alt="" />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1, width: 330 }}>
              <span style={{ fontFamily: "Bricolage", fontSize: 26 }}>{it.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontFamily: "Bricolage", fontSize: 18 }}>
                <span>{e(it.reaction)}</span>
                <span>{it.label}</span>
                <span style={{ fontFamily: "DM Sans", color: MUTED }}>· {it.who}</span>
              </div>
              <span style={{ marginTop: 8, fontFamily: "DM Sans", fontSize: 20, lineHeight: 1.3, color: "#3A3A3C" }}>
                “{it.review}”
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ));
}
