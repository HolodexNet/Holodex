# Video editing

One video's topic, participants and songs, for anyone logged in. `/edit/video/:id` is a separate top-level route outside the app shell, like multiview: authoring songs wants the whole window, and music pauses because the video has audio of its own.

People get here from **Edit video** on any video's menu, or **Edit one at a time** in the selection tray, which steps through the basket with next and previous and returns to the feed at the end.

## Who can do what

The server enforces all of this. The client only mirrors it so that people aren't invited to do something that will fail.

| | Logged out | User | Editor / admin |
| --- | --- | --- | --- |
| Topic, when there is none | Read only | Set | Set |
| Topic they set themselves | | Change, not clear | Change, clear |
| Topic someone else set | | Locked, says why | Change, clear |
| Add a participant | | Yes | Yes |
| Remove a participant they added | | Yes | Yes |
| Remove one someone else added | | Refused, says why | Yes |
| Add a song | | Yes | Yes |
| Change or remove a song they added | | Yes | Yes |
| Change or remove someone else's song | | Locked, says why | Yes |
| Smart group edits | | No | Yes |

These live in `lib/permissions.ts` as capabilities plus `canEditSong` and `canChangeTopic`. Two facts shape the UI:

- `GET /v2/videos/:id/topic` says who set a topic, so a locked topic is known up front.
- Nothing says who added a mention. A removal that isn't allowed succeeds with a count of 0, so the UI offers it, reads the count, explains, and remembers the refusal for the session.

## Addresses

```
/edit/video/:id                    Opens on what this video most likely needs
/edit/video/:id/details            Topic and participants
/edit/video/:id/music/setlist      Songs, starting from the comments
/edit/video/:id/music/timeline     Songs, laid out over the whole stream
/edit/video/:id/music/capture      Songs, tapped out while watching
```

The address always says what's on screen, so any view can be linked to. `/edit/video/:id` redirects to the songs for a singing stream and to details for anything else, and `/music` to the approach used last. The previous UI's `/topic` and `/mentions` redirect to `details`, and `?t=seconds` opens at a moment.

Songs need a stream on YouTube that has started. Clips only have participants, as in the previous UI, and placeholders only have a topic.

## Three ways to add songs

These are deliberately different bets on how the work should go. All three edit the same drafts, so switching mid-way loses nothing and the player keeps playing, which makes comparing them easy.

| | Setlist | Timeline | Capture |
| --- | --- | --- | --- |
| Shape | Review queue | Spatial overview | One decision at a time |
| The person mostly | Confirms | Adjusts | Marks |
| Best when | Someone wrote a setlist | Songs exist and need tidying | Nobody has written anything yet |
| Weak when | No setlist, so little to review | Starting from nothing on a long stream | Fixing many existing songs |
| On a phone | Good | Fiddly, but works | Designed for it |

**Setlist** (`setlist-approach.tsx`, `source-panel.tsx`). The most setlist-like comment is parsed and shown beside the tracklist, and one click turns it into songs. Tracks are matched in the background. What's left is a review: each row you open takes the player there, and Enter confirms and moves on. Popular streams nearly always have a setlist, so this is the default.

**Timeline** (`timeline-approach.tsx`). The stream as one zoomable strip. Songs are blocks to slide and stretch, and comment timestamps are pinned above them. Edges snap to pins, to neighbouring songs and to the playhead (Alt turns snapping off), and letting go plays the result. Drag on empty space to draw a song. Ctrl+wheel zooms around the pointer and double-clicking a song zooms to it.

**Capture** (`capture-approach.tsx`). S when a song starts, name it, E when it ends, next. Only the current decision is on screen. If a comment mentions that moment, it fills the name in, and N skips the talking between songs.

### Dropping an approach

Each is a file with no other approach depending on it. To remove one, delete its file and its entry in three places: `SONG_APPROACHES` in `lib/video-edit/routes.ts`, and `APPROACHES` and `LAYOUTS` in `pages/edit-video.tsx`. Each also arrived in its own commit, with its strings. `lib/video-edit/timeline.ts` is only used by Timeline. Anyone with a saved preference for a removed approach just lands on the default.

## What they share

```
lib/video-edit     Rules. Parsing, matching, saving. Relative imports, so Node can load them
stores/song-editor Drafts, undo, the saving state
components/video-edit/music/workspace  The context every approach works through
```

