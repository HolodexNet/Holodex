# Holodex API handoff index

Generated from the current local holoapi backend on 2026-10-08. This directory documents the mounted client API, including local uncommitted changes. Examples are illustrative; no live requests or database mutations were performed. Read [conventions.md](conventions.md) first for access, response decoding, wire types, limits, and caching.

## Feature documents

| Feature | Handoff | Coverage |
|---|---|---|
| Shared contract | [conventions.md](conventions.md) | Transport, API access, JWT, rate limits, errors, caching, wire types |
| Videos and schedules | [videos-and-live.md](videos-and-live.md) | v2/v3 lists and detail, live/upcoming, pagination and includes |
| Channels | [channels.md](channels.md) | Directory, handles, uploads, clips, collaborations, recrawl |
| Accounts and favorites | [auth-and-favorites.md](auth-and-favorites.md) | Provider login/linking, JWT refresh, keys, favorites and personalized schedules |
| Saved video playlists | [video-playlists.md](video-playlists.md) | Create/save/delete, ordered videos and membership |
| Search and comments | [search-and-comments.md](search-and-comments.md) | v2/v3 search, autocomplete, raw/connector search, saved comments and renew |
| Curation | [curation.md](curation.md) | Mentions, topics, approvals, smart relationship actions |
| Placeholders | [placeholders.md](placeholders.md) | Events, external/scheduled streams, metadata and management auth |
| Translations | [translations.md](translations.md) | Archived/live chat, script edits/uploads, migration and Socket.IO |
| Songs and Musicdex | [musicdex.md](musicdex.md) | Song curation, playlists/radio, discovery, likes, stars, history and search |
| Reports and utilities | [reports-and-utilities.md](reports-and-utilities.md) | Moderation/contact, external notice, multiview tracking, debug and metrics |
| Public feeds and media | [static-feeds.md](static-feeds.md) | Organizations/stats/topics, images, oEmbed, calendars and redirects |

## Route coverage

131 explicit HTTP method/path registrations are covered below. Paths are relative to the API origin; trailing slashes are ignored. Auth/payload/response details belong to the linked feature document. Socket.IO subscriptions/events are covered by [translations.md](translations.md), separate from this HTTP inventory.

