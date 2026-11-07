"use client";

import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { turnstileToken } from "@/lib/turnstile";

// "Get early access": an email field, then a Cloudflare Turnstile check (usually
// invisible) when it's sent, then POST /api/waitlist.

type State =
  | { step: "idle" }
  | { step: "sending" }
  | { step: "done"; already: boolean }
  | { step: "error"; message: string };

export default function Waitlist({
  siteKey,
  where,
  align = "center",
  aside,
}: {
  siteKey: string;
  /** Which form it came from, kept with the address ("hero", "footer"). */
  where: string;
  align?: "center" | "start";
  /** Shown after the caption, e.g. a link to the example list. */
  aside?: React.ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ step: "idle" });
  const box = useRef<HTMLDivElement>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state.step === "sending") return;
    setState({ step: "sending" });
    track("waitlist-start", { where });
    try {
      const token = await turnstileToken(box.current!, siteKey, "waitlist");
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, where }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        already?: boolean;
        error?: string;
      };
      if (!response.ok || !body.ok) {
        setState({ step: "error", message: body.error ?? "Something went wrong. Try again." });
        track("waitlist-failed", { status: response.status });
        return;
      }
      setState({ step: "done", already: Boolean(body.already) });
      track("waitlist-join", { where });
    } catch {
      setState({ step: "error", message: "The check didn't finish. Try again." });
    }
  }

  const items = align === "center" ? "items-center text-center" : "items-start text-left";

  if (state.step === "done") {
    return (
      <div className={`flex flex-col gap-2 ${items}`} aria-live="polite">
        <div className="font-heading text-[20px]">
          {state.already ? "You're already on the list. We'll be in touch." : "You're on the list."}
        </div>
        <p className="max-w-sm text-[16px] text-muted">
          We&apos;ll email you the moment it&apos;s ready.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-col gap-3 ${items}`}>
      <form onSubmit={submit} className="flex w-full max-w-lg flex-col gap-2 sm:flex-row">
        <label htmlFor={`waitlist-${where}`} className="sr-only">
          Email address
        </label>
        <input
          id={`waitlist-${where}`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-14 flex-1 rounded-xl border border-hairline bg-surface px-5 text-[17px] outline-none transition-shadow focus:border-transparent focus:ring-2 focus:ring-[var(--check-blue)]"
        />
        <button
          type="submit"
          disabled={state.step === "sending"}
          className="btn-primary !min-h-14 shrink-0 !px-7 !text-[17px] disabled:opacity-70"
        >
          {state.step === "sending" ? "One sec…" : "Get early access"}
        </button>
      </form>
      <div ref={box} />
      <span
        className={`flex max-w-xl flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-muted ${
          align === "center" ? "justify-center" : ""
        }`}
        aria-live="polite"
      >
        <span>
          {state.step === "error"
            ? state.message
            : "Coming to iPhone. We'll email you when it's out, and that's it."}
        </span>
        {aside}
      </span>
    </div>
  );
}
