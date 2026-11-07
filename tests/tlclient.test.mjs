import assert from "node:assert/strict"
import test from "node:test"

import {
  activeTranslators,
  canChangeLine,
  chatLength,
  composeLine,
  cycleSpeaker,
  lineState,
  lineTimestamp,
  MAX_BACKDATE_MS,
  MAX_SPEAKERS,
  mergeFeed,
  ownCopies,
  POSTABLE_LANGS,
  shortSpeakerName,
  slotForKey,
  slotKey,
} from "../src/lib/tlclient/lines.ts"
import {
  parseSource,
  readSessionParams,
  resolveSource,
  roomKey,
  writeSessionParams,
} from "../src/lib/tlclient/session.ts"

test("sources: YouTube links, ids and the old YT_ form all name the video", () => {
  for (const text of [
    "abcdefghijk",
    "YT_abcdefghijk",
    "https://www.youtube.com/watch?v=abcdefghijk&t=10",
    "https://youtube.com/watch?list=PL123&v=abcdefghijk",
    "https://youtu.be/abcdefghijk",
    "youtube.com/live/abcdefghijk",
    "https://holodex.net/watch/abcdefghijk",
  ]) {
    const parsed = parseSource(text)
    assert.equal(parsed.youtubeId, "abcdefghijk", text)
    assert.equal(parsed.lookupId, "abcdefghijk", text)
  }
})

test("sources: Twitch channels and VODs are recognised, other pages are not", () => {
  assert.equal(
    parseSource("https://www.twitch.tv/SomeOne").twitchChannel,
    "someone"
  )
  assert.equal(parseSource("twitch.tv/videos/12345").twitchVod, "12345")
  assert.equal(parseSource("https://twitch.tv/directory").twitchChannel, null)
  // A link is never looked up in the catalog; it can only be a custom room.
  assert.equal(parseSource("https://www.twitch.tv/someone").lookupId, null)
})

test("sources: free text is a catalog candidate only when it looks like an id", () => {
  assert.equal(parseSource("tw:talent:123").lookupId, "tw:talent:123")
  assert.equal(parseSource("concert night 2026").lookupId, null)
  assert.equal(parseSource("https://example.com/live").lookupId, null)
})

test("sources: the catalog decides the room; anything else is a custom room", () => {
  const parsed = parseSource("https://youtu.be/abcdefghijk")
  const known = resolveSource(parsed, {
    id: "abcdefghijk",
    type: "stream",
    status: "live",
    channel: { id: "UC1", name: "Talent" },
  })
  assert.deepEqual(known.room, { kind: "video", videoId: "abcdefghijk" })
  assert.deepEqual(known.chat, { provider: "youtube", videoId: "abcdefghijk" })

  const unknown = resolveSource(parsed, null)
  assert.deepEqual(unknown.room, {
    kind: "custom",
    customId: "https://youtu.be/abcdefghijk",
  })
  // Not in the catalog, but its chat can still be typed into.
  assert.deepEqual(unknown.chat, {
    provider: "youtube",
    videoId: "abcdefghijk",
  })

  const past = resolveSource(parsed, {
    id: "abcdefghijk",
    type: "stream",
    status: "past",
    channel: { id: "UC1", name: "Talent" },
  })
  assert.equal(past.chat, null)
})

test("session params round-trip and drop duplicates of the main stream", () => {
  const search = writeSessionParams({
    main: "abcdefghijk",
    collabs: ["bbbbbbbbbbb", "abcdefghijk", "bbbbbbbbbbb", " "],
    lang: "en",
  })
  assert.equal(
    search.toString(),
    "video=abcdefghijk&collab=bbbbbbbbbbb&lang=en"
  )
  assert.deepEqual(readSessionParams(search), {
    main: "abcdefghijk",
    collabs: ["bbbbbbbbbbb"],
    lang: "en",
  })
  assert.notEqual(
    roomKey({ kind: "video", videoId: "x" }),
    roomKey({ kind: "custom", customId: "x" })
  )
})

test("lines: speakers wrap the text; no speaker leaves it bare", () => {
  const speaker = { id: "1", name: "Peko", prefix: "Peko: ", suffix: "" }
  assert.equal(composeLine("  hello ", speaker), "Peko: hello")
  assert.equal(
    composeLine("la la", { ...speaker, prefix: "♪ ", suffix: " ♪" }),
    "♪ la la ♪"
  )
  assert.equal(composeLine("hello", null), "hello")
  assert.equal(chatLength("😀a"), 2)
})

test("lines: Tab cycles speakers and skips the empty slot", () => {
  assert.equal(cycleSpeaker(0, 0, 1), 0)
  assert.equal(cycleSpeaker(0, 2, 1), 1)
  assert.equal(cycleSpeaker(1, 2, 1), 2)
  assert.equal(cycleSpeaker(2, 2, 1), 1)
  assert.equal(cycleSpeaker(1, 2, -1), 2)
  assert.equal(cycleSpeaker(0, 3, -1), 3)
})

