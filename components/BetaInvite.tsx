"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

// "Join the beta": a Cloudflare Turnstile check (usually invisible), then the server
// hands back the TestFlight link. Nothing loads until someone taps the button, and the
// link is only ever in the page after a check passes.

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let script: Promise<Turnstile> | null = null;
function loadTurnstile() {
  script ??= new Promise<Turnstile>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const el = document.createElement("script");
    el.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    el.async = true;
    el.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("no turnstile"));
    el.onerror = () => {
      script = null;
      reject(new Error("Turnstile didn't load"));
    };
    document.head.appendChild(el);
  });
  return script;
}

type State =
  | { step: "idle" }
  | { step: "checking" }
  | { step: "ready"; url: string }
  | { step: "error"; message: string };

export default function BetaInvite({ siteKey }: { siteKey: string }) {
  const [state, setState] = useState<State>({ step: "idle" });
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (widget.current) window.turnstile?.remove(widget.current);
    },
    [],
  );

  const redeem = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/testflight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !body.url) {
        setState({
          step: "error",
          message: body.error ?? "Something went wrong. Try again.",
        });
        track("testflight-failed", { status: response.status });
        return;
      }
      setState({ step: "ready", url: body.url });
      track("testflight-link");
      window.location.assign(body.url);
    } catch {
      setState({
        step: "error",
        message: "Couldn't reach the site. Try again.",
      });
    }
  }, []);

  const start = useCallback(async () => {
    setState({ step: "checking" });
    track("testflight-start");
    try {
      const turnstile = await loadTurnstile();
      if (widget.current) turnstile.remove(widget.current);
      widget.current = turnstile.render(box.current!, {
        sitekey: siteKey,
        action: "testflight",
        appearance: "interaction-only",
        callback: (token: string) => redeem(token),
        "error-callback": () =>
          setState({
            step: "error",
            message: "The check didn't finish. Try again.",
          }),
        "expired-callback": () => setState({ step: "idle" }),
      });
    } catch {
      setState({
        step: "error",
        message: "Couldn't load the check. Try again.",
      });
    }
  }, [redeem, siteKey]);

  return (
    <div className="flex flex-col items-center gap-3">
      {state.step === "ready" ? (
        <a href={state.url} className="btn-primary !min-h-14 !px-7 !text-[18px]" rel="noopener">
          Open in TestFlight
        </a>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={state.step === "checking"}
          className="btn-primary !min-h-14 !px-7 !text-[18px] disabled:opacity-70"
        >
          {state.step === "checking" ? "Checking…" : "Join the beta on TestFlight"}
        </button>
      )}
      <div ref={box} />
      <span className="max-w-sm text-[15px] text-muted" aria-live="polite">
        {state.step === "error"
          ? state.message
          : state.step === "ready"
            ? "If nothing opens, install TestFlight from the App Store, then tap the button again."
            : "Free, for iPhone. Opens in Apple's TestFlight app."}
      </span>
    </div>
  );
}
