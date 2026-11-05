"use client";

import { useEffect, useState } from "react";

// Dates in the reader's own time zone, phrased like the app's DoneDate:
// "today", "yesterday", "Wednesday", "Nov 2", "Nov 2, 2024".

type Style = "short" | "sentence" | "full";

function format(iso: string, style: Style, timeZone?: string) {
  const date = new Date(iso);
  const now = new Date();
  const opts = (o: Intl.DateTimeFormatOptions) => ({ ...o, timeZone });
  if (style === "full") {
    return date.toLocaleDateString(
      "en-US",
      opts({ month: "short", day: "numeric", year: "numeric" }),
    );
  }
  const dayKey = (d: Date) => d.toLocaleDateString("en-CA", opts({}));
  const yesterday = new Date(now.getTime() - 86400000);
  let text: string;
  if (dayKey(date) === dayKey(now)) text = "Today";
  else if (dayKey(date) === dayKey(yesterday)) text = "Yesterday";
  else if (now.getTime() - date.getTime() < 6 * 86400000 && date < now)
    text = date.toLocaleDateString("en-US", opts({ weekday: "long" }));
  else if (date.getFullYear() === now.getFullYear())
    text = date.toLocaleDateString("en-US", opts({ month: "short", day: "numeric" }));
  else
    text = date.toLocaleDateString(
      "en-US",
      opts({ month: "short", day: "numeric", year: "numeric" }),
    );

  if (style === "sentence") {
    return text === "Today" || text === "Yesterday" ? text.toLowerCase() : `on ${text}`;
  }
  return text;
}

export default function When({ iso, style = "short" }: { iso: string; style?: Style }) {
  // Server render in UTC, then re-render in the reader's zone.
  const [text, setText] = useState(() => format(iso, style, "UTC"));
  useEffect(() => setText(format(iso, style)), [iso, style]);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
