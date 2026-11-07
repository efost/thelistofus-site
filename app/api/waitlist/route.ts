import { allow, clientIP } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { addToWaitlist, cleanEmail } from "@/lib/waitlist";

// POST /api/waitlist  { email, token, where }  →  { ok, already? }
//
// Adds an address to the waitlist after a Cloudflare Turnstile check. Each address
// (IP) gets a few tries an hour and there's a daily ceiling overall, so the form can't
// be used to flood the list.

export const dynamic = "force-dynamic";

const PER_IP_PER_HOUR = 5;
const ALL_PER_DAY = 1000;

function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return reply(503, { error: "The waitlist isn't open yet." });

  const origin = request.headers.get("origin");
  const allowed = [SITE_URL, process.env.NODE_ENV !== "production" ? "http://localhost:3000" : ""];
  if (!origin || !allowed.includes(origin)) return reply(403, { error: "Not allowed." });

  const ip = clientIP(request);
  if (
    !allow(`waitlist:${ip || "unknown"}`, ip ? PER_IP_PER_HOUR : PER_IP_PER_HOUR * 20, 3600_000)
  ) {
    return reply(429, { error: "Too many tries. Try again in an hour." });
  }

  let body: { email?: unknown; token?: unknown; where?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }
  const email = cleanEmail(body.email);
  if (!email) return reply(400, { error: "That doesn't look like an email address." });
  const token = typeof body.token === "string" && body.token.length <= 2048 ? body.token : "";
  if (!token) return reply(400, { error: "Missing check." });

  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set("remoteip", ip);
  let verified: { success?: boolean; hostname?: string; action?: string } = {};
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    verified = await response.json();
  } catch (error) {
    console.error("Turnstile verify failed:", error);
    return reply(502, { error: "Couldn't check that. Try again." });
  }
  if (
    !verified.success ||
    (process.env.NODE_ENV === "production" && verified.hostname !== new URL(SITE_URL).hostname) ||
    verified.action !== "waitlist"
  ) {
    return reply(403, { error: "That check didn't pass. Try again." });
  }

  if (!allow("waitlist:all", ALL_PER_DAY, 24 * 3600_000)) {
    console.warn("Waitlist daily ceiling reached");
    return reply(429, { error: "Lots of signups today. Try again tomorrow." });
  }
  try {
    const added = await addToWaitlist(email, typeof body.where === "string" ? body.where : "");
    return reply(200, { ok: true, already: !added });
  } catch (error) {
    console.error("Couldn't save to the waitlist:", error);
    return reply(500, { error: "Couldn't save that. Try again." });
  }
}