test("lines: Alt+1 is no speaker, Alt+2 to 9 the speakers, Alt+0 clears too", () => {
  assert.equal(slotKey(0), 1)
  assert.equal(slotKey(1), 2)
  assert.equal(slotKey(MAX_SPEAKERS), 9)
  assert.equal(slotForKey(1, 3), 0)
  assert.equal(slotForKey(0, 3), 0)
  assert.equal(slotForKey(2, 3), 1)
  assert.equal(slotForKey(4, 3), 3)
  assert.equal(slotForKey(5, 3), null)
})

test("lines: a line is timed from its first keystroke, unless it sat too long", () => {
  assert.equal(lineTimestamp(1000, 5000, true), 1000)
  assert.equal(lineTimestamp(1000, 5000, false), 5000)
  assert.equal(lineTimestamp(null, 5000, true), 5000)
  assert.equal(lineTimestamp(0, MAX_BACKDATE_MS + 1, true), MAX_BACKDATE_MS + 1)
})

test("lines: participants get their given name", () => {
  assert.equal(shortSpeakerName("Usada Pekora"), "Pekora")
  assert.equal(shortSpeakerName("IRyS"), "IRyS")
  assert.equal(shortSpeakerName("Takanashi Kiara Ch"), "Takanashi Kiara Ch")
})

const remote = (name, message, timestamp, extra = {}) => ({
  name,
  message,
  timestamp,
  key: `${name}${timestamp}${message}`,
  relativeMs: 0,
  tokens: [],
  is_tl: true,
  ...extra,
})

const own = (message, timestamp, extra = {}) => ({
  localId: message,
  speakerId: null,
  body: message,
  message,
  texts: [message],
  timestamp,
  rooms: {
    a: { room: { kind: "video", videoId: "a" }, state: "sent", id: "1" },
  },
  relays: { sent: [], tooLong: [] },
  edited: false,
  deleted: false,
  busy: false,
  ...extra,
})

test("feed: an echoed line shows once, as the editable local copy", () => {
  const line = own("hello", 10_000)
  const items = mergeFeed(
    [remote("me", "hello", 10_500), remote("other", "hello", 10_600)],
    [line],
    "me"
  )
  assert.equal(items.length, 2)
  assert.equal(items[0].kind, "own")
  assert.equal(items[1].kind, "remote")
  assert.equal(items[1].message.name, "other")
})

test("feed: two identical lines each claim one echo, and deleted ones hide theirs", () => {
  const first = own("lol", 1000)
  const second = { ...own("lol", 2000), localId: "second", deleted: true }
  const items = mergeFeed(
    [remote("me", "lol", 1000), remote("me", "lol", 2000)],
    [first, second],
    "me"
  )
  assert.deepEqual(
    items.map((item) => item.kind),
    ["own"]
  )
})

test("feed: an edited line still recognises the echo of its old text", () => {
  const line = own("helo", 1000, { message: "hello", texts: ["helo", "hello"] })
  const items = mergeFeed([remote("me", "helo", 1000)], [line], "me")
  assert.equal(items.length, 1)
  assert.equal(items[0].kind, "own")
})

test("feed: old lines of mine from before this session stay, marked as mine", () => {
  const items = mergeFeed([remote("me", "earlier", 1000)], [], "me")
  assert.equal(items[0].kind, "remote")
  assert.equal(items[0].mine, true)
})

test("delivery: a line is failed if any room failed, editable once saved", () => {
  const line = own("x", 0, {
    rooms: {
      a: { room: { kind: "video", videoId: "a" }, state: "sent", id: "1" },
      b: { room: { kind: "video", videoId: "b" }, state: "failed" },
    },
  })
  assert.equal(lineState(line), "failed")
  assert.equal(canChangeLine(line), true)
  assert.equal(canChangeLine({ ...line, busy: true }), false)
  assert.equal(
    canChangeLine(
      own("y", 0, {
        rooms: {
          a: { room: { kind: "video", videoId: "a" }, state: "sending" },
        },
      })
    ),
    false
  )
})

test("delivery: copies TLdex merged into someone else's line are not ours to change", () => {
  const line = own("lol", 0, {
    rooms: {
      a: {
        room: { kind: "video", videoId: "a" },
        state: "sent",
        id: "theirs",
        merged: true,
      },
      b: { room: { kind: "video", videoId: "b" }, state: "sent", id: "mine" },
    },
  })
  assert.deepEqual(
    ownCopies(line).map((delivery) => delivery.id),
    ["mine"]
  )
  assert.equal(canChangeLine(line), true)
  const allMerged = {
    ...line,
    rooms: { a: line.rooms.a },
  }
  assert.equal(canChangeLine(allMerged), false)
})

test("languages: only those TLdex accepts posts in", () => {
  assert.ok(POSTABLE_LANGS.includes("en"))
  assert.ok(!POSTABLE_LANGS.includes("vi"))
})

test("translators: counts other people's recent lines", () => {
  const now = 20 * 60_000
  const messages = [
    remote("old", "a", 0),
    remote("a", "b", now - 60_000),
    remote("me", "c", now - 30_000),
    remote("b", "d", now - 10_000),
    remote("mod", "e", now - 5_000, { is_tl: false, is_moderator: true }),
  ]
  assert.equal(activeTranslators(messages, "me", now), 2)
})
