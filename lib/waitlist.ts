import "server-only";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

// The waitlist: one line per address, "date,email,where", in a CSV that lives outside
// the release folders so deploys don't touch it. On the Droplet that's
// /srv/apps/thelistofus-web/data/waitlist.csv (releases are .../releases/<sha>).
// WAITLIST_FILE overrides it.

function file() {
  if (process.env.WAITLIST_FILE) return process.env.WAITLIST_FILE;
  const cwd = process.cwd();
  return cwd.includes("/releases/")
    ? resolve(cwd.split("/releases/")[0], "data", "waitlist.csv")
    : join(cwd, ".data", "waitlist.csv");
}

let known: Set<string> | null = null;

async function load() {
  if (known) return known;
  try {
    const text = await readFile(file(), "utf8");
    known = new Set(
      text
        .split("\n")
        .map((line) => line.split(",")[1]?.trim())
        .filter((email): email is string => Boolean(email)),
    );
  } catch {
    known = new Set();
  }
  return known;
}

/** Adds an address; false if it was already on the list. */
export async function addToWaitlist(email: string, where: string) {
  const list = await load();
  if (list.has(email)) return false;
  const path = file();
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const safeWhere = where.replace(/[^a-z0-9-]/gi, "").slice(0, 20);
  await appendFile(path, `${new Date().toISOString()},${email},${safeWhere}\n`, { mode: 0o600 });
  list.add(email);
  return true;
}

/** A plausible address, lowercased, or null. */
export function cleanEmail(raw: unknown) {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || /[\s,"<>]/.test(email)) return null;
  return /^[^@]+@[^@]+\.[a-z]{2,}$/.test(email) ? email : null;
}
