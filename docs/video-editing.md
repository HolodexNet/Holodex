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
/edit/video/:id/music              Songs, starting from the comments
```

The address always says what's on screen, so any view can be linked to. `/edit/video/:id` redirects to the songs for a singing stream and to details for anything else. The previous UI's `/topic` and `/mentions` redirect to `details`, and `?t=seconds` opens at a moment.

Songs need a stream on YouTube that has started. Clips only have participants, as in the previous UI, and placeholders only have a topic.

## Adding songs

**Setlist** (`setlist-approach.tsx`, `source-panel.tsx`). The most setlist-like comment is parsed and shown beside the tracklist, and one click turns it into songs. Tracks are matched in the background. What's left is a review: each row you open takes the player there, and Enter confirms and moves on. Songs can also be marked with S while watching.

## Structure

```
lib/video-edit     Rules. Parsing, matching, saving. Relative imports, so Node can load them
stores/song-editor Drafts, undo, the saving state
components/video-edit/music/workspace  The context the song editor works through
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
| `timecode` | Reading times however people give them, see [The inputs](#the-inputs) |
| `field` | What the text boxes share: no autocorrect or autofill, and telling an input method's Enter from a person's |

**The player never moves.** It sits at the same DOM position for every tab and only the CSS grid around it changes, because moving an iframe reloads it. Keep it that way: an early return that unmounts it restarts the video.

**The name field is also the search.** Type and real tracks are offered; take one and the rest fills in; ignore them and what you typed is the name. The previous UI had a separate search box and name field, which meant two things to fill in for one idea. Originals that were never released work the same way.

**Comments guide every edit, not only the setlist.** Editing any song shows what comments said around that moment, with one click to use it.

### The inputs

These are `time-field.tsx`, `song-fields.tsx` and `suggest-field.tsx`. Most of a session is spent in them, so they try hard to take what they're given.

**A time** can be typed any way someone might think of one, and the field says what it understood while it's being typed, because `930` or `+30` could mean several things and finding out afterwards is too late.

| Typed | Means |
| --- | --- |
| `1:02:03`, `4:05`, `75:30` | As written |
| `3m20s`, `1h30`, `2 min` | In words |
| `1時間2分3秒`, `1시간 2분`, `１２：３４` | The same, from a Japanese, Korean or Chinese keyboard |
| `12.34`, `1.23.45` | A dot or comma for a colon, because a phone's number pad has no colon |
| `[12:34]`, `3'45"`, `1:02:03.5` | Copied from somewhere else |
| `+30`, `-1:00` | Relative to what the field says now |

Digits alone are seconds. An end can't come before its start, so on a long stream `9:30` typed for a song starting at 1:05:30 can only mean 1:09:30. That inference stops at 20 minutes: anything further stays what it says and gets pointed out as out of order.

Nothing is committed until Enter, Tab or leaving the field. What can't be read is never committed: Enter stays put so it can be fixed, and leaving goes back to the old value and says so. Escape cancels. Past the end of the video, a time stops there and says that too.

Up and Down step whichever part the caret is in, as a native time input does, and keep it selected so that stepping and typing can follow each other. Shift steps by five, and Page Up and Down by 30 seconds. The minus and plus either side repeat while held and speed up. They're out of the tab order because the arrow keys do the same from inside the field, so Tab goes from one time straight to the next. Steps taken one after another are one thing to undo, and only the first and the last get played: seeking on every one is slow and sounds terrible. Ctrl+S commits whatever's being typed before it saves.

**A name** also takes a whole pasted line. `12:34 - 16:20 Lemon / 米津玄師` fills in the name, the artist and both times, and several timed lines become a setlist, offered with a button to add them all. Pasting into the middle of an existing name only ever adds to the name, and a title that merely looks like it has parts (`Fate/stay night`, `Song (Live)`) is left alone.

Each source is asked separately, so Holodex's answer doesn't wait for Apple's, which its limit can hold back for a minute. Later results only add to the end of the list, so nothing moves under the pointer. While results are still for what was typed a moment ago, they're dimmed and Enter won't take one. One kanji is enough to search on, since it can be the whole title.

A name that was typed and never taken from the list still gets looked up on the way out of the field, the same as a line from a comment. A confident match applies, with **Use as written** to go back. **Not this track** lets go of a wrong match, and it won't come back unless the name changes. Fixing a typo or adding a translation keeps the track, while a different name lets go of it, which is decided by comparing against what the track is called (`trackName`).

**An artist** offers the ones already on this video, most used first, because one spelled two ways is two artists on Musicdex. **Swap** is for when the two came out the wrong way round, which comments do often enough, and looks the result up again.

In both text boxes Enter and Escape are finished with the field and give the keyboard back, so that S and E mean what they should again. The first Escape only closes an open list. The primitive underneath empties its box on Escape, as a search box might, and `SuggestField` refuses that, because here it would erase the song's name. On the way out, runs of spaces are tidied away.

**Problems come with their way out.** "Overlaps “Lemon” by 0:12" has **End when it starts** and **Go to it** right beside it, a song that's too short has **Make it 4:00 long**, and so on (`songFix`). No fix is offered that would only trade one problem for another. Saving with something blocked offers to show the first one, and goes straight there if nothing else could be saved.

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

`?` lists them, along with how to type a time. Letters go by physical key so that they work with a Japanese input method on, and digits are used for nudging because brackets and punctuation move between layouts. Holding a key only repeats what moves through time or the list (`shortcutRepeats`): a held Enter must not confirm its way through every song.

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

Static checks and the test suite pass. What the inputs read and decide is covered by `tests/video-edit-inputs.test.mjs`. Setlist parsing, matching and the save runner were checked by hand against realistic inputs. None of this has been exercised in a browser, or against the real API, so how the inputs feel to use is still to be judged.
