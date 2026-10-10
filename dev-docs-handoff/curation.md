# API Handoff: Mentions, topics, and smart editing

## Business Context
Contributors attach talents and topics to videos. Editors/admins additionally curate relationships and perform bulk actions. A mention identifies a participant; simulcast relates simultaneous streams; refer is a directional cross-video reference.

## Endpoints
All pass API access. Reads need no JWT; all mutations below require JWT.

| Method/path | Request | Success | Permissions/errors |
|---|---|---|---|
| GET `/v2/videos/:id/mentions` | None | Channel summaries with `id,org,lang,name,type,photo,english_name,suborg` | Non-deleted mentions |
| POST `/v2/videos/:id/mentions` | `{channel_id:string}` | Numeric changed count | Any user; channel must be vtuber |
| DELETE `/v2/videos/:id/mentions` | `{channel_ids:string[]}` | Numeric changed count | Users remove their own mentions; editors/admins any |
| POST `/v3/mentions/get` | `{ids:string[]}` | `{[videoId]:[{id,name,english_name,org}]}` | Missing groups omitted, not empty arrays |
| POST `/v3/mentions/change` | `{videoIds:string[],mentions:[{id:string}],delete:boolean}` | Empty 204 | Editor/admin; failures sent as 400 serialized error |
| GET `/v2/topics` | None | `[{id,count}]` | Cache 120 seconds |
| GET `/v2/topics/search` | `q`, `limit=25`, `offset=0` | Full topic rows | Missing q throws generic error |
| GET `/v2/videos/:id/topic` | None | `{topic_id,topic_approver_id}` when found | No explicit 404 when absent |
| POST `/v2/topics` | `{id:string,regex_hint?:string|null}` | Full topic row array when regex provided; numeric result otherwise | Regex editing editor/admin only |
| POST `/v2/topics/video` | `{videoId:string,topicId?:string|null}` | JSON string `"OK"` | User can set empty topic or their own; editor/admin can clear/replace |
| PATCH `/v2/topics/:id/approve` | No body | Numeric changed count | Editor/admin only |

Smart routes share body `{videoIds:string[],pageVideoId?:string,pageChannelId?:string}` and require editor/admin claims plus a current stored role check. Each returns `{success:true,result:<below>}`; 401/403 use standard JSON message errors.

| POST path | Extra body fields | result |
|---|---|---|
| `/v3/smart/merge-participants` | None | `{updated_video_ids:string[],participants:[{channel_id,name}]}` |
| `/v3/smart/make-simulcast` | None | `{simulcast_group_id:string,group_size:number}` |
| `/v3/smart/make-refer` | None | `{links_created:number}` |
| `/v3/smart/dissociate-video` | `targetVideoId:string` | `{removed_count:number,target_video_id:string}` |
| `/v3/smart/dissociate-channel` | `channelId:string` | `{updated_video_count:number,channel_id:string}` |
| `/v3/smart/remove-mentions` | None | `{processed_count:number,mentions_removed_count:number}` |

## Data Models / DTOs
```typescript
interface Topic {
  id: string; creator_id?: string | number; approver_id?: string | number | null;
  regex_hint?: string | null; significance?: number;
  approx_popularity?: number | null; igdb_id?: string | null;
}
interface BulkMentionEdit { videoIds: string[]; mentions: {id:string}[]; delete: boolean }
```

Example bulk mention edit:

```json
{"videoIds":["abcdefghijk"],"mentions":[{"id":"UC_example"}],"delete":false}
```

Example smart edit:

```json
{"videoIds":["abcdefghijk","lmnopqrstuv"],"pageVideoId":"abcdefghijk"}
```

## Validation Rules / Enums
Use nonempty video/channel/topic IDs. Delete mentions requires a nonempty array. Simulcast needs at least two distinct existing stream videos, with every supplied video a stream. Refer allows at most four supplied videos. Missing arrays/IDs on several smart routes have no explicit schema validation and can become 500. Many v2 validation and role assertions also become 500.

## Business Logic & Edge Cases
- Bulk `/v3/mentions/change` currently inserts changes for **videoIds[0] only**, while marking all IDs for refresh. Do not describe it as a correct multi-video edit; submit one ID per request until fixed.
- Single add resurrects deleted mentions and records the current contributor. Ordinary-user deletes can succeed with count zero for someone else's mention.
- Topic assignment returns `"OK"` even when no row changed; read back to confirm. Ordinary users cannot clear topics and cannot overwrite another contributor's assignment.
- Creating a topic without a regex as editor/admin calls approval without forwarding the role, which can assert and return 500 after insertion. Avoid treating that error as proof no change happened.
- Merge participants unions talent participants and uploaders across selected videos, reviving/inserting missing mentions. Its returned participants may include uploader channels beyond the vtuber set used for insertions.
- Simulcast links every pair symmetrically. Refer links selected pairs directionally in both directions. Dissociate-video removes selected downstream relationships to target plus reverse simulcast relationships; it does not remove every possible reverse refer/clip link.
- Remove-mentions soft-deletes participants. Smart edits do not consistently invalidate cached/indexed video responses immediately.

## Integration Notes
Preview selected videos and exact action before posting. Preserve selections on failure; re-fetch canonical mentions/topic/detail after success or ambiguous failure. Do not use a returned zero count as permission confirmation. No curation-specific sockets are registered.

## Test Scenarios
1. Ordinary contributor can add a vtuber, but cannot delete another user's mention.
2. Editor role changes in storage cause smart 403 even with old editor JWT.
3. Bulk mention requests use one video and handle empty 204.
4. Non-stream simulcast and more than four refer targets return 400.
5. Topic set success with no change is detected by read-back.
