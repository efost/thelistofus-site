import { mapkitToken } from "@/lib/mapkit";
import { allow, clientIP } from "@/lib/rate-limit";

// GET /api/mapkit-token — a MapKit JS token for the site's maps. The token only works
// on thelistofus.com (its origin claim), so handing it out is fine; the limit just
// keeps anyone from hammering the route.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!allow(`mapkit:${clientIP(request) || "unknown"}`, 120, 60 * 60 * 1000)) {
    return new Response("Too many requests", { status: 429, headers });
  }
  const token = mapkitToken();
  if (!token) return new Response("Maps aren't set up", { status: 503, headers });
  return new Response(token, {
    headers: { ...headers, "Content-Type": "text/plain" },
  });
}
