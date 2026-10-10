# API Handoff: Songs and Musicdex

## Business Context
Songs are timestamped performances within videos. Musicdex organizes them into user playlists, generated playlists/radios, likes, stars, discovery pages, and play history. Song IDs are strings (generally UUIDs), Musicdex playlist IDs are strings, and neither is the numeric saved-video playlist ID.

## Song endpoints
All routes pass API access; JWT is required for PUT/DELETE. Optional JWT on legacy record routes still rejects invalid tokens.

| Method/path | Request | Success / errors |
|---|---|---|
| POST `/v2/songs/latest` | `{org?,channel_id?,video_id?,q?,offset?:0,limit?:25,paginated?:boolean}` | Song array or `{total:number|string,items:Song[]}` |
| GET `/v2/songs/hot` | `org?`, `channel_id?` | Ranked song array; channel falls back to latest 20 if empty; cache 600 seconds |
| GET `/v2/songs/:id` | Song ID | Song object when found; missing has no explicit 404; cache 10 seconds |
| PUT `/v2/songs` | Song write below, JWT | Numeric changed count |
| DELETE `/v2/songs` | `{id,video_id}`, JWT | Numeric deleted count |
| GET `/v2/songs/record/:id` | Optional JWT | 200 `{"error":"Deprecated API"}` |
| GET `/v2/songs/record/:channel_id/:video_id` | Optional JWT | 200 disabled/deprecated message |
| GET `/v2/songs/top20` | None | 200 disabled/deprecated message |

Despite an older comment, video_id is only applied with channel_id, and offset/limit are still applied. org takes precedence over channel_id/video_id. q is a case-insensitive song-name substring.

## Musicdex endpoints
All paths below are prefixed `/v2/musicdex`. `JWT` is required user auth; reads with optional JWT validate a token if supplied.

| Method/path | Auth | Request | Success / errors |
|---|---|---|---|
| GET `/playlist` | JWT | None | Own playlist stubs (owner not selected in this list) |
| GET `/playlist/:id` | Optional JWT | Optional `If-Modified-Since` | Full playlist with song objects; 304 unchanged, 404 missing, 401 unlisted access |
| POST `/playlist` | JWT | `MusicPlaylistWrite` | Array of saved playlist rows (content IDs) |
| DELETE `/playlist/:id` | JWT | None | Numeric deleted count; 401 non-owner |
| GET `/playlist/:playlistid/likeCheck` | JWT | None | Boolean array aligned with playlist song order; same visibility rule |
| GET `/playlist/:playlistid/:songid` | JWT | None | Plain text `OK`; **adds song** |
| DELETE `/playlist/:playlistid/:songid` | JWT | None | Plain text `OK`; removes song |
| GET `/radio/:id` | API access | Encoded generator ID | Generated radio with song content when available |
| POST `/search` | API access | Any | 404 plain text `Sorry, this endpoint has been deprecated` |
| POST `/elasticsearch/search` | API access | NDJSON multi-search | Raw search-response stream |
| GET `/like` | JWT | `page=1` | `{page_count:number,content:Song[]}`; 50 per page |
| POST `/like` | JWT | `{song_id:string}` | Plain text `OK` |
| DELETE `/like` | JWT | `{song_id:string}` | Plain text `OK` |
| GET `/like/check` | JWT | `song_id` comma-separated | Boolean array in requested order |
| GET `/star` | JWT | None | Starred playlist stubs |
| POST `/star` | JWT | `{playlist_id:string}` | Plain text `OK` |
| DELETE `/star` | JWT | `{playlist_id:string}` | Plain text `OK` |
| GET `/history` | JWT | None | Playlist object: `id:"<userId>-history",title:"Recently Played",type:"history",owner:1,listed:false,content:Song[]` |
| GET `/history/:id` | Optional JWT | Song ID | 201 status text; **records play**, including anonymous tracking |
| GET `/discovery/org/:org` | API access | Organization | Discovery object |
| GET `/discovery/org/:org/playlists` | API access | Required `type=sgp|ugp|radio`, `offset` | `{items:PlaylistStub[],total:number}`, up to 100 |
| GET `/discovery/channel/:channelId` | API access | Channel ID | Discovery object |
| GET `/discovery/favorites` | JWT (cache caveat below) | None | Personalized discovery |
| GET `/discovery/favorites/playlists` | JWT (cache caveat below) | Required type, offset | `{items,total}`, up to 100 |