| Method | Mounted path | Handoff |
|---|---|---|
| GET | `/favorites.ics` | [static-feeds.md](static-feeds.md) |
| GET | `/live.ics` | [static-feeds.md](static-feeds.md) |
| GET | `/layoutImage/:layout.png` | [static-feeds.md](static-feeds.md) |
| GET | `/orgs.json` | [static-feeds.md](static-feeds.md) |
| GET | `/stats.json` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/orgs.json` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/orgsV2.json` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/stats.json` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/topics.json` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/channel/:id.json` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/channelImg/:id/:size.png` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/channelImg/:id.png` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/channelImg/:id/banner/:size.jpeg` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/layoutImage/:layout.png` | [static-feeds.md](static-feeds.md) |
| GET | `/statics/oEmbed/:id.json` | [static-feeds.md](static-feeds.md) |
| GET | `/v2/live` | [videos-and-live.md](videos-and-live.md) |
| GET | `/v2/channels` | [channels.md](channels.md) |
| GET | `/v2/channels/:id` | [channels.md](channels.md) |
| GET | `/v2/channels/:id/videos` | [channels.md](channels.md) |
| GET | `/v2/channels/:id/clips` | [channels.md](channels.md) |
| GET | `/v2/channels/:id/collabs` | [channels.md](channels.md) |
| POST | `/v2/channels/:id/bump` | [channels.md](channels.md) |
| GET | `/v2/videos` | [videos-and-live.md](videos-and-live.md) |
| GET | `/v2/videos/:id` | [videos-and-live.md](videos-and-live.md) |
| GET | `/v2/videos/:id/comments` | [search-and-comments.md](search-and-comments.md) |
| GET | `/v2/videos/:id/topic` | [curation.md](curation.md) |
| GET | `/v2/videos/:id/mentions` | [curation.md](curation.md) |
| POST | `/v2/videos/:id/mentions` | [curation.md](curation.md) |
| DELETE | `/v2/videos/:id/mentions` | [curation.md](curation.md) |
| GET | `/v2/videos/:id/chats` | [translations.md](translations.md) |
| POST | `/v2/videos/:id/chats` | [translations.md](translations.md) |
| PUT | `/v2/videos/:id/chats` | [translations.md](translations.md) |
| DELETE | `/v2/videos/:id/chats` | [translations.md](translations.md) |
| POST | `/v2/videos/:id/chatsBulk` | [translations.md](translations.md) |
| POST | `/v2/videos/placeholder` | [placeholders.md](placeholders.md) |
| DELETE | `/v2/videos/placeholder/:id` | [placeholders.md](placeholders.md) |
| POST | `/v2/videos/:id/scripteditor/log` | [translations.md](translations.md) |
| POST | `/v2/videos/es` | [search-and-comments.md](search-and-comments.md) |
| POST | `/v2/videos/es/search` | [search-and-comments.md](search-and-comments.md) |
| POST | `/v2/videos/es/autocomplete` | [search-and-comments.md](search-and-comments.md) |
| GET | `/v2/comments/search` | [search-and-comments.md](search-and-comments.md) |
| GET | `/v2/comments/renew/:videoId` | [search-and-comments.md](search-and-comments.md) |
| GET | `/v2/topics` | [curation.md](curation.md) |
| GET | `/v2/topics/search` | [curation.md](curation.md) |
| POST | `/v2/topics` | [curation.md](curation.md) |
| POST | `/v2/topics/video` | [curation.md](curation.md) |
| PATCH | `/v2/topics/:id/approve` | [curation.md](curation.md) |
| GET | `/v2/users/favorites` | [auth-and-favorites.md](auth-and-favorites.md) |
| PATCH | `/v2/users/favorites` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/users/playlists` | [video-playlists.md](video-playlists.md) |
| GET | `/v2/users/videos` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/users/live` | [auth-and-favorites.md](auth-and-favorites.md) |
| POST | `/v2/search/videoSearch` | [search-and-comments.md](search-and-comments.md) |
| POST | `/v2/search/commentSearch` | [search-and-comments.md](search-and-comments.md) |
| GET | `/v2/search/autocomplete` | [search-and-comments.md](search-and-comments.md) |
| POST | `/v2/search/channelSearch` | [search-and-comments.md](search-and-comments.md) |
| GET | `/v2/playlist/:id` | [video-playlists.md](video-playlists.md) |
| POST | `/v2/playlist` | [video-playlists.md](video-playlists.md) |
| DELETE | `/v2/playlist/:id` | [video-playlists.md](video-playlists.md) |
| GET | `/v2/video-playlist/:videoId` | [video-playlists.md](video-playlists.md) |
| PUT | `/v2/video-playlist/:playlistId/:videoId` | [video-playlists.md](video-playlists.md) |
| DELETE | `/v2/video-playlist/:playlistId/:videoId` | [video-playlists.md](video-playlists.md) |
| GET | `/v2/user/login/twitter` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/user/login/twitter/callback` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/user/login/twitter/musicdex` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/user/login/twitter/callback/musicdex` | [auth-and-favorites.md](auth-and-favorites.md) |
| POST | `/v2/user/login` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/user/check` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/user/refresh` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/user/createKey` | [auth-and-favorites.md](auth-and-favorites.md) |
| POST | `/v2/user` | [auth-and-favorites.md](auth-and-favorites.md) |
| GET | `/v2/debug/chat_status` | [reports-and-utilities.md](reports-and-utilities.md) |
| GET | `/v2/debug/live_cache` | [reports-and-utilities.md](reports-and-utilities.md) |
| POST | `/v2/external/notice` | [reports-and-utilities.md](reports-and-utilities.md) |
| POST | `/v2/songs/latest` | [musicdex.md](musicdex.md) |
| PUT | `/v2/songs` | [musicdex.md](musicdex.md) |
| DELETE | `/v2/songs` | [musicdex.md](musicdex.md) |
| GET | `/v2/songs/record/:id` | [musicdex.md](musicdex.md) |
| GET | `/v2/songs/record/:channel_id/:video_id` | [musicdex.md](musicdex.md) |
| GET | `/v2/songs/top20` | [musicdex.md](musicdex.md) |
| GET | `/v2/songs/hot` | [musicdex.md](musicdex.md) |
| GET | `/v2/songs/:id` | [musicdex.md](musicdex.md) |
| POST | `/v2/reports/video/:id` | [reports-and-utilities.md](reports-and-utilities.md) |
| POST | `/v2/reports/channel` | [reports-and-utilities.md](reports-and-utilities.md) |
| POST | `/v2/reports/contact` | [reports-and-utilities.md](reports-and-utilities.md) |
| GET | `/v2/multiview/record/:link` | [reports-and-utilities.md](reports-and-utilities.md) |
| GET | `/v2/musicdex/playlist` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/playlist/:id` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/playlist/:playlistid/likeCheck` | [musicdex.md](musicdex.md) |
| DELETE | `/v2/musicdex/playlist/:id` | [musicdex.md](musicdex.md) |
| POST | `/v2/musicdex/playlist` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/playlist/:playlistid/:songid` | [musicdex.md](musicdex.md) |
| DELETE | `/v2/musicdex/playlist/:playlistid/:songid` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/radio/:id` | [musicdex.md](musicdex.md) |
| POST | `/v2/musicdex/search` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/discovery/org/:org` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/discovery/org/:org/playlists` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/discovery/channel/:channelId` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/discovery/favorites` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/discovery/favorites/playlists` | [musicdex.md](musicdex.md) |
| POST | `/v2/musicdex/elasticsearch/search` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/history` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/history/:id` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/like` | [musicdex.md](musicdex.md) |
| POST | `/v2/musicdex/like` | [musicdex.md](musicdex.md) |
| DELETE | `/v2/musicdex/like` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/like/check` | [musicdex.md](musicdex.md) |
| GET | `/v2/musicdex/star` | [musicdex.md](musicdex.md) |
| POST | `/v2/musicdex/star` | [musicdex.md](musicdex.md) |
| DELETE | `/v2/musicdex/star` | [musicdex.md](musicdex.md) |
| GET | `/v2/tlutil` | [translations.md](translations.md) |
| POST | `/v2/tlutil/migrate/check` | [translations.md](translations.md) |
| POST | `/v2/tlutil/migrate/claim` | [translations.md](translations.md) |
| GET | `/v2/tlutil/search` | [translations.md](translations.md) |
| POST | `/v2/tlutil/updateCustomLink` | [translations.md](translations.md) |
| POST | `/v3/search/videoSearch` | [search-and-comments.md](search-and-comments.md) |
| GET | `/v3/search/autocomplete` | [search-and-comments.md](search-and-comments.md) |
| POST | `/v3/mentions/change` | [curation.md](curation.md) |
| POST | `/v3/mentions/get` | [curation.md](curation.md) |
| GET | `/v3/videos` | [videos-and-live.md](videos-and-live.md) |
| GET | `/v3/videos/:id` | [videos-and-live.md](videos-and-live.md) |
| PUT | `/v3/videos/:id/script` | [translations.md](translations.md) |
| GET | `/v3/live` | [videos-and-live.md](videos-and-live.md) |
| POST | `/v3/smart/merge-participants` | [curation.md](curation.md) |
| POST | `/v3/smart/make-simulcast` | [curation.md](curation.md) |
| POST | `/v3/smart/make-refer` | [curation.md](curation.md) |
| POST | `/v3/smart/dissociate-video` | [curation.md](curation.md) |
| POST | `/v3/smart/dissociate-channel` | [curation.md](curation.md) |
| POST | `/v3/smart/remove-mentions` | [curation.md](curation.md) |
| GET | `/channel/@:handle/*` | [static-feeds.md](static-feeds.md) |
| GET | `/clusterMetrics` | [reports-and-utilities.md](reports-and-utilities.md) |

