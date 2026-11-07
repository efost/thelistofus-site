import "server-only";

// A small in-memory sliding-window limiter. The site runs as one process, so memory is
// enough; a restart just forgets the counts.

const windows = new Map<string, number[]>();

/** true if `key` may do this again; records the attempt when it may. */
export function allow(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    windows.set(key, recent);
    return false;
  }
  recent.push(now);
  windows.set(key, recent);
  if (windows.size > 10_000) {
    for (const [k, times] of windows) {
      if (!times.some((t) => now - t < windowMs)) windows.delete(k);
    }
  }
  return true;
}

const LOOPBACK = /^(127\.|::1$|::ffff:127\.)/;

/**
 * The visitor's address, as nginx passes it on, or "" if it doesn't. (Next fills in
 * x-forwarded-for with the socket's address, which behind nginx is always loopback.)
 */
export function clientIP(request: Request) {
  const candidates = [
    request.headers.get("x-real-ip"),
    ...(request.headers.get("x-forwarded-for")?.split(",") ?? []),
  ];
  for (const raw of candidates) {
    const ip = raw?.trim();
    if (ip && !LOOPBACK.test(ip)) return ip;
  }
  return "";
}
