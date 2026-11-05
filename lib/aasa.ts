// Universal links: tapping a thelistofus.com list or item link on an iPhone with the
// app installed opens the app instead of Safari. Served from both locations Apple checks.
export const APPLE_APP_SITE_ASSOCIATION = {
  applinks: {
    details: [
      {
        appIDs: ["8V5N4P9SRD.st.efo.The-List"],
        components: [{ "/": "/list/*", comment: "Shared lists and their items" }],
      },
    ],
  },
};

export function aasaResponse() {
  return Response.json(APPLE_APP_SITE_ASSOCIATION, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