## Scope and known gaps

- Covered: every explicit registration reachable from the client API calendar/statics/v2/v3/redirect roots, plus the directly registered cluster metrics route. Framework-generated HEAD/OPTIONS and Socket.IO transport internals are not separate product contracts.
- Not mounted: tag/rotation routes, bot routes, and commented-out v3 comment search. Their source presence does not make them available endpoints.
- Other backend processes (image service, Discord bot, crawlers, scheduler) are outside this frontend client-API handoff. Deployment proxy prefixes, ingress restrictions, provider configuration and upstream service schemas require environment-specific verification.
- Important current-code limitations: bulk mentions edits only the first video; favorite discovery caching can bypass JWT and cross user boundaries; empty favorite video filters can broaden results; playlist saves have inconsistent concurrency handling; several GET routes mutate state. These are documented as existing behavior, not fixed by this documentation change.
- The checked-in OpenAPI inventory is not a payload schema and can lag local routes (including cluster metrics). The mounted source graph is authoritative for this handoff.

## Refresh and verification

Run `node handoff/verify-coverage.cjs` from the repository root to verify local links, route mapping, and documented route names against source without starting the server. After updating feature contracts, run `node handoff/verify-coverage.cjs --write-index` to regenerate the route table. Re-review auth, DTOs, handlers, controller behavior, and caches on backend changes; inventory verification alone does not validate payload correctness.
