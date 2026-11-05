// Site-wide settings. The App Store link and support address come from the
// environment so they can be filled in without a code change.

export const SITE_URL = "https://thelistofus.com";
export const SITE_NAME = "The List of Us";
/** What the app is called on the store and in share messages. */
export const APP_NAME = "The List";

export const TAGLINE =
  "Lists of places and things to do, shared with the people you'll do them with.";

/** Numeric App Store id, e.g. "6450000000". Empty until the app is live. */
export const APP_STORE_ID = process.env.NEXT_PUBLIC_APP_STORE_ID ?? "";

/** Where "Get the app" goes: the App Store when there's an id, else the home page's download section. */
export const APP_STORE_URL = APP_STORE_ID
  ? `https://apps.apple.com/app/id${APP_STORE_ID}`
  : process.env.NEXT_PUBLIC_TESTFLIGHT_URL || "/#get-the-app";

export const IS_ON_APP_STORE = Boolean(APP_STORE_ID);

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@thelistofus.com";

/** Opens the app directly (needs the `thelist` URL scheme registered in the app). */
export function appURL(listId: string, itemId?: string) {
  return `thelist://list/${encodeURIComponent(listId)}${
    itemId ? `/item/${encodeURIComponent(itemId)}` : ""
  }`;
}

export function listPath(listId: string) {
  return `/list/${encodeURIComponent(listId)}`;
}

export function itemPath(listId: string, itemId: string) {
  return `/list/${encodeURIComponent(listId)}/item/${encodeURIComponent(itemId)}`;
}
