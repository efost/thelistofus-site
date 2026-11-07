import { allow, clientIP } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";

// POST /api/testflight  { token }  →  { url }
//
// Hands out the TestFlight invite link to people who pass a Cloudflare Turnstile check,
// so it never appears in a page or script for scrapers to pick up. Each address gets a
// few tries an hour, and there's a daily ceiling for everyone together, so a leaked
// token or a farm of solvers can't drain the beta's tester slots.

export const dynamic = "force-dynamic";

const PER_IP_PER_HOUR = 5;
const ALL_PER_DAY = 300;

function reply(status: number, body: Record<string, string>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const link = process.env.TESTFLIGHT_URL;
  if (!secret || !link) return reply(503, { error: "The beta isn't open yet." });

  // Only from our own pages.
  const origin = request.headers.get("origin");
  const allowed = [SITE_URL, process.env.NODE_ENV !== "production" ? "http://localhost:3000" : ""];
  if (!origin || !allowed.includes(origin)) return reply(403, { error: "Not allowed." });

  const ip = clientIP(request);
  // Without a forwarded address everyone shares one bucket, so give it more room.
  if (
    !allow(`ip:${ip || "unknown"}`, ip ? PER_IP_PER_HOUR : PER_IP_PER_HOUR * 20, 60 * 60 * 1000)
  ) {
    return reply(429, { error: "Too many tries. Try again in an hour." });
  }

  let token = "";
  try {
    const body = (await request.json()) as { token?: unknown };
    if (typeof body.token === "string") token = body.token;
  } catch {
    // fall through
  }
  if (!token || token.length > 2048) return reply(400, { error: "Missing check." });

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
  const host = new URL(SITE_URL).hostname;
  if (
    !verified.success ||
    (process.env.NODE_ENV === "production" && verified.hostname !== host) ||
    verified.action !== "testflight"
  ) {
    return reply(403, { error: "That check didn't pass. Try again." });
  }

  if (!allow("all", ALL_PER_DAY, 24 * 60 * 60 * 1000)) {
    console.warn("TestFlight daily ceiling reached");
    return reply(429, { error: "The beta is busy today. Try again tomorrow." });
  }
  return reply(200, { url: link });
}
