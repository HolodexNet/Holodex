# Talent home experiment — attempt-3-channel-try-2

## Design plan

Make the canonical channel URL a useful starting point for a new viewer. Give the talent a strong identity with their existing banner and avatar, then answer what to watch before showing an archive. Carry that identity into the directory. Preserve the existing token-based palette, name preferences, iconx icons, English i18n fallback and source-aware video cards.

## Final implementation

- `/channel/:id` opens Overview. `/videos`, `/clips`, `/collabs` and `/about` retain the deeper, paginated browsing views; Music opens Musicdex. Canonical channel IDs from the channel response drive all related requests.
- The watch panel prioritizes a currently live stream, earliest upcoming stream, latest past upload, recent language-matching clip, then recent collaboration. The label describes that source exactly; nothing claims editorial approval. Missing/unwatchable entries and non-stream event placeholders do not become archive recommendations. Placeholders retain the shared card's event/dialog behavior.
- The overview reads the first 24 results of each archive using the existing query cache. It shows three recent uploads, three clips, three collaborations and a music card only when the recent uploads have song metadata or an explicit music topic. The rest of the music catalog remains available via Musicdex. Empty shelves disappear.
- The side rail uses the existing channel description, linked topics and available catalog totals. The description is text; About retains its safe URL linkification. No new talent facts, fan links, backend fields, curated IDs or editor configuration are introduced.
- The organization schedule uses the existing shared, two-minute live-query cache and selects this channel's own streams. A schedule error has a retry action rather than implying that the talent has no schedule. Clip languages and blocked uploaders are respected. The watch image follows the hide-thumbnail preference; placeholder hiding also applies to the schedule.
- Directory cards share the profile's banner treatment, offset portrait, topic tags and explicit Explore channel link. Existing organization grouping, sorting, list mode and pagination remain. Missing banners use geometric theme gradients; missing portraits use the existing initials fallback; absent counts remain unknown.
- Phone layouts stack the watch panel and shelves, keep the tabs horizontally scrollable and let identity/actions wrap. With no archive results, the introduction and Musicdex cards expand into a balanced two-column desktop layout instead of leaving a blank main column.
- Carries forward migration compatibility fixes from `8ff53796` (`/channels`, `/org/:org/channels`, organization selector) and locale-safe number/date formatting from `15d2d583`.

## Validation

Production build (`npm run build`) and ESLint focused on changed TypeScript files. No tests were added and no unit or e2e suite was run. Browser visual review uses a dedicated tab at port 8092, desktop 1440 × 1100 and phone 390 × 844. Real API data: Natsuiro Matsuri profile and Hololive directory. Sparse review temporarily removes optional profile metadata and then archive results locally; these overrides are restored before the final build and commit. No account mutations are part of review.

Screenshots are saved outside the repository in the managed worktree's sibling `visual-review` directory. See final chat links for the exact artifacts.

Final checks: production build and focused ESLint passed; `git diff --check` is clean. Loaded screenshots confirmed the real upcoming-stream panel, latest-upload fallback without a schedule, topic/music/collaboration metadata, directory grid, phone tab overflow and empty-state official-channel action. Sparse review also forced a broken avatar URL to inspect initials. A long-name phone wrapping issue found during review was corrected by giving identity its own row before actions. Temporary overrides are absent from the delivered source. Screenshots capture viewport content to avoid lazy off-screen cards appearing blank in full-page captures.

## Limits

User-requested visual correction: removed the decorative directory and biography preheadings and redundant watch-panel tagline. Factual stream/upload labels and the recent-music description use ordinary sentence-case text without letter spacing or all-caps styling.

Overview recommendations summarize the first loaded archive page, not an exhaustive or curated career introduction. The clip sample may be empty when none of those 24 results match the viewer's language preferences; the deeper tab keeps pagination available. Music detection does not infer genre or musical identity. Organization schedules can include a large response for independent channels. Social destinations, watch routes and account actions use existing app behavior. Existing build warnings about bundle size and Tailwind sourcemaps are unchanged.
