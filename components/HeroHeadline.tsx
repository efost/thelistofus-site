"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// The headline cycles through what goes on a list. It opens on a plain "All the things
// you keep meaning to check out." Then the noun slides aside to make room for an emoji,
// and from there each swap rolls the emoji and the noun together: "All the 🥾 hikes…",
// "All the 🍺 bars…". "Things" doesn't come back. Only the noun changes, so every entry
// has to read with "check out", and fit on the first line at the sizes set in
// app/page.tsx (the longest is "experiences").
//
// The emoji and the noun each have a slot that widens or narrows to fit (clipped
// vertically only, so a leaving word is never cut off at the side); the old word slides
// up and out as the new one slides up in.
//
// Screen readers get the plain sentence once; the moving parts are decorative. Nothing
// moves under prefers-reduced-motion, off-screen, or in a hidden tab.

const PHRASES: { emoji: string; thing: string; color?: string }[] = [
  // light-dark(): the light-mode colour, then one that reads on black. After the opener,
  // these follow the category filter in the app (lib/categories.ts), with its icons.
  // The opener: no emoji, in ink. Shown once.
  { emoji: "", thing: "things" },
  { emoji: "🍺", thing: "bars", color: "light-dark(#b7791f, #fbbf24)" },
  { emoji: "🍔", thing: "restaurants", color: "light-dark(#c2410c, #fb923c)" },
  { emoji: "🥾", thing: "hikes", color: "light-dark(#3f7d20, #86d65a)" },
  { emoji: "🎬", thing: "movies", color: "light-dark(#6b21a8, #d8b4fe)" },
  { emoji: "📺", thing: "TV shows", color: "light-dark(#1d4ed8, #93c5fd)" },
  { emoji: "🎟\uFE0F", thing: "experiences", color: "light-dark(#b91c1c, #fca5a5)" },
  { emoji: "🍷", thing: "wineries", color: "light-dark(#7f1d4d, #f472b6)" },
  { emoji: "👜", thing: "shops", color: "light-dark(#be185d, #f9a8d4)" },
  { emoji: "🎮", thing: "games", color: "light-dark(#4f46e5, #a5b4fc)" },
  { emoji: "🎭", thing: "museums", color: "light-dark(#0369a1, #7dd3fc)" },
  { emoji: "🏖\uFE0F", thing: "getaways", color: "light-dark(#0d9488, #2dd4bf)" },
];

/** How long each phrase stays. */
const HOLD = 4000;
/** Before the first swap, so the real headline registers. */
const FIRST = 5000;
/** How long the noun takes to slide aside for the first emoji before anything rolls. */
const OPEN = 520;
/** Longest of the exit/entrance animations (globals.css), for cleaning up the old word. */
const SWAP = 960;

type Word = { text: string; color?: string; gap?: boolean };

/**
 * A word slot: the current word rolling in, the previous one rolling out. The slot is
 * sized to `sizeIndex` (normally the current word), so it can open up before its word
 * arrives. `gap` adds a word space after the text, for the emoji.
 */
function Slot({
  words,
  index,
  sizeIndex = index,
}: {
  words: Word[];
  index: number;
  sizeIndex?: number;
}) {
  const measure = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [previous, setPrevious] = useState<number | null>(null);
  const shown = useRef(index);

  // Size the slot to the word it's making room for; the width transition does the rest.
  useLayoutEffect(() => {
    if (measure.current) setWidth(measure.current.getBoundingClientRect().width);
  }, [sizeIndex]);
  useEffect(() => {
    const onResize = () => {
      if (measure.current) setWidth(measure.current.getBoundingClientRect().width);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep the outgoing word around for the length of its animation.
  useEffect(() => {
    if (shown.current === index) return;
    setPrevious(shown.current);
    shown.current = index;
    const t = setTimeout(() => setPrevious(null), SWAP);
    return () => clearTimeout(t);
  }, [index]);

  const text = (w: Word) => (
    <>
      {w.text}
      {w.gap && w.text && <span className="inline-block w-[0.22em]" />}
    </>
  );
  const moving = (i: number, phase: "in" | "out") =>
    words[i].text ? (
      <span
        key={`${phase}-${i}`}
        className={`hero-word hero-word-${phase} absolute left-0 top-0 whitespace-nowrap`}
        style={{ color: words[i].color }}
        aria-hidden
      >
        {text(words[i])}
      </span>
    ) : null;

  return (
    <span
      className="hero-slot relative inline-block align-bottom"
      style={{ width: width ?? undefined }}
    >
      {/* Invisible copy of the word the slot is sized for, for measuring. */}
      <span ref={measure} className="invisible inline-block whitespace-nowrap">
        {text(words[sizeIndex])}
      </span>
      {moving(index, "in")}
      {previous !== null && moving(previous, "out")}
    </span>
  );
}

export default function HeroHeadline({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  /** Set while the noun slides aside for the first emoji. */
  const [opening, setOpening] = useState(false);
  const [animate, setAnimate] = useState(false);
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    let i = 0;
    let first = true;
    let paused = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let open: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      if (paused) return;
      if (i === 0) {
        // First swap: make room for the emoji, then roll in the first category.
        setOpening(true);
        open = setTimeout(() => {
          i = 1;
          setIndex(1);
          setOpening(false);
        }, OPEN);
        timer = setTimeout(tick, OPEN + HOLD);
        return;
      }
      // After that, cycle the categories; "things" (index 0) doesn't come back.
      i = (i % (PHRASES.length - 1)) + 1;
      setIndex(i);
      timer = setTimeout(tick, HOLD);
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(tick, first ? FIRST : HOLD);
      first = false;
    };
    // Only animate while the headline is on screen and the tab is visible.
    const update = (onScreen: boolean) => {
      const shouldPause = !onScreen || document.hidden;
      if (shouldPause === paused) return;
      paused = shouldPause;
      if (paused) clearTimeout(timer);
      else schedule();
    };
    let onScreen = true;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update(onScreen);
    });
    if (root.current) observer.observe(root.current);
    const onVisibility = () => update(onScreen);
    document.addEventListener("visibilitychange", onVisibility);
    schedule();
    return () => {
      clearTimeout(timer);
      clearTimeout(open);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const emojis: Word[] = PHRASES.map((p) => ({ text: p.emoji, gap: true }));
  const nouns: Word[] = PHRASES.map((p) => ({ text: p.thing, color: p.color }));

  return (
    <h1 ref={root} className={className}>
      <span className="sr-only">All the things you keep meaning to check out.</span>
      {/* Fixed line breaks, so only the words move and the block never re-wraps. */}
      <span aria-hidden className="block">
        All the{" "}
        {animate ? (
          <>
            <Slot words={emojis} index={index} sizeIndex={opening ? 1 : index} />
            <Slot words={nouns} index={index} />
          </>
        ) : (
          nouns[0].text
        )}
      </span>
      <span aria-hidden className="block">
        you keep meaning
      </span>
      <span aria-hidden className="block">
        to check out.
      </span>
    </h1>
  );
}
