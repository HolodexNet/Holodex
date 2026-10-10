# API Handoff: Login, account, favorites

## Business Context
Users sign in through Google, Discord, or Twitter, then save favorite channels and browse their schedules. An already-authenticated login can link a new provider to the existing account. API keys authorize API access and are separate from login JWTs.

## Endpoints
Every endpoint still passes the shared API gate. `JWT` below means a required user token; `optional JWT` rejects invalid supplied tokens.

| Method/path | Auth | Request | Success |
|---|---|---|---|
| POST `/v2/user/login` | Optional JWT | `{service:"google"|"discord"|"twitter",token:string}` | `{user:User,jwt:string}` |
| GET `/v2/user/login/twitter` | API gate, OAuth session | Browser navigation | Redirect to Twitter |
| GET `/v2/user/login/twitter/callback` | API gate, OAuth session | Provider callback query | Redirect to UI `/login?jwt=<temporary>&service=twitter` |
| GET `/v2/user/login/twitter/musicdex` | API gate, OAuth session | Browser navigation | Twitter login for Musicdex |
| GET `/v2/user/login/twitter/callback/musicdex` | API gate, OAuth session | Provider callback query | Musicdex UI login redirect |
| GET `/v2/user/check` | JWT | None | User row |
| GET `/v2/user/refresh` | JWT | None | `{user,jwt}`; 401 plain text if user no longer exists |
| GET `/v2/user/createKey` | JWT | None | Numeric affected-row count, typically `1`; rotates key |
| POST `/v2/user` | JWT | `{name:string}` | Numeric affected-row count |
| GET `/v2/users/favorites` | JWT | None | Favorite channel summaries |
| PATCH `/v2/users/favorites` | JWT | `FavoriteOperation[]` | Updated favorite summaries |
| GET `/v2/users/videos` | JWT | v2 video query | v2 video list container; max-age=30 |
| GET `/v2/users/live` | Optional JWT | `channels` comma-separated IDs or logged-in favorites; optional `includePlaceholder` | Cached live video array; max-age=30 |

Example favorites patch:

```json
[{"op":"add","channel_id":"UC_example"},{"op":"remove","channel_id":"UC_other"}]
```

Illustrative login response:

```json
{"user":{"id":"42","username":"Example user","role":"user","api_key":"example-api-key","contribution_count":0},"jwt":"<signed-login-token>"}
```

## Data Models / DTOs
```typescript
interface User {
  id: string | number; username: string; role: 'user' | 'editor' | 'admin';
  api_key?: string | null; contribution_count?: number | string;
  created_at?: string; google_id?: string | null;
  discord_id?: string | null; twitter_id?: string | null; yt_channel_key?: string | null;
}
interface FavoriteOperation { op: 'add' | 'remove'; channel_id: string }
```
Favorite summaries include ID/name/English name/photo/type, subscriber/video/clip counts, twitter, org, inactive, group. Stored provider identifiers are returned in user rows; do not render the full object indiscriminately.

## Validation Rules
Provider service is one of `google`, `discord`, `twitter`. Google token is an ID token; Discord token is an OAuth access token; Twitter token is the short-lived callback JWT, not a Holodex login JWT. Username must be nonempty; no route-level maximum is implemented. Many provider/assertion failures surface as 500, not a uniform 400.

## Business Logic & Edge Cases
- JWT expiration is configured as `180d`; temporary Twitter JWT lifetime is 100 seconds. Exchange it promptly using POST login.
- Supplying a current JWT links an unknown provider identity. If it already belongs to another Holodex account, login asserts and fails rather than merging accounts.
- The link-new-provider branch creates a new JWT with role `user`; a privileged account can receive downgraded token claims until refresh restores its stored role.
- createKey is a GET mutation. It returns a row count, not the generated key: after success, fetch `/v2/user/check` and update API access credentials. Prior key validation can remain cached for up to 10 minutes.
- Duplicate favorite adds are ignored. Unknown operation names are ignored. Adds/removes are issued concurrently, so do not send contradictory operations for the same channel in one batch.
- `/v2/users/live` returns 400 plain text `No "channels" included in parameters and not logged in` without channels or user. Explicit channels override favorites.
- Empty logged-in favorite lists passed to `/v2/users/videos` do not create a channel restriction in the shared video query; the result can be a broad catalog list. Handle empty favorites in the UI before fetching.
- The API gate's login exception references `/v2/login`, whereas registered login routes are `/v2/user/login`. Third-party OAuth entry/callback access therefore needs deployment verification; a browser navigation cannot simply attach an X-APIKEY header.

## Integration Notes
Complete provider exchange → store JWT → fetch account/favorites. Use refresh for renewed credentials; clear user-scoped caches on account changes. Favorites toggles may be optimistic with rollback, but re-fetch the returned canonical list. Key rotation and provider linking should wait for success before updating the UI. There is no logout/revocation endpoint in the mounted routes; local logout clears credentials.

## Test Scenarios
1. New/returning login, provider linking, and conflicting linked accounts.
2. Missing/expired JWT gives 401; bad API key gives 403.
3. Empty favorites does not render unrelated videos as favorites.
4. Key rotation is followed by account fetch; it is never prefetched.
5. User live supports explicit channels without JWT and rejects omission of both.
