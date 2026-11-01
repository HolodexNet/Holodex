# Musicdex integration

Musicdex uses the existing Holodex session, organization selection, language,
channel naming preference, blocked channels, and favorite channels. It has no
separate settings store or UI dependencies.

## Routes and navigation

| Route | Purpose |
| --- | --- |
| `/music` | Music discovery for the selected organization |
| `/music/org/:org` | Shareable organization music home |
| `/music/favorites` | Music discovery from favorite channels and liked songs |
| `/music/search` | Music search with independent URL filters |
| `/music/browse/sgp` | Generated organization playlists |
| `/music/browse/ugp` | Community organization playlists |
| `/music/radios` | Organization radio catalog and saved radios |
| `/music/liked` | Paginated liked songs |
| `/music/playlists` | Owned Musicdex playlists and starred playlists/radios |
| `/music/playlist/:id` | Playlist playback and owner editing |
| `/music/radio/:id` | Radio playback |
| `/channel/:id/music` | Channel music overview and songs |
| `/channel/:id/music?songs=all` | Channel's paginated song catalog |

Musicdex playlists retain their string identifiers and `/api/v2/musicdex`
endpoints. They do not use Holodex's saved-video playlists or `/playlists` route.
Generated IDs must be encoded as a single path segment. The sidebar provides
floating menus for owned Musicdex playlists and starred playlists/radios.

The header switches between music and video search according to the current
route, with an explicit scope menu. Music queries never populate video search
state. Organization switching remains in music while browsing music pages.

Channel music has its own artist layout: five popular performances (expandable
to ten), latest streams, one combined featuring shelf, and up to ten related
artists. It does not render `DiscoverySections`. Full song browsing is an
explicit view, and the search shortcut opens music search filtered to the artist.

## API behavior

The client and DTOs live in `src/lib/musicdex/`. React Query keys begin with
`musicdex`; private data includes the current user ID. Requests share Holodex's
rate-limit budget. See `dev-docs-handoff/musicdex.md` for the backend contracts.

Search sends newline-terminated NDJSON to
`/api/v2/musicdex/elasticsearch/search`. The proxy can return JSON without a
content-type header, so this response is parsed explicitly. Search covers song
and artist names, exact channels, organization, multiple suborganizations,
music-video/stream type, dates, and ordering. Pagination respects the search
index's 5,000-result window.

Personalized discovery endpoints are not used because the handoff documents a
server cache isolation problem. The favorites home composes public discovery
from the shared favorite channel list, with additional channels loaded in batches.

Playlist writes send song IDs and the session's exact owner ID type. Creation,
editing, and incremental additions read back canonical state. Editing checks the
latest server snapshot before saving and retains the draft on conflicts. The
backend does not provide an atomic concurrency guarantee.

## Listening surfaces

The presentation lives in `src/components/music/music.css`, using Holodex's
theme tokens. `MusicArtwork` gives mixes, radios, and missing artwork distinct
treatments. Collection cards and the featured mix share `PlayPlaylistButton`,
which loads through the same user-scoped query cache as the detail page. The
player keeps its iframe mounted when moving between the dock and listening view;
the upcoming queue moves alongside the video on desktop and below it on phones.

## Playback

`src/stores/music-player.ts` owns the current performance, queue, priority queue
entries, playback history, repeat/shuffle state, and radio source. The globally
mounted player retains its YouTube iframe across route and display-mode changes.
It plays song start/end segments, supports seeking, volume, expanded/native
fullscreen modes, queue removal, and radio replenishment. Playback and radio
errors expose recovery controls. Play history is recorded after playback starts.
Logging out or switching accounts clears playback and its queue.

The app shell reserves the playback bar's height and positions mobile navigation,
selection controls, and notifications around it. Large song lists reveal rows in
batches while retaining the entire list for playback.

## Verification

Use `npm run build` and `npm run lint` for static verification. No tests were
added for this migration, per the requested scope. Signed-in mutation flows need
an authenticated session for browser verification.
