# API Handoff: Live translations and script editing

## Business Context
Translations combine archived YouTube chat, third-party translations, user-submitted scripts, and live Socket.IO messages. Use absolute epoch milliseconds for chat timestamps and seconds for video_offset. Default chat responses omit message IDs; script editing requires mode=1.

## Endpoints
Every HTTP route passes the API gate. `identity` means optional valid JWT, falling back to the X-APIKEY owner's identity; omission of both is 401. For v2 chat paths, `:id=custom` selects `?custom_video_id=<string>` instead of a catalog video.

| Method/path | Auth | Request | Success/errors |
|---|---|---|---|
| GET `/v2/videos/:id/chats` | API access | Query below | Chat rows ascending; cache 30 seconds |
| POST `/v2/videos/:id/chats` | identity | `?lang=en`; message payload below | `{res:number,id:string}` |
| POST `/v2/videos/:id/chatsBulk` | identity | `?lang=en`; message array | Array of insertion results; partial writes possible |
| PUT `/v2/videos/:id/chats` | identity | `?lang=en`; `{id,timestamp,message,duration?}` | Updated row array |
| DELETE `/v2/videos/:id/chats` | identity | `?cid=<messageId>` | Deleted row array |
| POST `/v2/videos/:id/scripteditor/log` | identity | `?lang=en`; transaction array | Result array, or `{type:"Err",res:...}` at 200 |
| PUT `/v3/videos/:id/script` | JWT | `ScriptUpload` below | `{success,updatedCount,insertedCount,errors:[]}` |
| GET `/v2/tlutil` | JWT effectively required | `limit=20,offset=0,video_id?` | `[{video_id,custom_video_id,title,lang,entry_count}]` |
| GET `/v2/tlutil/search` | Optional JWT | `limit=20,offset=0,query?,lookback_hours=6,creator_id?,lang=en` | `[{custom_video_id,lang}]` |
| POST `/v2/tlutil/updateCustomLink` | JWT | `{oldId,newId,lang}` | Numeric affected count, scoped to current creator |
| POST `/v2/tlutil/migrate/check` | Optional JWT | `{Room,Pass}` | `{archives:[{video_id,count}],mchad_user_id}` |
| POST `/v2/tlutil/migrate/claim` | JWT | `{Room,Pass}` | Numeric reassigned count |

GET chat defaults: `lang=en`, `tl=1`, `moderator=1`, `verified=0`, `vtuber=1`, `after=0`, `limit=20`, `mode=0`; optional `before`, `creator_id`. Owner messages are always included; selected category flags are ORed. Nonzero after returns all matching messages at/after timestamp without applying limit. Without after, select latest limit rows then return them ascending. before is exclusive. Nonzero mode switches to editor fields and permits creator_id filtering.

## Data Models / DTOs
```typescript
interface ChatRow {
  name: string; timestamp: number; message: string;
  id?: string; channel_id?: string | null; duration?: number | null;
  source?: 'MChad' | null; video_offset?: number | string | null;
  is_tl?: boolean; is_owner?: boolean; is_moderator?: boolean;
  is_verified?: boolean; is_vtuber?: boolean;
}
interface ScriptUpload {
  sourceId: {video_id?:string;custom_video_id?:string}; lang: string;
  messages: {id:string;name:string;timestamp:number;message:string;video_offset:number;duration?:number}[];
}
```

Example POST chat body:

```json
{"name":"Example translator","timestamp":1791504000000,"message":"Welcome to the stream!","source":"user","duration":3000}
```

Example v3 script body:

```json
{"sourceId":{"video_id":"abcdefghijk"},"lang":"en","messages":[{"id":"5faf6bfa-62b0-4c23-9e95-fc1ebc3b0ad","name":"Example translator","timestamp":1791504000000,"video_offset":0,"message":"Welcome!"}]}
```

The v3 route's path ID is not consulted; body sourceId is authoritative. video_offset is accepted in the type but ignored/computed on reads. Send exactly one source identifier to avoid ambiguous filtering.

Transaction entries are `{type:"Add",data:{tempid,name,timestamp,message,duration?}}`, `{type:"Change",data:{id,timestamp,message,duration?}}`, or `{type:"Delete",data:{id}}`. Results have `type,id,res` and Add also `tempid`; the top-level generated result ID is a correlation identifier, not necessarily the saved message ID. Use Add's nested `res.id` and read back.

## Validation Rules / Enums
Translation languages: `ja,ko,zh,es,ru,en,id,tl,tc`. Submission source is `user` or `MChad`; youtube is forbidden. Name must be nonempty. Non-broadcast transaction-log Add requires timestamp >1262307600000 and <now+12 hours. Broadcast submission can infer missing timestamp as server time. High-security streams require approved creator IDs.

## Business Logic & Edge Cases
v2 submissions deduplicate nearby YouTube/user translations by normalized text and timestamp proximity. PUT/DELETE ordinary users act on their own translations; editor/admin can override, while owner/moderator/verified messages are protected. Most v2 write failures are caught and sent as 500 plain text. Bulk/transaction entries execute concurrently and are not all-or-nothing; transaction failures can return an error object at HTTP 200.

v3 upload upserts client IDs, restricts existing updates to editable translation rows, and records per-message errors. HTTP 200 can mean `success:false`; inspect errors/counts and retain unsaved messages. Database errors inside the transaction may still cause a whole-request failure. This upload does not broadcast each message through the live chat emitter.

Custom translation search can return groups with null custom_video_id because it does not exclude ordinary videos. Migration checks verify MChad credentials; claiming reassigns legacy creator-1 messages to the logged-in user.

## Real-time protocol
Use Socket.IO with `transports:['websocket']` on the API server; default path `/socket.io`. No JWT/API-key gate is attached to these socket subscriptions. This is not a raw WebSocket JSON API.

```typescript
socket.emit('subscribe', {video_id: 'abcdefghijk', lang: 'en'});
socket.on('subscribeSuccess', ({id,live_viewers,status,start_actual,handled_chats}) => { /* optional status */ });
socket.on('subscribeError', ({id,message}) => { /* show disconnected/unavailable */ });
socket.on('abcdefghijk/en', payload => { /* chat, video update, or status */ });
socket.emit('unsubscribe', {video_id: 'abcdefghijk', lang: 'en'});
// unsubscribeSuccess: {id}
```

Dynamic room event payloads can be chat `{name,timestamp,message,video_offset?,flags...,source?,duration?}`, status `{type:'end'|'error'|'info'|'update',message?}`, or video updates `{live_viewers,status,start_actual}`. Requested showModerator/showVerified subscription flags are ignored. A subscribeSuccess with only id does not establish that a stream is live or actively handled.

## Integration Notes / Test Scenarios
Subscribe, fetch archived chat, merge messages carefully, and resubscribe after reconnect. REST backfill can overlap socket messages, and standard payloads may lack IDs, so deduplicate without dropping distinct same-time messages. Unsubscribe when switching video/language. Honor timestamp units; duration lacks a documented universal wire-unit guarantee in the backend and should be validated with the consuming player before playback timing depends on it.

1. Default versus editor chat shapes and before/after boundaries.
2. Invalid language, protected row, expired JWT, and security-mode denial.
3. Partial bulk/upload errors leave failed local edits recoverable.
4. Custom source, migration check/claim, and own custom-link update.
5. Reconnect, unsubscribe, id-only subscription success, and end/error events.
