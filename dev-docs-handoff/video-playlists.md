# API Handoff: Saved video playlists

## Business Context
Users maintain ordered lists of catalog videos. These numeric-ID playlists differ from Musicdex song playlists: names, request shapes, membership methods, and IDs are incompatible.

## Endpoints
API access gate applies to all routes. JWT is required except public detail.

| Method/path | Request | Success | Errors |
|---|---|---|---|
| GET `/v2/users/playlists` | JWT | Own summaries with `id,name,user_id,video_ids,updated_at` | Shared auth errors |
| GET `/v2/playlist/:id` | Public after API gate | `{id,name,user_id,videos:[...]}` | 404 `Video id not found` (message refers to playlist lookup) |
| POST `/v2/playlist` | JWT; `{id?,user_id,name,video_ids}` | Numeric playlist ID | 421 status text on user mismatch; 403 if supplied existing ID is not owned |
| DELETE `/v2/playlist/:id` | JWT | Numeric deleted count | Non-owned/nonexistent ID can return zero |
| GET `/v2/video-playlist/:videoId` | JWT | `[{id,name,contains:boolean}]` | Shared errors |
| PUT `/v2/video-playlist/:playlistId/:videoId` | JWT; no body | Boolean `true` | 400 `Permission Denied`; duplicate add can fail |
| DELETE `/v2/video-playlist/:playlistId/:videoId` | JWT; no body | Boolean `true` | 400 `Permission Denied` |

Example save request:

```json
{"user_id":42,"name":"Watch later","video_ids":["abcdefghijk","lmnopqrstuv"]}
```

## Data Models / DTOs
```typescript
interface SaveVideoPlaylist { id?: number; user_id: number; name: string; video_ids: string[] }
interface VideoPlaylistDetail { id: number; name: string; user_id: string | number; videos?: Video[] }
interface VideoPlaylistStub { id: number; name: string; user_id: string | number; video_ids: string[] | null; updated_at: string }
```
Detail contains nested `videos`, despite an internal return annotation mentioning `video_ids`. User summary previews contain only entries whose order is less than four; do not treat them as full playlist content.

## Validation Rules / Business Logic
Send the logged-in user's numeric ID as `user_id`. Updating replaces all membership/order, drops unknown video IDs, and deduplicates supplied IDs while preserving order. These writes are sequential and are not wrapped in a transaction; a failed request may leave a partial save. Incremental add appends after maximum order; remove does not renumber entries. There is no private/listed flag on video playlist reads.

## Integration Notes
Fetch summaries → detail → membership picker. For reorder, submit the complete ID list and re-fetch detail after save. Keep a local draft on failure; avoid optimistic full replacement because filtering and partial writes affect the final result. No playlist-specific real-time events or HTTP cache middleware are configured.

## Test Scenarios
1. Create returns an ID; detail contains ordered video objects.
2. Update drops unknown IDs and duplicates; summary is only a preview.
3. Owner mismatch gives 421/403; membership permission failure gives 400.
4. Empty playlist/delete-zero state renders correctly.
