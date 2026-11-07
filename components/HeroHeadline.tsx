"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// The headline cycles through what goes on a list: "All the 🥾 hikes you keep meaning to
// take", "All the 🍺 bars you keep meaning to check out"… Each swap slides the old words
// up and out while the new ones rise in, and the gap widens or narrows to fit. Screen
// readers get the plain sentence once; the moving parts are decorative.

const PHRASES: { emoji: string; thing: string; verb: string }[] = [
  { emoji: "📍", thing: "places", verb: "go" },
  { emoji: "🍔", thing: "restaurants", verb: "try" },
  { emoji: "🥾", thing: "hikes", verb: "take" },
  { emoji: "🍺", thing: "bars", verb: "check out" },
  { emoji: "🎬", thing: "movies", verb: "watch" },
  { emoji: "🏖️", thing: "trips", verb: "book" },
  { emoji: "🎨", thing: "museums", verb: "wander" },
  { emoji: "🍷", thing: "wineries", verb: "visit" },
  { emoji: "📺", thing: "shows", verb: "binge" },
  { emoji: "🎟️", thing: "events", verb: "go to" },
  { emoji: "🎮", thing: "games", verb: "play" },
];

const HOLD = 2600;
const SWAP = 520;

/** A word slot: the current word, animated in; the previous one, animated out. */
function Slot({
  words,
  index,
  className = "",
}: {
  words: string[];
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
        transition: `width ${SWAP}ms cubic-bezier(0.3, 0.7, 0.2, 1)`,
        paddingBottom: "0.08em",
        marginBottom: "-0.08em",
      }}
    >
      {/* Measured, invisible copy of the current word. */}
      <span ref={measure} className="invisible inline-block whitespace-nowrap">
        {words[index]}
      </span>
      <span key={index} className="hero-word hero-word-in absolute left-0 top-0 whitespace-nowrap">
        {words[index]}
      </span>
      {previous !== null && (
        <span
          key={`out-${previous}`}
          className="hero-word hero-word-out absolute left-0 top-0 whitespace-nowrap"
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
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i = (i + 1) % PHRASES.length;
      setIndex(i);
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
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const things = PHRASES.map((p) => `${p.emoji} ${p.thing}`);
  const verbs = PHRASES.map((p) => p.verb);

  return (
    <h1 className={className}>
      <span className="sr-only">All the places you keep meaning to go.</span>
      {/* Fixed line breaks, so only the words move and the block never re-wraps. */}
      <span aria-hidden className="block">
        All the {animate ? <Slot words={things} index={index} /> : things[0]}
      </span>
      <span aria-hidden className="block">
        you keep meaning
      </span>
      <span aria-hidden className="block">
        to {animate ? <Slot words={verbs} index={index} /> : verbs[0]}.
      </span>
    </h1>
  );
}
