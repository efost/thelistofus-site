import "server-only";
import { createPrivateKey, sign } from "node:crypto";
import { SITE_URL } from "./site";

// MapKit JS tokens: a short-lived ES256 JWT signed with a MapKit JS key from the Apple
// Developer account, locked to this site's origin.
//
//   MAPKIT_TEAM_ID       the team id (8V5N4P9SRD)
//   MAPKIT_KEY_ID        the key's id
//   MAPKIT_PRIVATE_KEY   the .p8 file's contents; line breaks may be dropped or written as \n

const TTL_SECONDS = 30 * 60;

function privateKey() {
  const raw = process.env.MAPKIT_PRIVATE_KEY;
  if (!raw) return null;
  // Accept the key however it was pasted: with or without the BEGIN/END lines,
  // with real or written-out line breaks.
  const body = raw
    .replace(/\\n/g, "\n")
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const lines = body.match(/.{1,64}/g)?.join("\n") ?? "";
  try {
    return createPrivateKey(`-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`);
  } catch (error) {
    console.error("MAPKIT_PRIVATE_KEY isn't a valid .p8 key:", error);
    return null;
  }
}

let cachedKey: ReturnType<typeof privateKey> | undefined;
let cachedToken: { token: string; expires: number } | null = null;

const b64url = (data: Buffer | string) => Buffer.from(data).toString("base64url");

/** A token, reused until it's within five minutes of expiring. null when not set up. */
export function mapkitToken(): string | null {
  const team = process.env.MAPKIT_TEAM_ID;
  const keyId = process.env.MAPKIT_KEY_ID;
  if (cachedKey === undefined) cachedKey = privateKey();
  if (!team || !keyId || !cachedKey) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expires - now > 5 * 60) return cachedToken.token;

  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: team,
      iat: now,
      exp: now + TTL_SECONDS,
      origin: process.env.MAPKIT_ORIGIN || SITE_URL,
    }),
  );
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), {
    key: cachedKey,
    dsaEncoding: "ieee-p1363",
  });
  const token = `${header}.${payload}.${b64url(signature)}`;
  cachedToken = { token, expires: now + TTL_SECONDS };
  return token;
}
