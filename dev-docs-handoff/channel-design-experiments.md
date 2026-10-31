# Channels migration and independent design experiments

The shared migration ports next's React organization directory and channel profiles into attempt-3's Vite / React 19 / Base UI / zustand app. Source references: `next:packages/react/src/routes/{orgChannels,channel}.tsx`, channel subroutes, ChannelSocials, and channel.service.

## attempt-3-channels — migration

Grouped organization directory, grid/list modes, group/subscriber/view sorting, pagination, favorites, block controls, profile banners, uploads, mentioned clips/collaborations, Musicdex, and About. Use existing theme tokens, name preferences, clip languages, query infrastructure, and video components. Missing banners use a theme gradient; missing avatars use initials; absent stats stay unknown. Channel handles resolve to canonical IDs for related requests. No new editor fields are required.

## attempt-3-channel-try-1 — discovery directory

Goal: help a visitor find a talent to watch now, without requiring knowledge of generations or subscriber rankings. Build a polished directory with a distinct discovery header, live/upcoming signals, name search, topic/language/group facets, clear active/archived treatment, and useful grid/list cards. Make loaded-versus-complete filtering honest and ensure controls find channels across the directory, not just the first page. Give live cards a direct route to the stream and preserve a separate profile route. Use existing channel, live schedule, photo, group and top-topic data; no invented popularity or editorial claims. Improve profile continuity where useful. Keep mobile controls usable and empty states actionable. Document the plan and final decisions in the branch.

## attempt-3-channel-try-2 — talent profile / viewer starting point

Goal: make a channel feel like a talent's home, with an immediate useful answer to what a new fan should watch. Build a visually distinctive profile around identity, live/next stream, recent uploads, clips, music and collaborations, with a readable overview and deeper tabs. Use existing banner/avatar/topic/description/video metadata to produce a complete default; show factual labels for fallback choices (latest upload, recent clip) instead of claiming they are editor picks. Optional curated profile fields may add a short introduction, accent or approved image, starter video IDs and fan links, but must use a concrete adapter/config and documented editor contract. Hide absent optional sections cleanly; never require unimplemented backend fields or fabricate personal facts. Include a directory treatment that leads into the profile. Document the plan and final decisions in the branch.

## Validation scope

Migration validation: production build and focused ESLint passed. Visually inspected the Hololive directory and Shirakami Fubuki profile with real existing data, including the 390 × 844 phone layout. No tests were added or run; no account changes were made. Existing build warnings concern the shared bundle size and Tailwind sourcemaps.

Do not add tests or run unit/e2e suites. Run the production build and focused lint/type checks as needed. Use browser screenshots only to assess visual quality at desktop and phone widths, with existing data and a sparse-data case. Do not make account mutations during visual review. Commit and push each branch individually, without merging experiments together.
