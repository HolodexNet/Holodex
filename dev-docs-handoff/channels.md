# API Handoff: Channel directory

## Business Context
Channels represent talents, clippers, and external uploaders. Channel pages combine their own uploads with clips/collaborations where they are mentioned. The route parameter may be a channel ID or a YouTube handle beginning with `@`.

## Endpoints
All routes require API access only, including bump.

| Method/path | Request | Success | Notes/errors |
|---|---|---|---|
| GET `/v2/channels` | `limit=25`, `offset=0`, `sort=org`, `order=asc`, optional `type`, `org`, `suborg`, `lang=all` | `ChannelListItem[]` | Cache 180 seconds |
| GET `/v2/channels/:id` | ID or `@handle` | Channel object with additional stored fields | 404 missing ID/handle; external channels excluded by ID; cache 2000 seconds |
| GET `/v2/channels/:id/videos` | Video query | v2 video list | Defaults type `clip,stream`; forces uploader channel; caller can override default type |
| GET `/v2/channels/:id/clips` | Video query | v2 video list | Forces `type=clip`, mentioned channel |
| GET `/v2/channels/:id/collabs` | Video query | v2 video list | Forces `type=stream,placeholder`, mentioned channel |
| POST `/v2/channels/:id/bump` | No body needed | 202 status text | Schedules recrawl by clearing crawl time; no guarantee channel exists; does not resolve handles |

Related-video routes cache for 180 seconds and accept filters described in [videos-and-live.md](videos-and-live.md). List sorting adds ID ascending as a tie-breaker. `org=All Vtubers` removes organization restriction. `suborg` filters the stored prefixed value, while `group` removes its first two characters. Non-all `lang` is comma-separated and also includes channels with null language.

Example: `GET /v2/channels?type=vtuber&org=Hololive&limit=25`.

```json
[{"id":"UC_example","name":"Example talent","english_name":null,"type":"vtuber","org":"Hololive","group":"Example group","photo":"https://example.invalid/avatar.jpg","subscriber_count":"100000","video_count":"250","clip_count":50,"inactive":false,"top_topics":["singing"]}]
```

## Data Models / DTOs
```typescript
interface ChannelListItem extends ChannelSummary {
  group?: string | null; twitter?: string | null; twitch?: string | null;
  video_count?: number | string | null; subscriber_count?: number | string | null;
  clip_count?: number | null; top_topics?: string[] | null;
  inactive?: boolean | null; extra_ids?: string[] | null;
}
// Detail is a superset; it can include description, banner, yt_handle,
// lang, view_count, published_at, created_at, updated_at and crawl fields.
```

## Validation Rules / Enums
Channel types are `vtuber`, `subber`, `external`. Prefer canonical IDs for mutations. Query limit uses the shared guard; there is no comprehensive sort-column allowlist in this route.

## Business Logic & Edge Cases
Handle resolution can fail with `{"message":"Channel Handle @... not found"}`. Detail-by-ID excludes external channels, while list and handle lookup do not apply that same exclusion. Mentioned clips/collabs are different from own uploads. Bump acceptance means the request ran, not that a new crawl finished.

## Integration Notes
Resolve a handle once, retain the canonical ID, then load the appropriate tab. Reuse channel summaries from lists and fetch detail lazily. Respect effective cache headers from [conventions.md](conventions.md); explicit max-age=1200 can be overwritten in production. No channel-specific real-time events are registered.

## Test Scenarios
1. ID and encoded `@handle` resolve to the expected page.
2. Missing/external detail renders 404.
3. Empty clips/collabs does not imply empty uploads.
4. Bump returns 202 and the UI shows queued rather than completed.
