# API Handoff: Static metadata, media, calendars, redirects

## Business Context
Public metadata powers organization/topic selectors, site counters, previews, avatars, and subscribable schedules. These routes run before the v2/v3 API gate and rate limiter. Responses include JSON, redirects, PNG streams, calendar text, and operational metrics in the utility document.

## Endpoints
| Method/path | Request | Success | Cache/errors |
|---|---|---|---|
| GET `/statics/orgs.json` | None | Organization rows `[{name,short,name_jp?,icon?}]` | public max-age=3600, s-maxage=6000 |
| GET `/orgs.json` | Alias | Same org response | Registered as exact GET by the route adapter |
| GET `/statics/orgsV2.json` | None | `[{name,name_jp,icon}]` | Same cache; subscriber-ranked ordering |
| GET `/statics/stats.json` | None | Stats object below | public max-age=360 |
| GET `/stats.json` | Alias | Same stats response | Registered as exact GET by the route adapter |
| GET `/statics/topics.json` | None | `[{id:string}]` | public max-age=3600, s-maxage=6000 |
| GET `/statics/channel/:id.json` | Channel ID | `{name,id,english_name,org,twitter,twitch,suborg}` | public max-age=3600; 404 status text |
| GET `/statics/oEmbed/:id.json` | Video ID | `{author_name,author_url,provider_name,provider_url}` | public max-age=3600; 404 |
| GET `/statics/channelImg/:id.png` | Channel ID | 302 avatar URL | Missing image mapped to 400 message |
| GET `/statics/channelImg/:id/:size.png` | size 50,100,150,200,250,300 | 302 resized avatar URL | Invalid size 403; processing failure 400 |
| GET `/statics/channelImg/:id/banner/:size.jpeg` | size code 1,2,3,4 | 302 banner URL | Invalid/missing banner 400 |
| GET `/layoutImage/:layout.png` | Encoded layout | PNG image stream | Invalid layout processing 400 |
| GET `/statics/layoutImage/:layout.png` | Same layout | PNG image stream | Same handler |
| GET `/live.ics` | `org?`, `topic?` comma string, `channelId?` or `channel?` comma string, `preferEnglishName?` | `text/calendar` | Public |
| GET `/favorites.ics` | Required `key=<apiKey>`, `preferEnglishName?` | `text/calendar` | Query key authenticates; invalid/missing key currently throws 500 |
| GET `/channel/@:handle/(.*)` | Handle + remainder | 302 `/channel/<canonicalId>/<remainder>` | API gate permits non-v paths; rate limited; unresolved falls through |

Trailing slashes are ignored globally. The route adapter converts nonempty-path `use(path, handler)` registrations into exact GET routes, so the legacy aliases do not handle arbitrary methods/descendants. Use canonical statics equivalents for new clients. Channel redirect syntax above is the source pattern; the adapter registers `/channel/@:handle/*` with a wildcard remainder.

## Data Models / DTOs
```typescript
interface SiteStats {
  generatedAt: number; // epoch milliseconds
  statistics: {
    dailyChannels: Record<string,string|number>;
    monthlyChannels: Record<string,string|number>;
    channelCount: Record<string,string|number>;
    dailyVideos: {count:string|number}; totalVideos: {count:string|number};
    totalSongs: {count:string|number};
  };
}
```

Illustrative org V2 response:

```json
[{"name":"Hololive","name_jp":"ホロライブ","icon":"UC_example"}]
```

Icon falls back to a channel ID; it is not guaranteed to be an image URL. oEmbed uses English author name when available but only returns provider/author metadata, not the full conventional oEmbed video HTML contract.

## Validation Rules / Business Logic
- Avatar requested sizes map onto upstream sizes 48,88,176. Banner codes select widths 960,1707,2276,2560. The banner lookup cache key omits size, so one size can affect responses for another within its 120-second cache lifetime. Let the browser follow redirects rather than decoding their declared image content type as bytes.
- Layout segments are comma-separated. First four characters encode x/y/w/h using `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.`; then an 11-character YouTube ID followed by optional channel label, or chat/twitch marker content. Grid coordinates map to a 24×24 space, rendered as 1024×512. Prefer frontend-produced existing share codes rather than inventing a parallel serializer. Example single cell: `AAYYabcdefghijkExample`.
- Public calendar includes live/upcoming/recent past streams and placeholders, available within the past 24 hours and an upcoming 168-hour horizon, capped at 100 videos. Favorites uses cached personalized schedule. Free-chat entries and videos lacking scheduled start are omitted.
- Calendar duration is video seconds or one-hour fallback. Placeholder certainty likely becomes TENTATIVE; certain becomes CONFIRMED. preferEnglishName uses query truthiness: even string `0` enables it.
- Static channel lookup is a subset, not the channel detail DTO. Stats counts can be strings and missing channel types should be treated as zero in presentation.

## Integration Notes
Use canonical statics URLs for shared selectors/previews and honor public caches. Calendar subscription URLs must preserve the query key, so avoid displaying/logging it as public text. Media routes may redirect; handle 400/403/404 with fallbacks. Failed handle resolution follows deployment fallback and may return HTML rather than a JSON API error. No static-feed socket updates are registered.

## Test Scenarios
1. Org icon fallback, empty topics, and string-valued counters.
2. Avatar/banner redirects, invalid size, and missing channel.
3. Calendar excludes unscheduled/free-chat entries and uses tentative placeholders.
4. Favorites key failure and encoded handle/layout paths.
