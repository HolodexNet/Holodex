What's there
Stack: React 19, Vite 8, TypeScript 6, Tailwind 4, shadcn preset bbazw9o, react-router, TanStack Query, zustand. Vuetify/MDI are gone, and I swapped the lucide icons inside the shadcn components for iconx ones. 86 iconx components: Phosphor for interface icons, Ionicons for brand logos and media glyphs.
Layout: full-width header with the Holodex org switcher, search and user menu; a sidebar that collapses to an icon rail, with the favorites list; bottom nav and a drawer on phones.
Home / Favorites: Live·Upcoming / Archive / Clips tabs, five view modes (three grid sizes, list, compact list), and the feed filters from the old UI. Live and lists use v3/live and v3/videos.
Search: header bar with autocomplete for channels, topics, orgs and pasted YouTube links. The page keeps its whole state in the URL and still reads old CSV-style links. It runs on v3 search.
Settings: language, theme, browsing, feed filters, blocked channels, reset.
Theme: primary defaults to aqua-iro pink (#f06292), with 24 talent presets plus a custom picker. Surfaces are computed in OKLCH from the primary: the base hue is the cooler of its two triadic partners, which for pink gives Holodex's own sky blue. The code is in src/lib/theme/palette.ts.
i18n: all 20 existing locale files are used as they are; new strings went into en/ui.yml only and fall back to English elsewhere.
Things you should know
The Vue app moved to legacy/ as git renames, for reference only. It is not runnable from there, because the locales stayed at src/locales for Crowdin.
Unported routes (watch, channels, multiview, playlists, about, TL tools) show a stopgap page linking to the same path on holodex.net. Clicking a video currently lands there.
Login page: I added a minimal one (Google, Discord, and the Twitter return path) because Favorites is useless without it. It is untested, as is the logged-in Favorites feed — I had no account to sign in with.
Existing users: first run imports settings, org, theme and login from the old holodex-v2 localStorage. Also untested against real old data.
Comment search still uses v2/search/commentSearch (no v3 equivalent). That route times out on the local database after 30s, so I could not see results render.
Dropped: the husky pre-commit hook (it ran the old lint-staged config) and the playlist button in the header.
Not done yet
Service worker: the new build has none. Browsers that have the old UI's service worker will probably keep serving the cached Vue app after a deploy unless a self-unregistering sw.js ships; I was about to add that plus a static web manifest.
CI: the PR workflow runs npm run lint:check, which doesn't exist in the new package.json yet. A serve alias is missing too.
Docs and editor config: README and .vscode/extensions.json still describe the Vue setup.
Unused shadcn components: nine have no importers (command, kbd, field, badge, avatar, and others); I haven't removed them.
Performance: "All Vtubers" returns about 900 live cards; I haven't measured how that renders.
Small visual nit: the "Complement" label in the palette preview on Settings is truncated.
When you're back, tell me what you think of the look, and I'll pick up with the service worker and CI items first unless you'd rather steer elsewhere.