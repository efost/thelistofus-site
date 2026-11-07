// Cloudflare Turnstile in the browser: loaded only when someone submits, rendered as
// "interaction-only" so most people never see it.

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

export function loadTurnstile() {
  script ??= new Promise<Turnstile>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const el = document.createElement("script");
    el.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    el.async = true;
    el.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile didn't load"));
    el.onerror = () => {
      script = null;
      reject(new Error("Turnstile didn't load"));
    };
    document.head.appendChild(el);
  });
  return script;
}

/** Runs a check in `box` and resolves with its token (rejects if it errors or expires). */
export async function turnstileToken(box: HTMLElement, siteKey: string, action: string) {
  const turnstile = await loadTurnstile();
  box.replaceChildren();
  return new Promise<string>((resolve, reject) => {
    const id = turnstile.render(box, {
      sitekey: siteKey,
      action,
      appearance: "interaction-only",
      callback: (token: string) => {
        resolve(token);
        setTimeout(() => turnstile.remove(id), 0);
      },
      "error-callback": () => reject(new Error("check failed")),
      "expired-callback": () => reject(new Error("check expired")),
    });
  });
}
