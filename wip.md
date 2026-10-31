What's there
Stack: React 19, Vite 8, TypeScript 6, Tailwind 4, shadcn preset bbazw9o, react-router, TanStack Query, zustand. Vuetify/MDI are gone, and I swapped the lucide icons inside the shadcn components for iconx ones. 86 iconx components: Phosphor for interface icons, Ionicons for brand logos and media glyphs.
Layout: full-width header with the Holodex org switcher, search and user menu; a sidebar that collapses to an icon rail, with the favorites list; bottom nav and a drawer on phones.
Home / Favorites: Live·Upcoming / Archive / Clips tabs, five view modes (three grid sizes, list, compact list), and the feed filters from the old UI. Live and lists use v3/live and v3/videos.
Search: header bar with autocomplete for channels, topics, orgs and pasted YouTube links. The page keeps its whole state in the URL and still reads old CSV-style links. It runs on v3 search.
Settings: language, theme, browsing, feed filters, blocked channels, reset, and configurable timezones for video timestamp tooltips. Common Asian zones and Paris have abbreviation mappings; other zones use browser formatting.
Theme: primary defaults to aqua-iro pink (#f06292), with 24 talent presets plus a custom picker. Surfaces are computed in OKLCH from the primary: the base hue is the cooler of its two triadic partners, which for pink gives Holodex's own sky blue. Settings can override all 31 colors, including opacity, separately for light and dark mode; individual colors or the active palette can be reset to computed defaults. The palette code is in src/lib/theme/palette.ts.
Watch: native Twitch IDs (tw:...) and supported Twitch links have a basic embedded player, with source-aware cards and menu links. The rest of the watch experience is still pending.
Build: the bundle visualizer produces stats.html; rollup-plugin-visualizer supports Rolldown despite its name. Editing dialogs load on demand, and cmdk-base replaced cmdk and its Radix dependencies.
i18n: all 20 existing locale files are used as they are; new strings went into en/ui.yml only and fall back to English elsewhere.
Things you should know
The Vue app moved to legacy/ as git renames, for reference only. It is not runnable from there, because the locales stayed at src/locales for Crowdin.
Unported routes (channels, multiview, playlists, about, TL tools, and non-Twitch watch pages) show a stopgap page linking to the same path on holodex.net.
Login page: a minimal one supports Google, Discord, and the Twitter return path. The user tried login and reported that it works.
Existing users: first run imports settings, org, theme and login from the old holodex-v2 localStorage. Also untested against real old data.
Comment search still uses v2/search/commentSearch (no v3 equivalent). That route times out on the local database after 30s, so I could not see results render.
Dropped: the husky pre-commit hook (it ran the old lint-staged config) and the playlist button in the header.
Not done yet
Service worker: the new build has none. Browsers that have the old UI's service worker will probably keep serving the cached Vue app after a deploy unless a self-unregistering sw.js ships.
CI: the PR workflow runs npm run lint:check, which doesn't exist in the new package.json yet. A serve alias is missing too.
Docs and editor config: README and .vscode/extensions.json still describe the Vue setup.
Unused shadcn components: some may still have no importers; the command component is now used by the org selector.
Performance: "All Vtubers" returns about 900 live cards; I haven't measured how that renders.
Small visual nit: the "Complement" label in the palette preview on Settings is truncated.
