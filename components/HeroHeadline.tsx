"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// The headline cycles through what goes on a list: "All the 🥾 hikes you keep meaning to
// take", "All the 🍺 bars you keep meaning to check out"…
//
// Each swap is a roller: the old word slides up and out, the new one slides up and in
// behind it, the same distance, so they never overlap. The emoji stays put and pops
// (a quick scale) as the new word lands; the verb rolls a beat after the noun. The slot
// widens or narrows on the same curve as the arriving word, clipped vertically only so
// the leaving word is never cut off at the side. Only the noun is coloured.
//
// Screen readers get the plain sentence once; the moving parts are decorative. Nothing
// moves under prefers-reduced-motion, off-screen, or in a hidden tab.

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

/** How long each phrase stays. */
const HOLD = 2600;
/** Before the first swap, so the real headline registers. */
const FIRST = 4000;
/** The verb changes this long after the noun. */
const STAGGER = 160;
/** Longest of the exit/entrance animations (globals.css), for cleaning up the old word. */
const SWAP = 520;

type Word = { emoji?: string; text: string; color?: string };

/** A word slot: the current word rolling in, the previous one rolling out. */
function Slot({ words, index }: { words: Word[]; index: number }) {
  const measure = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [previous, setPrevious] = useState<number | null>(null);
  const shown = useRef(index);

  // Size the slot to the incoming word; the width transition does the rest.
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

  // Keep the outgoing word around for the length of its animation.
  useEffect(() => {
    if (shown.current === index) return;
    setPrevious(shown.current);
    shown.current = index;
    const t = setTimeout(() => setPrevious(null), SWAP);
    return () => clearTimeout(t);
  }, [index]);

  const render = (i: number, phase?: "in" | "out") => {
    const w = words[i];
    return (
      <>
        {w.emoji && (
          <span className={`inline-block ${phase ? `hero-emoji hero-emoji-${phase}` : ""}`}>
            {w.emoji}
          </span>
        )}
        <span className={`inline-block ${phase ? `hero-word hero-word-${phase}` : ""}`}>
          {w.text}
        </span>
      </>
    );
  };
  const moving = (i: number, phase: "in" | "out") => (
    <span
      key={`${phase}-${i}`}
      className="hero-pair absolute left-0 top-0 whitespace-nowrap"
      style={{ color: words[i].color }}
      aria-hidden
    >
      {render(i, phase)}
    </span>
  );

  return (
    <span
      className="hero-slot relative inline-block align-bottom"
      style={{ width: width ?? undefined }}
    >
      {/* Invisible copy of the current word, with the same markup, for measuring. */}
      <span ref={measure} className="hero-pair invisible inline-block whitespace-nowrap">
        {render(index)}
      </span>
      {moving(index, "in")}
      {previous !== null && moving(previous, "out")}
    </span>
  );
}

export default function HeroHeadline({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [verbIndex, setVerbIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    let i = 0;
    let first = true;
    let paused = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let later: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      if (paused) return;
      i = (i + 1) % PHRASES.length;
      setIndex(i);
      const next = i;
      later = setTimeout(() => setVerbIndex(next), STAGGER);
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
      clearTimeout(later);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const things: Word[] = PHRASES.map((p) => ({ emoji: p.emoji, text: p.thing, color: p.color }));
  const verbs: Word[] = PHRASES.map((p) => ({ text: p.verb }));

  return (
    <h1 ref={root} className={className}>
      <span className="sr-only">All the places you keep meaning to go.</span>
      {/* Fixed line breaks, so only the words move and the block never re-wraps. */}
      <span aria-hidden className="block">
        All the{" "}
        {animate ? (
          <Slot words={things} index={index} />
        ) : (
          <span style={{ color: things[0].color }}>
            {things[0].emoji} {things[0].text}
          </span>
        )}
      </span>
      <span aria-hidden className="block">
        you keep meaning
      </span>
      <span aria-hidden className="block">
        to {animate ? <Slot words={verbs} index={verbIndex} /> : verbs[0].text}.
      </span>
    </h1>
  );
}
