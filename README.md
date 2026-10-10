# Holodex

A React rewrite of Holodex, the community-built window into the VTuber world.

This first slice replaces the Vue/Vuetify application with React 19, Vite 8,
TypeScript 7, Tailwind 4, and shadcn Base UI. The design system was initialized with:

```sh
npx shadcn@latest init --preset bbazw9o --template vite --pointer
```

## Run locally

Use Node.js 24 LTS (minimum 22.12).

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. The Vite `/api` proxy targets the running backend at
`http://localhost:2434` by default. Copy `.env.placeholder` to `.env.local` to
override `HOLODEX_API_TARGET`. The legacy `API_BASE_URL` environment variable is
intentionally superseded by this explicit proxy target.

The proxy preserves the browser's same-origin request headers for the API access
gate. For production, serve the built `dist` directory with SPA fallback and proxy
`/api/*` to the API origin, stripping `/api`. Set `VITE_API_BASE_URL` only when the
deployment uses a different API prefix or an approved direct API integration.
`VITE_*` configuration is included in the browser bundle.

## Implemented

- Responsive app shell, mobile navigation, organization selector, global search,
  and keyboard shortcuts.
- Live homepage with a featured stream, upcoming schedule, category filters,
  recent streams, translated clips, grid/list views, and local favorites.
- v3 search with debounced channel/topic suggestions, typed filters, date range,
  sorting, shareable URLs, raw Elasticsearch result decoding, and cursor pagination.
- Persistent appearance/content/accessibility settings, backup import/export,
  and automatic import of legacy `holodex-v2` preferences and favorites on the same origin.
- Supporting watch, calendar/schedule, and basic four-player YouTube multiview pages.

These routes are the initial migration scope. Account sign-in/server favorite sync,
live chat and translations, playlists, Musicdex, curation, and advanced multiview
tools have not been ported yet. Existing locale resources are retained for the
next localization pass; this release's UI copy is English.

## API integration

Contracts live in [`dev-docs-handoff`](dev-docs-handoff/index.md).

| Operation | Endpoint |
| --- | --- |
| Live/upcoming | `GET /v3/live` |
| Recent streams/clips | `GET /v3/videos` |
| Video detail | `GET /v3/videos/:id` |
| Search | `POST /v3/search/videoSearch` |
| Suggestions | `GET /v3/search/autocomplete` |
| Organizations | `GET /statics/orgsV2.json` |
| Local favorite schedule | `GET /v2/users/live?channels=…` |
| Calendar export | `GET /live.ics` |

The favorite schedule uses the documented v2 explicit-channel route because the
handoff flags the v3 uploader filter as requiring backend correction. Empty
favorites never request a broad catalog feed. Live queries have a two-minute
freshness/polling interval and pause polling in background tabs. Previously loaded
cards stay visible on refresh errors. GET opaque cursors and POST search arrays are
kept separate, reset on filter changes, and guarded against empty/repeated pages.

## Theme and icons

`src/lib/theme.ts` converts the selected primary to OKLCH, rotates its hue by 180°,
and uses a low chroma complementary tint for background, sidebar, card, and control
surfaces. Separate lightness steps support light/dark mode. Primary button text
chooses black or white by contrast; accent text is adjusted toward black/white to
meet at least 4.5:1 contrast against the relevant neutral surfaces. Custom colors,
system appearance, and reduced motion are supported.

Icons are generated local React components, primarily Phosphor with Ionicons for
navigation, preserving their license metadata. Configuration: `icons.json`.

```sh
npx iconx add --set ph heart magnifying-glass
npx iconx add --set ion home-outline settings-outline
npx shadcn@latest add <component>
```

New shadcn components may introduce their default icon imports; adapt them to the
local iconx components, as the installed components already do.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

Tests cover adaptive contrast, API decoding/errors, cursor preservation, safe watch
links, date/count formats, preference validation, and multiview input parsing. The
PR workflow runs type checking, tests, and a production build. Route-level code
splitting keeps settings, search, and supporting pages out of the initial route code.

`npm audit --omit=dev` reports no vulnerabilities. The latest requested shadcn CLI
currently has seven development-only audit findings through its glob/AST tooling;
these packages are not shipped in the client bundle. Its upstream `braces` advisory
has no patched latest release at the time of this rewrite.

## Community

[Contribute on GitHub](https://github.com/HolodexNet/Holodex) ·
[Join Discord](https://discord.gg/jctkgHBt4b)

MIT license; see [LICENSE](LICENSE).
