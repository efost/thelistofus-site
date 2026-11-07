// Umami events (no-ops without the script, e.g. in development or before it's set up).

type Umami = {
  track: (event: string, data?: Record<string, string | number>) => void;
};

export function track(event: string, data?: Record<string, string | number>) {
  try {
    (globalThis as { umami?: Umami }).umami?.track(event, data);
  } catch {
    // analytics never breaks the page
  }
}
