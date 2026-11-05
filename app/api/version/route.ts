import { realpathSync } from "node:fs";

// GET /api/version — the commit this server was built from. The deploy releases live in
// .../releases/<sha>/, so it's read from the working directory; "dev" anywhere else.
// The deploy workflow polls this to confirm the new build is live.
export const dynamic = "force-dynamic";

export function GET() {
  let commit = "dev";
  try {
    commit = realpathSync(process.cwd()).split("/releases/")[1]?.split("/")[0] || "dev";
  } catch {}
  return Response.json({ commit }, { headers: { "Cache-Control": "no-store" } });
}