Discovery GETs cache for 180 seconds. Discovery object includes `version:1`, `channels`, `recommended:{playlists:[]}`, and optional `recentSingingStreams:[{video,playlist?}]`. A singing stream can be present without its generated playlist. org/channel discovery recommendations are randomized; missing sections are legitimate.

## Data Models / DTOs
```typescript
interface Song {
  id: string; channel_id: string; video_id: string; name: string;
  start: number; end: number; // seconds within the video
  itunesid?: string | number | null; art?: string | null; amUrl?: string | null;
  available_at?: string | null; original_artist?: string | null;
  creator_id?: string | number; approver_id?: string | number;
  status?: string | null; is_mv?: boolean | null;
  channel?: {name:string;english_name?:string|null;photo?:string|null};
}
interface MusicPlaylistWrite {
  id?: string; title: string; description?: string;
  type: string; owner: string | number; listed: boolean;
  content: string[]; updated_at?: string;
}
interface MusicPlaylist {
  id: string; title: string; type: string; owner?: string | number;
  listed: boolean; created_at?: string; updated_at: string;
  description?: string | null; art_context?: unknown; content?: Song[];
}
```

Song write sends id, channel_id, video_id, name, start, end and optional itunesid, art, amUrl, available_at, original_artist. Example:

```json
{"id":"5faf6bfa-62b0-4c23-9e95-fc1ebc3b0ad","channel_id":"UC_example","video_id":"abcdefghijk","name":"Example song","start":90,"end":240,"original_artist":"Example artist","available_at":"2026-10-09T01:00:00Z"}
```

Example playlist creation:

```json
{"title":"Favorites for karaoke","type":"ugp","owner":42,"listed":true,"content":["5faf6bfa-62b0-4c23-9e95-fc1ebc3b0ad"]}
```

## Validation Rules / Enums
Playlist discovery categories: ugp=user-created, sgp=non-user/non-radio generated types, radio=types prefixed radio. Generator IDs can contain brackets/comma-separated key=value parameters, e.g. `:video[id=abcdefghijk]`; URL-encode the whole ID as one path segment. Prefer IDs returned by discovery over inventing generator parameters. Song status is not constrained by a frontend-facing enum here.

No comprehensive song timestamp/name validation is performed. Mirror sensible nonnegative start/end order in UI, without claiming backend enforcement. Ordinary users may overwrite only songs they created; editor/admin can overwrite any. Delete ordinary-user non-owned rows can return zero. DB/assertion errors often become 500.

## Business Logic & Edge Cases
- Playlist owner comparisons for save are strict equality; match the runtime user ID type. Existing-owner or freshness failures use ordinary errors and can return 500 rather than 403/409.
- Save's stale comparison checks a stored date against request updated_at without normalizing the JSON string. Concurrency protection is unreliable; preserve a draft and re-fetch before replacing server edits.
- Full playlist reads expand stored song IDs to objects; save expects IDs. Do not post expanded Song[] as content.
- Unlisted playlists are readable by owner or when owner is 1 (system owner); otherwise 401. Conditional 304 is checked before visibility in the controller. Do not assume If-Modified-Since is an authorization check.
- Incremental add appends without deduplicating; remove removes matching song IDs. Both handlers send OK even if the owner-scoped update touched no rows. Confirm with read-back.
- Likes/stars are idempotent on duplicate insert. Invalid/missing identifiers can yield 400 or assertion-generated 500. Like listing uses ascending creation order; history uses ascending timestamps and limits 50 rather than a guaranteed newest-first order.
- Personalized discovery route cache is keyed only by URL and executes before JWT validation. A cache hit can bypass user validation and serve another user's cached discovery. Treat these two routes as blocked for reliable private integration until fixed; client-side user caches cannot repair backend isolation.
- `All_Vtubers` is special-cased only in part of org discovery; other branches use the supplied string as a real org. Do not assume the video-query `All Vtubers` sentinel works throughout discovery.

## Integration Notes
Browse discovery → load returned playlist/radio → play Song start/end within video → record history on an intentional play. Do not prefetch add-song/history GET mutations. Likes/stars may use optimistic UI with rollback; full playlist saves should await success and then read canonical state. Do not cache unlisted or user playlists across accounts. No Musicdex-specific socket stream is registered.

## Test Scenarios
1. Public/unlisted/system-owned playlist visibility and conditional 304.
2. Save IDs instead of expanded content; strict owner type and concurrent edits.
3. Duplicate add versus idempotent like/star, permission no-op, and empty playlist.
4. 50-item like pagination, anonymous history, missing discovery sections.
5. Deprecated endpoints render unsupported UI rather than success.
