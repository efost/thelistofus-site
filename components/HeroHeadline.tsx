"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// The headline cycles through what goes on a list: "All the 🥾 hikes you keep meaning to
// take", "All the 🍺 bars you keep meaning to check out"… Each swap slides the old word
// up and out while the new one rises in (the verb a beat after the noun), and the gap
// widens or narrows to fit. Each pair shares a colour. Screen readers get the plain
// sentence once; the moving parts are decorative.

const PHRASES: { emoji: string; thing: string; verb: string; color: string }[] = [
  // light-dark(): the light-mode colour, then one that reads on black.
  { emoji: "📍", thing: "places", verb: "go", color: "light-dark(#d1225b, #ff6b9a)" },
  { emoji: "🍔", thing: "restaurants", verb: "try", color: "light-dark(#c2410c, #fb923c)" },
  { emoji: "🥾", thing: "hikes", verb: "take", color: "light-dark(#3f7d20, #86d65a)" },
  { emoji: "🍺", thing: "bars", verb: "check out", color: "light-dark(#b7791f, #fbbf24)" },
  { emoji: "🎬", thing: "movies", verb: "watch", color: "light-dark(#6b21a8, #d8b4fe)" },
  { emoji: "🏖️", thing: "trips", verb: "book", color: "light-dark(#0d9488, #2dd4bf)" },
  { emoji: "🎨", thing: "museums", verb: "wander", color: "light-dark(#0369a1, #7dd3fc)" },
  { emoji: "🍷", thing: "wineries", verb: "visit", color: "light-dark(#7f1d4d, #f472b6)" },
  { emoji: "📺", thing: "shows", verb: "binge", color: "light-dark(#1d4ed8, #93c5fd)" },
  { emoji: "🎟️", thing: "events", verb: "go to", color: "light-dark(#b91c1c, #fca5a5)" },
  { emoji: "🎮", thing: "games", verb: "play", color: "light-dark(#4f46e5, #a5b4fc)" },
];

const HOLD = 2600;
const SWAP = 480;
/** The verb changes this long after the noun. */
const STAGGER = 160;

/** A word slot: the current word, animated in; the previous one, animated out. */
function Slot({
  words,
  colors,
  index,
  className = "",
}: {
  words: string[];
  colors: string[];
  index: number;
  className?: string;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [previous, setPrevious] = useState<number | null>(null);
  const shown = useRef(index);

  // Size the slot to the incoming word so the sentence reflows smoothly.
  useLayoutEffect(() => {
    if (measure.current) setWidth(measure.current.getBoundingClientRect().width);
  }, [index]);
  useEffect(() => {
    const onResize = () => {
      if (measure.current) setWidth(measure.current.getBoundingClientRect().width);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep the outgoing word around for the length of the animation.
  useEffect(() => {
    if (shown.current === index) return;
    setPrevious(shown.current);
    shown.current = index;
    const t = setTimeout(() => setPrevious(null), SWAP);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <span
      ref={box}
      className={`relative inline-block overflow-hidden align-bottom ${className}`}
      style={{
        width: width ?? undefined,
        transition: `width ${SWAP}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        paddingBottom: "0.08em",
        marginBottom: "-0.08em",
      }}
    >
      {/* Measured, invisible copy of the current word. */}
      <span ref={measure} className="invisible inline-block whitespace-nowrap">
        {words[index]}
      </span>
      <span
        key={index}
        className="hero-word hero-word-in absolute left-0 top-0 whitespace-nowrap"
        style={{ color: colors[index] }}
      >
        {words[index]}
      </span>
      {previous !== null && (
        <span
          key={`out-${previous}`}
          className="hero-word hero-word-out absolute left-0 top-0 whitespace-nowrap"
          style={{ color: colors[previous] }}
          aria-hidden
        >
          {words[previous]}
        </span>
      )}
    </span>
  );
}

export default function HeroHeadline({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [verbIndex, setVerbIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    let later: ReturnType<typeof setTimeout>;
    const tick = () => {
      i = (i + 1) % PHRASES.length;
      setIndex(i);
      const next = i;
      later = setTimeout(() => setVerbIndex(next), STAGGER);
      timer = setTimeout(tick, HOLD);
    };
    timer = setTimeout(tick, HOLD + 800);
    const onVisibility = () => {
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(tick, HOLD);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      clearTimeout(later);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const things = PHRASES.map((p) => `${p.emoji} ${p.thing}`);
  const verbs = PHRASES.map((p) => p.verb);
  const colors = PHRASES.map((p) => p.color);

  return (
    <h1 className={className}>
      <span className="sr-only">All the places you keep meaning to go.</span>
      {/* Fixed line breaks, so only the words move and the block never re-wraps. */}
      <span aria-hidden className="block">
        All the{" "}
        {animate ? (
          <Slot words={things} colors={colors} index={index} />
        ) : (
          <span style={{ color: colors[0] }}>{things[0]}</span>
        )}
      </span>
      <span aria-hidden className="block">
        you keep meaning
      </span>
      <span aria-hidden className="block">
        to{" "}
        {animate ? (
          <Slot words={verbs} colors={colors} index={verbIndex} />
        ) : (
          <span style={{ color: colors[0] }}>{verbs[0]}</span>
        )}
        .
      </span>
    </h1>
  );
}
