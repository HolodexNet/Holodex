# React UI foundation

The active frontend is React 19, Vite 8, TypeScript 7, Tailwind CSS 4, and shadcn/ui's Base UI components. It was initialized with:

```sh
npx shadcn@latest init --preset bbazw9o --template vite --pointer
```

The former Vue 2/Vuetify application and its configuration are preserved in `legacy/` as references for subsequent feature migrations. They are outside the active build and Tailwind source scan. No Material Design package is used by the new frontend.

The shared shadcn CSS was inlined using the official `shadcn eject --yes` command after component generation, keeping the same preset and removing the CLI's transitive dependencies from the application install. New components can still be added through `npx shadcn@latest`; shared CSS updates must be reconciled explicitly.

## Running locally

Use Node 22.12+ (or Node 24+) and npm. Start the backend on port 2434, then:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:8080`. `npm run serve` is an alias. `npm run build` performs strict TypeScript checking before creating `dist/`; `npm run lint:check` uses Oxlint, which supports the latest TypeScript without the older TypeScript-ESLint peer dependency restriction. No tests were added.

## API integration

The browser sends requests to `/api`. Vite removes this prefix and proxies requests to `API_BASE_URL`, defaulting to `http://localhost:2434`. The development proxy uses the approved first-party Holodex origin. It does not change the backend's access policy. Use an appropriately configured reverse proxy with the same prefix in production; Vite's development proxy is not included in `dist/`.

For a separate browser-accessible API origin, set `VITE_API_BASE_URL`. Third-party origins may also need `VITE_API_KEY`; this is a public client credential, not a backend secret. Restart Vite after environment changes.

| Operation | API |
| --- | --- |
| Live/upcoming schedules | GET `/v3/live` |
| Recent streams and clips | GET `/v3/videos` with opaque cursor pagination |
| Video detail | GET `/v3/videos/:id` |
| Search / channel video browsing | POST `/v3/search/videoSearch`, reading `hits.hits[]._source` and each hit's `sort` cursor |
| Autocomplete | GET `/v3/search/autocomplete` |
| Organization choices | GET `/statics/orgs.json` |
| Channel directory | GET `/v2/channels` (no documented v3 equivalent) |
| Local favorite schedules | GET `/v2/users/live?channels=…` (v3 uploader filtering has a documented backend limitation) |
| Local favorite archives | v3 search with `q.vtuber` |

Search requests use 24 results, below v3's 50-item limit. Filter changes reset pagination; empty/repeated cursors stop it. Autocomplete is debounced and cancellable. Live data refreshes every 120 seconds while the page is visible, respecting the documented cache window. Existing cards stay visible while refreshing. Errors, rate limiting, missing thumbnails, and empty lists have explicit states. Old events still marked upcoming are presented separately as schedules awaiting an update.

## Implemented routes

- `/`: live/upcoming, recent streams, clips, organization/language/category filters, grid/list views.
- `/settings`: light/dark/system, primary color presets/custom hex, browsing preferences, content density, clock format, reduced motion, and preference reset.
- `/search`: search, channel/topic autocomplete, content type, organization, language, topic/date filters, sorting, cursor pagination, URL-preserved filters.
- `/favorites`, `/channels`, `/library`: local saved channels and videos, channel discovery.
- `/watch/:id`: v3 detail and YouTube embed. Placeholder events use their external link when available.
- `/multiview`: up to four selected YouTube players, muted initially.

Favorites, watch later, and preferences persist in this browser. The multiview queue lasts for the current app session. Account login/cloud synchronization, translation tools, editing/curation, playlists, Musicdex, localization, and the legacy multiview layout/share format are future migrations; this foundation does not claim compatibility with those flows. Old storage keys are left intact.

`public/sw.js` retires the previous Workbox service worker and its owned frontend caches when an existing installation updates. It leaves storage preferences intact and does not force-reload an open page. This starter does not register an offline/PWA worker.

## Theming

`src/lib/theme.ts` converts the primary's sRGB value to OKLCH. It rotates the hue by 180 degrees and uses restrained chroma for backing surfaces; each theme has explicit luminance levels for backgrounds, borders, and text. Primary controls choose black or white text by relative luminance. A darker/lighter primary ink token handles readable accent text independently of the chosen primary. Default Aqua-iro pink is `#F06292`, retained from the former Aqua theme.

## Icons and components

`icons.json` configures `./src/components/icons`. Phosphor (`ph`) supplies most icons, with Ionicons (`ion`) for navigation and YouTube. All generated components include licensing metadata. shadcn component icon imports have also been switched to Iconx-generated components.

```sh
npx iconx add --set ph icon-name:alias
npx iconx add --set ion home-outline:home
npx iconx mcp
```

Add shadcn components with `npx shadcn@latest add <component>`. Reconcile generated icon imports with the project's Iconx convention.
