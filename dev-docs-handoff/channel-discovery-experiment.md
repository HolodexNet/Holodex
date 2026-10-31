# Experiment 1: a directory for discovering a stream

Branch: `attempt-3-channel-try-1`. Based on `attempt-3-channels`, including the URL and novelty-locale follow-ups.

## Plan

Make the directory a destination for finding a VTuber to watch. Start with a clear invitation, show factual schedule signals, then provide name/topic/group search and facets over the entire selected organization. Keep the token palette, existing avatar fallbacks, iconx icons, channel actions, name preference, and English i18n fallback. Preserve the migration's profile implementation.

## Design and data decisions

- A quiet, palette-derived hero, overlapping real live talent avatars, and live/upcoming talent counts establish a discovery destination. These counts describe the selected organization's tracked schedule, independently of directory filters. A dash means unknown.
- The default Current view excludes channels explicitly marked inactive. Archived contains exactly those marked inactive; it does not infer graduation or retirement. Live and Upcoming views can include inactive channels if the schedule actually lists their streams.
- Live first is the default order, followed by upcoming and then names. Name, group, and subscriber ordering are available. No editorial picks or fabricated popularity claims.
- Cards show avatars, original/English names, organization/group, up to three metadata topics, and the live or next upcoming title. Stream actions and profile actions are separate. Unknown schedules and absent schedules have distinct language; neither claims a channel is offline.
- Grid cards use an avatar overlapping a token gradient. List rows prioritize identity and the stream. Topic chips apply the directory facet. Quick topic suggestions skip format tags (`shorts`, `membersonly`); card topics place these after content topics, while the full topic facet preserves them. No description or banner is required.
- The full directory loads sequentially in 100-channel pages with abortable requests through the existing request budget. Search and facets run on all accumulated records; loading and failure messages clearly identify partial results. Completion requires the final short/empty page. Only 48 matched cards render initially; Show more reveals additional matches without affecting filtering.
- Facets derive from loaded metadata and expand as loading progresses. Language appears only if returned data supplies it (or a language is already in the URL); no language is guessed from a name or organization. Null languages do not match a specific language filter.
- Search normalizes Unicode and matches all typed words against names, organization, group, handles when supplied, and topics. Filters, order, status, and view are shareable URL parameters. Changing organization clears incompatible discovery facets and exits organization aliases to `/channel?org=...`.
- Schedule selection maps only the uploader ID, never mentioned collaborators. Live takes precedence; otherwise select the earliest tracked upcoming stream. Prior-organization placeholder data and failed refreshes are withheld rather than shown as current signals. Existing API normalization drops stale unstarted streams. Schedule polling remains every two minutes.
- New strings live in English YAML and fall back through the existing i18n system. Count and Intl locale helpers support novelty language IDs. All decorative colors derive from theme tokens; live red uses the existing live token.
- Phones show search, organization, and a horizontal topic shortcut row immediately. The Filters disclosure exposes group, topic, language when supplied, and ordering without making the first screen a wall of controls. Status and grid/list controls remain available. The hero suppresses overlapping avatar decoration on narrow screens to preserve room for schedule counts.
- Included the baseline profile identity-row wrapping fix for long names at phone widths; no other profile redesign in this experiment.

## Validation

Production `npm run build` passes (TypeScript project build plus Vite). Focused ESLint passes for `src/pages/channels.tsx`, `src/lib/channel-queries.ts`, and the inherited profile change in `src/pages/channel.tsx`. `git diff --check` passes. Build retains the existing large-chunk and Tailwind source-map warnings. No unit/e2e tests were added or run; no account mutations were performed.

Reviewed screenshots in the isolated in-app browser at 1440×1000 desktop and 390×844 phone sizes, plus the default desktop viewport. The phone hero overflow found during review was corrected; mobile facets now use a disclosure and the four status choices fit the row.

Actual local API data:

- Hololive: all 138 records loaded, with 106 current records during review. Live badges, next schedules, titles, avatars, and direct watch/profile actions appeared with actual schedule records. Counts changed as the two-minute refresh updated the schedule.
- Global: all 3,799 records loaded, with 2,917 current records during review. Loading visibly reported accumulated records and incomplete results. Name search found both Kiara channels after completion, rather than searching the initial page. Empty search results showed a useful Clear filters action.
- Kizuna Ai Inc.: all four records loaded, three current and one archived. No group or language facets were invented. The archived Alleles Project record exercised the real missing-avatar initials fallback. Grid and list screenshots show a valid directory without live/upcoming streams.
- Phone: reviewed the hero, condensed controls, expanded facets, live grid cards and their stream/profile buttons. The inherited profile row wrapping fix is included from the baseline follow-up.

Screenshots are in [`../artifacts/channel-discovery/`](../artifacts/channel-discovery/). `desktop-discovery.jpg`, `desktop-cards.jpg`, `phone-discovery.jpg`, and `phone-cards.jpg` show the final main views. Supporting captures cover sparse/list/archived/empty data and global loading/unavailable schedules.

## Copy correction

Copy correction: removed the decorative all-caps eyebrow entirely, shortened the introduction to describe the available controls, and changed decorative result labels to “Matching channels” / “VTuber channels.” Meaningful headings and factual schedule/status labels remain. No replacement tagline.

Focused desktop and 390×844 phone screenshots confirmed the corrected header; `desktop-discovery.jpg` and `phone-discovery.jpg` were refreshed. No tests were run for this copy/removal update.

## Limits

The local global schedule request failed during visual review and remained unavailable after a manual retry; Hololive's organization schedule succeeded. The global directory still completed and remained searchable, but honestly showed unknown live/upcoming status, an unavailable message, and Retry. Live/upcoming filter counts also remain unknown until a schedule is confirmed. No streams or statuses were fabricated to fill that gap.

All-directory filtering requires sequential background loading; large catalogs or the shared API request budget can delay completeness. The UI deliberately shows partial coverage until every page is loaded and stops on errors until Retry. Metadata facets only offer fields supplied by the directory response, so language was absent in the reviewed datasets. Top topics reflect metadata rather than a curated editorial taxonomy. Schedule counts describe tracked uploader channels (including organization channels), not concurrent viewer counts or total channel activity.
