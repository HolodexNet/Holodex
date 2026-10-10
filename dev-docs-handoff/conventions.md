# API Handoff: Shared integration contract

## Business Context
Holodex catalogs VTuber channels, streams, clips, relationships, translations, and song performances. This handoff describes the current local backend, including uncommitted changes, as reviewed on 2026-10-08. Examples are illustrative payloads, not captured production responses. Use the route coverage table in [index.md](index.md) to find the owning feature document.

## Transport and access
- Paths are relative to the configured API origin; the backend supplies `/v2` and `/v3` directly. A reverse proxy may add an outer prefix; do not assume one from this codebase.
- Send JSON with `Content-Type: application/json`. JSON scalars and arrays are accepted. Elasticsearch multi-search proxies accept `application/x-ndjson` (100 KiB); general JSON body limit is 20 MiB. URL-encoded bodies have a 100 KiB limit.
- Query parsing supports nested bracket notation and repeated values. Most multi-value GET filters expect comma-separated strings; exceptions are identified in feature docs.
- All v2/v3 routes pass through an API access gate, even login routes. Third-party clients should send a valid `X-APIKEY`. First-party same-origin requests and specific approved origins are allowed without it. A supplied invalid key fails even on an otherwise allowed origin.
- API access is separate from user authorization: JWT routes require `Authorization: Bearer <jwt>` as well as passing the API gate. JWT verification is case-insensitive for the Bearer scheme. Optional-JWT routes allow omission, but reject an invalid supplied token with 401.
- Calendar and static routes run before the API gate/rate limiter. `/favorites.ics` instead authenticates through `?key=<apiKey>`.
- CORS is registered globally, but no explicit credentialed cross-origin policy is configured. OAuth Twitter uses a session cookie; start it with browser navigation and retain cookies through the callback.

## Rate limits and errors
Versioned routes and channel redirects are limited to 80 requests per 120 seconds, keyed by forwarded IP plus API key. Non-GET requests with authorization starting with the exact uppercase string `BEARER` bypass this limiter; standard `Bearer` does not. Do not rely on this discrepancy as a client strategy.

Read `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (Unix seconds), and `Retry-After` (seconds on 429). The 429 body is plain text: `Too many requests. Maximum 80 reqs per 2 minutes`.

| Condition | Status | Body |
|---|---|---|
| Uncaught application error | Explicit status or 500 | `{"message":"..."}` |
| API key invalid | 403 | Plain text `Incorrect X-APIKEY` |
| API gate rejects unkeyed request | 403 | `{"error":"Illegal Access."}` |
| Missing JWT on required route | 401 | `{"message":"No authorization token was found"}` |
| Role middleware denies permission | 403 | `{"message":"Insufficient permissions"}` |
| Invalid limit | 400 | `{"error":"Invalid limit in query parameters. Must be a positive number not exceeding 100000"}` (body/params wording varies) |
| Blocked IP | 403 | Plain text `Forbidden` |

Some handlers return strings, numbers, booleans, arrays, upstream bodies, or empty responses. Decode by status/content type; do not unconditionally parse JSON. Assertions and ordinary `Error` throws often become 500, including validation/permission failures. There is no universal 422 contract. Unknown paths may return deployment-configured HTML, otherwise a 404 HTML/text response.

## Validation and caching
The global limit guard parses a supplied top-level `limit` using `parseInt`, requires 1–100000, and mutates it to a number. Although selected routes declare a page-size check of 100, that later check only runs on strings and is normally bypassed after global normalization. Use sensible small pages (25 by default), and do not promise the frontend that 100 is a consistently enforced maximum. Route-specific limits (such as v3 search's 50) still apply.

Production route caching is keyed by URL, not JWT/user. It replaces cache headers with `private, max-age=min(TTL / 4, 60 seconds)` after a JSON response. It is disabled in development; explicit route headers may then differ. User-scoped cached Musicdex discovery routes need backend remediation before relying on isolation: cache lookup precedes JWT validation. Avoid sharing their responses between users in the frontend, and see [musicdex.md](musicdex.md).

## Data Models / DTOs
Wire dates from SQL-backed responses normally serialize as ISO strings; search-index fields may be epoch milliseconds. Nullable database fields may appear as null or be omitted by tree-building. Backend table types are not strict response schemas. Use narrow frontend types and tolerate omitted optional fields and string-valued SQL counts/IDs.

```typescript
type Id = string | number; // preserve large IDs; do not coerce blindly
type Count = number | string;
type WireDate = string | number;
interface ChannelSummary {
  id: string; name: string; english_name?: string | null;
  type?: 'vtuber' | 'subber' | 'external';
  org?: string | null; suborg?: string | null; photo?: string | null;
}
interface Video {
  id: string; title?: string | null;
  type: 'stream' | 'clip' | 'placeholder' | 'legacy-placeholder';
  status: 'new' | 'live' | 'upcoming' | 'past' | 'missing';
  channel: ChannelSummary; topic_id?: string | null; lang?: string | null;
  available_at?: WireDate | null; published_at?: WireDate | null;
  duration?: number | null; songcount?: number | null;
  start_scheduled?: WireDate | null; start_actual?: WireDate | null;
  end_actual?: WireDate | null; live_viewers?: number | null;
  recent_live_tls?: string[] | null;
  mentions?: ChannelSummary[] | null;
  clips?: VideoRef[] | null; sources?: VideoRef[] | null;
  simulcasts?: VideoRef[] | null; refers?: VideoRef[] | null;
  description?: string | null;
}
interface VideoRef {
  id: string; title?: string; type?: Video['type']; status?: Video['status'];
  lang?: string | null; available_at?: WireDate; channel?: Partial<ChannelSummary>;
}
```

## Enums & Constants
| Values | Meaning |
|---|---|
| `vtuber`, `subber`, `external` | Talent, clipping/translation channel, external channel |
| `stream`, `clip`, `placeholder`, `legacy-placeholder` | Video categories; placeholders may represent off-platform events |
| `new`, `live`, `upcoming`, `past`, `missing` | Video lifecycle states |
| `refer`, `simulcast`, `clip` | Cross-video relationship types |
| `user`, `editor`, `admin` | User roles |
| `youtube`, `MChad`, `user` | Chat sources (case-sensitive) |

## Integration Notes
Keep the chosen API version explicit per operation. Normalize list containers at the client boundary, retain opaque cursors, and re-fetch after curation changes because projections/caches can lag. Do not prefetch GET routes marked as mutations. No deployment-level SLA or production response validation was performed for this handoff.

## Test Scenarios
1. Handle 403 API access separately from expired/missing JWT 401.
2. Handle plain text, JSON scalar, object, array, empty 204/304, and HTML errors.
3. Honor Retry-After and stop automatic retries on validation/permission failures.
4. Keep dates/counts and missing nested arrays compatible across v2/v3.