| Module | Responsibility |
| --- | --- |
| `setlist` | Reading setlists out of comments, descriptions and pasted text, and ranking them |
| `songs` | The draft model, validation, end-time inference, and the payload written to the server |
| `track-match` | How well a track fits what someone wrote, including written the other way round |
| `track-search` | Musicdex and iTunes, within Apple's limit |
| `save-songs` | One save: each write in turn, then a read-back that decides what happened |
| `player-clock` | Position outside React. `now()` for the playhead, whole seconds for anything on screen |
| `shortcuts` | The keyboard map, as data |
| `timecode` | Reading times the way people type them: `1:02:03`, `12345`, `3m20s`, `+30` |

**The player never moves.** It sits at the same DOM position for every tab and approach and only the CSS grid around it changes, because moving an iframe reloads it. Keep it that way: an early return that unmounts it restarts the video.

**The name field is also the search.** Type and real tracks are offered; take one and the rest fills in; ignore them and what you typed is the name. The previous UI had a separate search box and name field, which meant two things to fill in for one idea. Originals that were never released work the same way.

**Comments guide every approach, not only Setlist.** Editing any song shows what comments said around that moment, with one click to use it.

### Drafts and saving

Nothing reaches the server until Save. Until then, work is kept in `localStorage` per user and video for 30 days, and undo covers everything, so a reload or a crash costs nothing and a mistake can be taken back. Publishing is an explicit step because each song appears on Musicdex straight away, and half-checked work shouldn't.

Song ids are UUIDs generated in the browser. That makes a save safe to repeat, and the backend only refreshes the search index for a song whose id it was given.

Saves run one song at a time. A refused or rejected song doesn't stop the others, but a lost connection, an expired session or a rate limit stops the run, as these would fail the rest anyway. Writes are never replayed automatically. The read-back afterwards decides what happened, since a response can be lost after the write succeeded. Every field is always sent, because the server keeps an omitted field rather than clearing it.

### Finding the end of a song

Comments nearly always give a start and rarely an end, so ends are inferred, and `endSource` records where each came from: an explicit range, the next line if it says "MC" or similar, the matched track's length, or a plain guess. A track's length only replaces a guess, and is cut short by the next song if they would overlap. Guesses say so in the form.

Listening is how you check, so **Hear ending** plays up to the end and stops there: the cut is what you're listening for. Nudging an edge plays the result immediately.

### Track matching

A confident match applies by itself, and the form then shows what the comment originally said with one click to go back to it. Anything less confident is offered as choices instead. Musicdex is asked first because it usually spells things the way this community does and has originals iTunes lacks. iTunes is only spent when that's inconclusive, as a long setlist would otherwise hit Apple's limit of about 20 searches a minute. iTunes sends no CORS headers, hence JSONP.

### Keyboard

The same keys work in every approach; `?` lists them. Letters go by physical key so that they work with a Japanese input method on, and digits are used for nudging because brackets and punctuation move between layouts.

| Keys | Action |
| --- | --- |
| Space, K | Play or pause |
| ← → | 5 seconds, or 1 with Shift |
| J L | 10 seconds |
| N | Next song the comments mention |
| S E | Song starts or ends here |
| Shift+S, Shift+E | Hear the start or the ending |
| 1 2, 3 4 | Nudge the start, then the end |
| ↑ ↓ | Previous or next song |
| / | Find a track |
| Ctrl+Z, Ctrl+S | Undo, save |

Clicking inside the YouTube embed moves the keyboard into it, where the page can't hear anything. When the click starts or pauses the video the keyboard is taken straight back, since the click has done its job by then. Otherwise a tab on the player says shortcuts are paused and clicking it resumes them.

## Quick edit, for editors

Editors also get **Quick edit…** on every video's menu: a small dialog with the same topic and participant editors, so a feed can be corrected without leaving it. It takes the place of the quick editor the previous UI had inside the card menu. Selecting a video and opening the editor reaches the same place in a few more clicks, so this is a convenience and nothing depends on it. It lives in `quick-edit.tsx` and `quick-edit-dialog.tsx`, plus one line each in `video-menu.tsx` and `app-shell.tsx`, and arrived as a single commit that can be reverted cleanly.

## Testing status

Static checks and the existing test suite pass. Parsing, matching and the save runner were checked by hand against realistic inputs. None of this has been exercised in a browser, or against the real API.
