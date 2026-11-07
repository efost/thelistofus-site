# thelistofus.com

The website for The List (iOS): a home page for the app, and web pages for lists and
items people share from it. Next.js 15 (App Router) + Tailwind 4, reading shared lists
from Firestore. Styled with the app's "The List" design system: Bricolage Grotesque Bold
and DM Sans (the same font files as the app, in `fonts/`), iOS system colours and the
blue-to-purple gradient on primary actions only.

## Pages

| Path                     | What it is                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `/`                      | Home page. The phone screens and feature cards are HTML drawn from the example list, not screenshots.         |
| `/list/:id`              | A list shared by link: cover collage, people, progress, To do / Done, search, category filter, map.           |
| `/list/:id/item/:itemId` | One item: photo, how it went (reaction + review), notes, location and map links, more from the list.          |
| `/list/example`          | A built-in example list (`lib/sample.ts`). Never touches Firestore, so it also works offline for development. |
| `/support`, `/privacy`   | Support FAQ and privacy policy (the App Store asks for both URLs).                                            |

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

On the Droplet these live in `/etc/thelistofus.env` (`deploy/setup-server.sh` asks for any
that are missing). For development, put them in `.env.local`.

```env
# Firebase web config, read on the server at run time
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…
NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NEXT_PUBLIC_FIREBASE_APP_ID=…

# Place photos. Restricted to the Places API. Without it, items show their category emoji.
GOOGLE_PLACES_API_KEY=…

# The TestFlight beta link, handed out only after a Cloudflare Turnstile check
# (POST /api/testflight, a few tries an hour per address). Never put it in a page.
TURNSTILE_SECRET_KEY=…
TESTFLIGHT_URL=https://testflight.apple.com/join/…

# Apple Maps (MapKit JS). A key with MapKit JS enabled; the private key is the .p8's
# contents, with or without its BEGIN/END lines and line breaks.
MAPKIT_TEAM_ID=8V5N4P9SRD
MAPKIT_KEY_ID=…
MAPKIT_PRIVATE_KEY=…
```

Public ids are baked into the pages at build time. Set them as GitHub repository
variables (Settings → Secrets and variables → Actions → Variables), or as defaults in
`lib/site.ts`:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: shows the "Join the beta" button.
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Umami Cloud analytics (page views, plus clicks tagged
  `data-umami-event`).
- `NEXT_PUBLIC_APP_STORE_ID`: once the app is live, switches "Get the app" to the App Store
  and turns on the Smart App Banner.

## Photos and caching

`/api/photo/:listId/:itemId?size=thumb|full` finds an item's place photo the same way
the app's `PlacePhotoStore` does (Find Place → name check → first photo). It only serves
items on shared lists, so it isn't an open proxy. Photos are cached on disk for 30 days
(no-photo answers for 7), and the photographer's credit is sent in an `X-Photo-Credit`
header, shown on large photos and link previews as Google asks.
`/api/cover/:listId` serves a list's chosen cover photo.

The example list (`lib/sample.ts`) uses made-up restaurants and bars and its own photos,
`public/example/<item id>.jpg` (1600px wide, optional `<id>-thumb.jpg`), never Google's.

List and item pages are cached and re-read from Firestore at most once a minute.

## Deploy

Pushing to `main` deploys (`.github/workflows/deploy.yml`):

1. GitHub Actions builds the standalone server and posts the build's SHA-256 on the commit
   as the `deploy/build-sha256` status.
2. It streams the build over SSH to the Droplet as `thelistofus-deploy`, whose key can only
   run `release <sha>` (`deploy/deploy-gate`).
3. `/usr/local/sbin/thelistofus-deploy` checks the commit is on main and the build matches
   that status, unpacks it into `/srv/apps/thelistofus-web/releases/<sha>`, points `current`
   at it, restarts the `thelistofus-web` service (port 3000, behind nginx) and rolls back
   if it doesn't answer.
4. The workflow checks `https://thelistofus.com/api/version` reports the new commit.

To re-deploy without a new commit, run the workflow from the Actions tab.

One-time setup (re-run any time to update the deploy scripts or add settings):

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
