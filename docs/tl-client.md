# TL Client

`/tlclient` is a full-window page for translating a stream as it happens. Each line goes to TLdex and, through the Holodex+ extension, into the stream's own chat. Concerts and group collabs were the main cases it was designed for.

## Session

The session lives in the address: `?video=<main>&collab=<a>&collab=<b>&lang=en`. `video` accepts a YouTube link or ID, the old `YT_<id>` form, a Twitch link, or any other text. The catalog decides the room. A stream it knows posts to its own TLdex room. Anything else goes to a custom room named by exactly what was entered, which matches what the old client did, so existing custom rooms keep working.

Collab streams are other POVs of the same event, and every line is posted to each of their rooms as well. The setup screen and the Streams popover suggest the main video's `simulcasts`.

## Layout

- Header: stream, status, Streams popover, language, player/chat toggles, shortcuts, settings.
- Left column: the player (optional, with its sound on) above the room feed. The feed shows everyone's lines, and this session's own lines show their delivery state, Retry, Edit and Delete.
- Right column: the chats lines are typed into. They stay mounted when hidden, because the extension can only type into a chat that exists.
- Composer, full width: the speaker strip, the input, and destination toggles.

## Keyboard

| Keys | Action |
|---|---|
| Enter | Send. Ignored while an IME is composing. |
| Tab / Shift+Tab | Next / previous speaker. Slot 0 is skipped, so two-person dialogue is one key. Can be turned off in settings. |
| Alt+1 | No speaker (Alt+0 too, where the old client kept it). |
| Alt+2–9 | Pick a speaker by its number; up to 8 speakers. Top-row digits only: Alt+numpad is how Windows types characters such as ♪. AltGr is ignored. |
| ↑ from an empty box | Edit your last line. ↑/↓ step through lines while editing. |
| Esc | Cancel editing, or clear the box. |

Typing while nothing editable has focus goes into the composer. Clicking the player hands it the keyboard, and moving the pointer back onto the page returns it. Chats are left alone, because someone typing into one by hand means to; the composer shows a "keyboard is in the chat" cover instead.

Speakers are prefix/suffix pairs (`Pekora: `, `♪ … ♪`). "Add participants" makes one for each channel in the stream. Profiles from the old client (`tldex-profiles`) carry over on first run.

## Timing

A line is stamped with when typing started, not when it was sent, so archived subtitles line up with speech. Drafts older than a minute are stamped when sent. **Exception:** when the line is also typed into the YouTube chat of a stream Holodex indexes, it is stamped when sent. TLdex's listener picks up the chat copy and matches it to the posted line by text within ±5 s of its own (arrival) time, so a backdated line would be stored twice.

## Chat relay (Holodex+)

`src/lib/tlclient/relay.ts` implements the old client's protocol: `postMessage({ n: "HolodexSync", d })` to the chat iframe, with `d: "Initiate"` once, 5 s after a YouTube chat loads (immediately for Twitch). There is no acknowledgement, so a relay is only ever requested. Lines sent before the handshake are queued and typed in one second apart, in order. A copy longer than the chat's limit (YouTube 200, Twitch 500, counted in code points) is not relayed: it isn't cut off or split, because a split copy would be stored in TLdex as extra lines. The composer counts down near the limit.

## Backend behaviour this relies on

Read from `holoapi/src/apps/client-api/{routes/v2/videos/chats.ts,controllers/live_chat_controller.ts}`:

- **POST** `/v2/videos/:id/chats` returns `{ id }`; `res` is always undefined on Postgres. It stores the timestamp sent. In catalog rooms it **deduplicates** identical normalized text within ±5 s. When it does, it answers with the *existing* row's id, which may be another translator's, and skips the socket broadcast. Custom rooms skip deduplication.
- **Retry** posts again with the same text and timestamp. In catalog rooms, an attempt that landed after all is folded in rather than stored twice.
- **PUT** updates only the caller's own `source='user'` rows in that `lang`, and returns the **number of rows changed**: 0 at status 200 when the id isn't yours. It also rewrites `timestamp`, so the original is sent back. Nothing is broadcast, so live viewers keep the old text.
- **DELETE** checks ownership the wrong way round: `...(override && { creator_id })` limits editors and admins to their own lines but lets ordinary users delete any TL line in the room by id. The client therefore confirms each id with a no-op PUT, which does check ownership, and only deletes ids it confirms. Copies folded into someone else's line are marked `merged` and left alone.
- Post languages are limited to `ja, ko, zh, es, ru, en, id, tl, tc`. The viewer's `TL_LANGS` includes `vi`, which TLdex would reject, so the TL client offers only the postable ones.
- Rate limit: every post counts against the shared 70-per-2-minutes client budget (the server allows 80). One line to three rooms is three requests. The old client sent `BEARER` in uppercase, which happens to skip the server's limiter.

## Not done

- Only this session's lines can be edited. `GET …/chats?mode=1&creator_id=<me>` returns ids, so earlier lines could be made editable too.
- Not yet exercised in a browser or against the real API, and the relay is untested with the current Holodex+.
