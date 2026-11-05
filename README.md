# thelistofus.com

The website for The List (iOS): a home page for the app, and web pages for lists and
items people share from it. Next.js 15 (App Router) + Tailwind 4, reading shared lists
from Firestore. Styled with the app's "The List" design system: Bricolage Grotesque Bold
and DM Sans (the same font files as the app, in `fonts/`), iOS system colours and the
blue-to-purple gradient on primary actions only.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Home page. The phone screens and feature cards are HTML drawn from the example list, not screenshots. |
| `/list/:id` | A list shared by link: cover collage, people, progress, To do / Done, search, category filter, map. |
| `/list/:id/item/:itemId` | One item: photo, how it went (reaction + review), notes, location and map links, more from the list. |
| `/list/example` | A built-in example list (`lib/sample.ts`). Never touches Firestore, so it also works offline for development. |
| `/support`, `/privacy` | Support FAQ and privacy policy (the App Store asks for both URLs). |

Every list and item page has a generated link preview (`opengraph-image.tsx`) with its
photos, progress or reaction, for Messages and anywhere else links unfurl.

List and item pages are only shown for lists with link sharing on (`isShared == true`),
which is also what the Firestore rules allow. They show first names only, never emails,
and are marked `noindex`.

## Shared reviews

When someone checks something off in the app, they can choose to share their rating and
review publicly. Those go in Firestore `reviews/<listId>_<itemId>` (public read; rules in
the app repo's `firestore.rules`) and show as "What others thought" on every item page for
the same place. Places are matched by `keys`: the Apple Maps place ID, plus the name near
its coordinates (or name and category for things without a place). `lib/reviews.ts` and
the app's `PublicReview.keys` must build them the same way.

## Opening the app

- **Universal links:** `/.well-known/apple-app-site-association` (and the root copy) map
  `/list/*` to the app, so with the app installed, tapping a list or item link opens the
  app directly. The app reads both `…/list/:id` and `…/list/:id/item/:itemId`.
- **"Open in app" buttons** use the `thelist://list/:id[/item/:itemId]` URL scheme, since a
  universal link tapped on its own website stays in Safari.
- **Smart App Banner:** set `NEXT_PUBLIC_APP_STORE_ID` and Safari shows the App Store
  banner on every page, opening the current list in the app when it's installed.

## Environment

Copy these into `.env` (or `.env.local`):

```env
# Firebase web config (already set up)
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…
NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NEXT_PUBLIC_FIREBASE_APP_ID=…

# Place photos (server only). A Google Maps Platform key with the Places API enabled and
# no app/referrer restriction (restrict it by IP to the server instead). Without it,
# items show their category emoji, as in the app when there's no photo.
GOOGLE_PLACES_API_KEY=…

# Once the app is on the App Store: turns "Get the app" into App Store links and turns
# on the Smart App Banner. Until then those buttons go to the home page's download section.
NEXT_PUBLIC_APP_STORE_ID=
# Optional: a public TestFlight link to use until then.
NEXT_PUBLIC_TESTFLIGHT_URL=
# Where support and privacy emails go.
NEXT_PUBLIC_SUPPORT_EMAIL=support@thelistofus.com
```

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild after changing them.

## Photos and caching

`/api/photo/:listId/:itemId?size=thumb|full` finds an item's place photo the same way
the app's `PlacePhotoStore` does (Find Place → name check → first photo). It only serves
items on shared lists, so it isn't an open proxy. Google responses go through `fetch`
with a 30-day revalidate, so Next's data cache (`.next/cache`) keeps each place to about
one lookup a month. `/api/cover/:listId` serves a list's chosen cover photo.

List and item pages are cached and re-read from Firestore at most once a minute.

## Deploy

Pushing to `main` deploys (`.github/workflows/deploy.yml`). The workflow SSHes to the
Droplet as `thelistofus-deploy`, whose key can only run `deploy <sha>`. On the server,
`/usr/local/sbin/thelistofus-deploy` builds that commit in
`/srv/apps/thelistofus-web/releases/<sha>`, points `current` at it, restarts the
`thelistofus-web` service (port 3000, behind nginx) and rolls back if it doesn't answer.
The workflow then checks `https://thelistofus.com/api/version` reports the new commit.

Settings live on the server in `/etc/thelistofus.env` (Firebase config, Places key,
`PORT`), not in GitHub. To re-deploy without a new commit, run the workflow from the
Actions tab.

One-time setup (already done once; re-run any time, it's idempotent):

```bash
curl -fsSL https://raw.githubusercontent.com/efost/thelistofus-site/main/deploy/setup-server.sh | sudo bash
```

It prints the two repository secrets the workflow needs, `DEPLOY_SSH_KEY` and
`DEPLOY_KNOWN_HOSTS`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000, try /list/example
npm run build && npm start
```
