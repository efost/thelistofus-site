import { realpathSync } from "node:fs";
import { clientIP } from "@/lib/rate-limit";

// GET /api/version — the commit this server was built from. The deploy releases live in
// .../releases/<sha>/, so it's read from the working directory; "dev" anywhere else.
// The deploy workflow polls this to confirm the new build is live. `forwarded` says
// whether nginx passes on visitors' addresses (the rate limits rely on it).
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  let commit = "dev";
  try {
    commit = realpathSync(process.cwd()).split("/releases/")[1]?.split("/")[0] || "dev";
  } catch {}
  return Response.json(
    { commit, forwarded: Boolean(clientIP(request)) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
