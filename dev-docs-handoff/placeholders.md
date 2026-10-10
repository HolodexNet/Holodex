# API Handoff: Event placeholders

## Business Context
Placeholders represent expected YouTube streams, off-platform streams, and events before a real catalog video exists. The frontend sends structured title metadata, while browsing returns flattened metadata. Generated placeholder IDs are not guaranteed to be playable YouTube IDs.

## Endpoints
| Method/path | Auth | Request | Success/errors |
|---|---|---|---|
| POST `/v2/videos/placeholder` | API gate; optional JWT; management `?token=` or JWT editor/admin or API key identity | `PlaceholderWrite` | Array of saved rows; alternatively duplicate object or validation string at HTTP 200 |
| DELETE `/v2/videos/placeholder/:id` | API gate + JWT editor/admin | No body | Plain text `OK`; permission assertions can become 500 |

```typescript
interface PlaceholderWrite {
  id?: string; channel_id: string; liveTime: string; duration?: number;
  title: {
    name: string; jp_name: string; link: string; thumbnail: string;
    placeholderType: 'scheduled-yt-stream'|'external-stream'|'event';
    certainty: 'certain'|'likely';
    credits: { discord?: Credit; datasource?: Credit; bot?: Credit; editor?: Credit };
  };
}
interface Credit { link?: string; name?: string; user?: string }
```

Example creation:

```json
{"channel_id":"UC_example","liveTime":"2026-10-10T03:00:00Z","duration":3600,"title":{"name":"Upcoming concert","jp_name":"","link":"https://example.invalid/event","thumbnail":"","placeholderType":"event","certainty":"certain","credits":{"editor":{"name":"Example contributor"}}}}
```

Saved rows include `id,description,title,channel_id,start_scheduled,duration,type,status,updated_at,topic_id`. Duplicate response: `{"error":"Failed - Another Placeholder already exists here.","placeholder":{...}}`. No uniform success envelope exists.

## Validation Rules
Creation requires an existing vtuber channel, liveTime not more than one day in the past, name length 3–100 inclusive (error text says 4–100), link length ≥5, and no negative nonzero duration. Missing title fields can throw rather than yield structured field errors. A blocked video link also errors. Enum values above are payload conventions; not all are checked at runtime.

## Business Logic & Edge Cases
Duplicate check considers non-missing YouTube-platform entries within ±15 minutes on the channel. Scheduled YouTube placeholders or matching placeholderType return a duplicate object at 200. Short links return a string at 200. Other caught creation failures return 400 plain text. A management-token verification failure is 401 plain text.

Providing id means update and must match an existing placeholder under that channel. Updates merge credits/metadata, append provenance description, preserve live/upcoming status or reset other status to upcoming, and do not run all creation checks. API key identity creation does not enforce the JWT branch's editor/admin role restriction. Token expiry is 1200 seconds (20 minutes), despite an outdated inline comment saying two minutes.

## Integration Notes
Validate locally, post, then inspect response type and error property before marking success. Re-fetch schedules after success; insertion/update queues projection refresh. Deletion should await server confirmation. Avoid optimistic schedule cards with guessed catalog IDs. No placeholder-specific real-time events are registered.

## Test Scenarios
1. Valid event creation returns saved-row array.
2. Nearby duplicate and short link return HTTP 200 but must render an error.
3. Unknown channel, stale liveTime, invalid name, negative duration produce errors.
4. Update merges credits; expired token gives 401.
