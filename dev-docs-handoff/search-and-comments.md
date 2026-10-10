# API Handoff: Search and saved comments

## Business Context
Search finds catalog videos, talent channels, and saved timestamp comments. Saved comments are curated/crawled YouTube comments, separate from live chat translations. v3 video search exposes an Elasticsearch result rather than the v3 browsing list container.

## Endpoints
All require API access. Optional JWT is attached only to v2 video/comment search; invalid supplied JWT fails 401.

| Method/path | Request | Success | Notes/errors |
|---|---|---|---|
| POST `/v2/search/videoSearch` | `V2Search` | `Video[]` or `{total:number,items:Video[]}` | `paginated` controls container |
| POST `/v2/search/commentSearch` | V2Search filters plus required `comment:string[]` | Video results with `comments` array, or `{total,items}` | Only comment[0] is used for text matching; conditions are ignored |
| POST `/v2/search/channelSearch` | `{queryText,type?,limit?:30,offset?:0}` | `[{id,name,english_name}]` | Sorted subscriber count descending |
| GET `/v2/search/autocomplete` | `q` string | `[{type,value,text}]` | Up to 30 results |
| POST `/v3/search/videoSearch` | `V3Search` | Raw search response: `hits`, `aggregations`, `took`, etc. | limit>50 throws ordinary Error → 500 |
| GET `/v3/search/autocomplete` | `q`, `n` default 5, `t` optional | `{vtuber?:[],topic?:[],any_channel?:[]}` | Default keys vtuber + topic; `t` selects one key |
| POST `/v2/videos/es` | NDJSON multi-search body | Raw multi-search response stream | Preserve final newline and Content-Type |
| POST `/v2/videos/es/search` | `{query,options}` Search UI connector state/config | Connector result | Backend caps generated size at 24 |
| POST `/v2/videos/es/autocomplete` | `{query,options}` | Connector autocomplete result | Connector-defined contract |
| GET `/v2/videos/:id/comments` | `limit=25`, `offset=0` | `[{comment_key,message}]` | Cache 300 seconds; unknown video can return empty |
| GET `/v2/comments/search` | Required `q`, `limit=25`, `offset=0` | `[{video_id,comment_key,message}]` | 400 `Missing query paramter (q)` |
| GET `/v2/comments/renew/:videoId` | Required JWT | Numeric uploaded comment count | 400 plain text for throttle, non-stream, or crawl failure |

## Data Models / DTOs
```typescript
interface V2Search {
  sort?: 'newest' | 'oldest' | 'longest';
  lang?: string[]; target?: string[]; conditions?: {text?: string; tag?: string}[];
  topic?: string[]; vch?: string[]; org?: string[];
  paginated?: boolean; offset: number; limit: number;
}
interface V3Search {
  q?: { search: string; description?: string; org?: string[]; vtuber?: string[];
    type?: string[]; topic?: string[]; lang?: string[]; uploader_id?: string;
    from?: string | number; to?: string | number; has_song?: 'none'|'one'|'many'; advanced?: string };
  tags?: string[]; facet?: string[];
  sort: 'latest'|'oldest'|'score'|'longest'|'shortest'|'views';
  search_after?: unknown[]; offset: number; limit: number;
}
```

Example v2 request:

```json
{"sort":"newest","target":["stream","clip"],"conditions":[{"text":"concert"}],"lang":["en"],"paginated":true,"offset":0,"limit":25}
```

Example v3 request and minimal illustrative result:

```json
{"q":{"search":"concert","type":["stream"],"has_song":"many"},"sort":"latest","offset":0,"limit":25}
```

```json
{"took":2,"timed_out":false,"hits":{"total":{"value":0,"relation":"eq"},"hits":[]},"aggregations":{}}
```

Use `hits.hits[]._source` as video data and retain each hit's `sort` array if using search_after. This response is different from `{items,nextPage}` on GET v3 videos. Proxy/connector endpoints are passthrough integration surfaces; their complete external-library schema is not declared in this backend. Their fields should remain opaque unless your frontend already uses that connector.

## Validation Rules / Enums
Use nonempty q/queryText for useful searches, positive integer limits, and nonnegative offsets. v3 search should use at most 50. V2 `conditions[].tag` is unimplemented and ignored. V3 supports typed query `q` or encoded `tags` such as `search:concert`, `type:stream`, `has_song:one`; q takes precedence. Autocomplete t supports `vtuber`, `topic`, `any_channel`, and the implemented `clipper` selector; unsupported values are not consistently rejected.

## Business Logic & Edge Cases
V2 conditions and requested involved channels are ANDed; multiple requested organizations are also ANDed by the implementation, despite an older comment describing OR. Topic/language lists use membership. V3 song filters map none to 0, one to 1, many to ≥2. No browser cursor decoding is needed for GET lists; POST search uses its separate array cursor.

Renew is a GET mutation that crawls only streams and throttles each video for 10 minutes. It returns after upstream processing, so it may take longer than ordinary reads. It does not invalidate every saved-comment/detail cache immediately.

## Integration Notes
Debounce autocomplete, discard out-of-order responses, and reset pagination on filter changes. Use paginated JSON booleans for POST v2 search. Avoid optimistic search results and disable duplicate renew clicks. There are no search-specific sockets.

## Test Scenarios
1. Empty autocomplete/search and incomplete nested video fields.
2. Missing comment q produces 400; excessive v3 search size currently produces 500.
3. V2 versus v3 response containers are handled separately.
4. Renew on clip or repeated stream request returns 400; never prefetch renew.
