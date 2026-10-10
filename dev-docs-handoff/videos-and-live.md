# API Handoff: Videos and live schedules

## Business Context
Video browsing powers timelines, watch pages, clip discovery, and upcoming/live schedules. v2 reads materialized catalog data; v3 reads an indexed projection with cursor pagination. A clip's uploader differs from the talents mentioned in it.

## Endpoints
Auth for all routes below: API access gate; no user JWT required. Common failures are in [conventions.md](conventions.md).

| Method/path | Request | Success | Errors/notes |
|---|---|---|---|
| GET `/v2/videos` | Filters below | `Video[]`, or `{total,items}` with truthy `paginated` | Server cache 180 seconds |
| GET `/v3/videos` | Filters below plus `nextPage` | `{approximateTotal,items,nextPage?}` | Explicit max-age=180; no route cache |
| GET `/v2/videos/:id` | Optional `c=1`, `lang=en` | Full video; optional `comments`, `same_source_clips` | 404 `Video id <id> not found`; cache 180 seconds |
| GET `/v3/videos/:id` | Optional `c=1`, `lang=en` | Indexed full video; optional same additions | 404 `Video id not found`; cache 180 seconds |
| GET `/v2/live` | Common filters; defaults below | v2 list container | 400 if supplied status includes `past`; cache 120 seconds |
| GET `/v3/live` | v3 common filters | v3 list container | 400 on `past`; downstream failures sent with 500; cache 120 seconds |

Common list query:

| Field | Type/default | Behavior |
|---|---|---|
| `limit`, `offset` | Integer, 25 / 0 | Offset only v2; see global limit caveat |
| `sort`, `order` | `available_at`, `desc` | v2 supports `random`; v3 sorts indexed field plus ID |
| `id`, `status`, `type`, `lang` | Comma-separated strings; lang `all` | IDs, lifecycle, video categories, language filters |
| `channel_id` | String | Uploader ID, distinct from mentions |
| `mentioned_channel_id` | String | Mentioned talent ID |
| `org` | String | Involved organization; v2 `All Vtubers` removes filter |
| `topic` | String; v2 also array | Topic ID; v3 currently builds a single term filter |
| `from`, `to` | Date strings | Available-at range; v2 upper bound inclusive, v3 exclusive |
| `max_upcoming_hours` | Number | Upcoming horizon; live items survive horizon |
| `include` | Comma string or array | Adds optional fields; see below |
| `paginated` | Truthy query value, v2 only | SQL total can serialize as string; literal query `false` is also truthy |
| `include_external_channels`, `filter_hidden`, `analyzed` | v2 truthiness-based flags | GET strings are not uniformly converted to booleans; default external=true, hidden filtering=false |
| `nextPage` | Opaque v3 string | Send unchanged and URL-encode; reset when filters/sort change |

`include`: `mentions`, `clips`, `simulcasts`, `live_info`, `sources`, `refers`, `description`, `songs`; v2 also supports `channel_stats`. Detail routes enable their supported includes automatically. Recommendations are disabled, so do not expect `recommendations`.

Example v2 request: `GET /v2/videos?type=clip&lang=en&limit=25&offset=0&include=mentions,sources&paginated=1`.

Illustrative v3 list:

```json
{"approximateTotal":1,"items":[{"id":"abcdefghijk","title":"Live concert","type":"stream","status":"live","channel":{"id":"UC_example","name":"Example talent"},"available_at":1791504000000}]}
```

## Data Models / DTOs
Use `Video` and `VideoRef` from [conventions.md](conventions.md).

```typescript
type V2List = Video[] | { total: number | string; items: Video[] };
interface V3List { approximateTotal?: number; items: Video[]; nextPage?: string }
interface VideoDetail extends Video {
  comments?: { comment_key: string; message: string }[];
  same_source_clips?: Video[];
  involved?: { vtubers: string[]; orgs: string[] }; // index projection
}
```

## Business Logic & Edge Cases
- v2 live defaults: status `live,upcoming`, type `stream`, ascending available time, horizon 48 hours, limit 9999, hidden channel excluded. User filters override defaults; `live_info` is always included.
- v3 live defaults similarly, but limit 5000 and no corresponding forced hidden filter. v3 is not a drop-in replacement for v2.
- v2 broad catalog results suppress clips lacking mentions or marked with hidden language; clip-only lists exclude members-only clips. Targeted ID/channel/org paths have different suppression behavior.
- `c=1` adds at most 200 saved timestamp comments. A clip detail with `lang` and sources can add up to 24 clips from the same source videos.
- Placeholder metadata is flattened into v2 list fields, using metadata name as title. v3 returns its indexed projection. These IDs can be generated catalog IDs rather than YouTube IDs.
- v3 cursor generation compares total to current page length, not cumulative consumed count. A nonempty `nextPage` is not a guarantee of another nonempty page; stop on empty items and guard repeated cursors.
- v3's uploader filter currently supplies a scalar to an indexed `terms` query, and array topic filters are not consistently supported. Treat those filter combinations as requiring integration verification/backend correction.

## Integration Notes
Fetch the list, then detail only for selected items. Keep previous live cards visible while refreshing and distinguish missing schedules from ended streams. Poll no faster than the 120-second live route cache if expecting REST freshness. Chat/video socket updates are in [translations.md](translations.md). Re-fetch after editor mutations; immediate catalog convergence is not guaranteed.

## Test Scenarios
1. Empty list and detail 404 render independently.
2. v2 paginated and plain arrays normalize correctly; v3 cursor is retained unchanged.
3. `status=past` on live returns 400.
4. Placeholder without YouTube link does not launch an invalid YouTube player.
5. Detail `c=1` and language-specific related clips handle absent arrays.
