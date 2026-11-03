import assert from "node:assert/strict"
import test from "node:test"
import {
  chatScaleForWidth,
  DEFAULT_PANELS,
  hasEmbeddedChat,
  TL_PANELS,
  togglePanel,
  twitchChatUrl,
  youtubeChatUrl,
} from "../src/lib/multiview/chat.ts"
import { replayTimedContinuation } from "../src/lib/multiview/chat-continuation.ts"
import { ArchiveClock } from "../src/lib/multiview/archive-clock.ts"
import { PlaybackHub } from "../src/lib/multiview/playback.ts"
import {
  twitchChannelStub,
  twitchVodStub,
  youtubeStub,
} from "../src/lib/multiview/stream.ts"
import {
  barSegments,
  buildTimeline,
  encodeOffsets,
  findStartTime,
  parseOffsets,
  percentForTime,
  planSeek,
  planTick,
  resolveOffsets,
  timeForPercent,
  videoProgress,
} from "../src/lib/multiview/sync.ts"
import { TlRooms } from "../src/lib/tldex/rooms.ts"
import {
  activeMessageIndex,
  archiveSubtitles,
  canJoinRoom,
  displayMs,
  liveSubtitles,
  parseMessage,
  shouldShowLive,
  showsAuthor,
  tokenizeMessage,
} from "../src/lib/tldex/messages.ts"

const archive = (id, startSeconds, duration) => ({
  ...youtubeStub(id),
  status: "past",
  available_at: new Date(startSeconds * 1000).toISOString(),
  duration,
})

const position = (currentTime, playing = true) => ({ currentTime, playing })

test("archives that aired close together share a timeline", () => {
  const timeline = buildTimeline([
    archive("b", 1000, 500),
    archive("a", 0, 1200),
    youtubeStub("not-archived"),
  ])
  assert.deepEqual(
    timeline.videos.map((v) => v.id),
    ["a", "b"]
  )
  assert.equal(timeline.minTs, 0)
  assert.equal(timeline.maxTs, 1500)
})

test("a stream is left out when it aired far after the group ended", () => {
  const far = 100 * 3600
  const timeline = buildTimeline([
    archive("a", 0, 100),
    archive("b", 50, 100),
    archive("c", far, 100),
  ])
  assert.deepEqual(
    timeline.videos.map((v) => v.id),
    ["a", "b"]
  )
})

test("a lone stream gives way to a later group", () => {
  const far = 100 * 3600
  const timeline = buildTimeline([
    archive("a", 0, 100),
    archive("b", far, 100),
    archive("c", far + 50, 100),
  ])
  assert.deepEqual(
    timeline.videos.map((v) => v.id),
    ["b", "c"]
  )
})

test("nothing to sync without finished streams", () => {
  assert.equal(buildTimeline([youtubeStub("a")]), null)
  assert.equal(buildTimeline([]), null)
})

test("timeline math converts between time and slider position", () => {
  const timeline = buildTimeline([archive("a", 100, 200)])
  assert.equal(percentForTime(timeline, 200), 50)
  assert.equal(timeForPercent(timeline, 50), 200)
  assert.deepEqual(
    barSegments(buildTimeline([archive("a", 0, 100), archive("b", 50, 150)]))[1]
      .offset,
    0.25
  )
})

test("playback starts at the linked time, or where players already agree", () => {
  const timeline = buildTimeline([
    archive("a", 0, 1000),
    archive("b", 100, 1000),
  ])
  assert.equal(findStartTime(timeline, new Map(), 500), 500)
  assert.equal(findStartTime(timeline, new Map(), 99999), timeline.maxTs)

  const agreed = new Map([
    ["a", position(300)],
    ["b", position(200)],
  ])
  assert.equal(findStartTime(timeline, agreed), 300)

  const apart = new Map([
    ["a", position(0)],
    ["b", position(0)],
  ])
  assert.equal(findStartTime(timeline, apart), 100, "when both have started")
})

test("a tick corrects drift and leaves in-sync players alone", () => {
  const timeline = buildTimeline([archive("a", 0, 1000), archive("b", 0, 1000)])
  const commands = planTick({
    timeline,
    currentTs: 500,
    paused: false,
    rate: 1,
    offsets: {},
    positions: new Map([
      ["a", position(500.5)],
      ["b", position(450)],
    ]),
  })
  assert.deepEqual(commands, [
    { kind: "seek", videoId: "b", time: 500, play: true, rate: 1 },
  ])
})

test("drift tolerance widens with playback speed", () => {
  const timeline = buildTimeline([archive("a", 0, 1000)])
  const input = {
    timeline,
    currentTs: 500,
    paused: false,
    offsets: {},
    positions: new Map([["a", position(497.5)]]),
  }
  assert.equal(planTick({ ...input, rate: 1 }).length, 1)
  assert.equal(planTick({ ...input, rate: 2 }).length, 0)
})

test("offsets shift when a stream is expected to be at a given moment", () => {
  const timeline = buildTimeline([archive("a", 0, 1000)])
  const commands = planTick({
    timeline,
    currentTs: 500,
    paused: false,
    rate: 1,
    offsets: { a: 10 },
    positions: new Map([["a", position(500)]]),
  })
  assert.equal(commands[0].time, 510)
})

test("streams outside their window are paused, once", () => {
  const timeline = buildTimeline([archive("a", 0, 100), archive("b", 50, 1000)])
  const input = {
    timeline,
    currentTs: 500,
    paused: false,
    rate: 1,
    offsets: {},
  }
  const playing = planTick({
    ...input,
    positions: new Map([
      ["a", position(100, true)],
      ["b", position(450, true)],
    ]),
  })
  assert.deepEqual(playing, [{ kind: "pause", videoId: "a" }])
  const stopped = planTick({
    ...input,
    positions: new Map([
      ["a", position(100, false)],
      ["b", position(450, true)],
    ]),
  })
  assert.deepEqual(stopped, [])
})

test("seeking moves in-window streams and parks the others at their ends", () => {
  const timeline = buildTimeline([archive("a", 0, 100), archive("b", 200, 100)])
  assert.deepEqual(planSeek(timeline, 250, false, {}), [
    { kind: "pause", videoId: "a" },
    { kind: "seek", videoId: "a", time: 99, play: false },
    { kind: "seek", videoId: "b", time: 50, play: true },
  ])
  assert.deepEqual(planSeek(timeline, 50, true, {})[0], {
    kind: "seek",
    videoId: "a",
    time: 50,
    play: false,
  })
})

test("shared offsets fill in for streams with no local adjustment", () => {
  const timeline = buildTimeline([archive("a", 0, 100), archive("b", 50, 100)])
  assert.deepEqual(resolveOffsets(timeline, { a: 5 }, [1, 2]), { a: 5, b: 2 })
  assert.deepEqual(resolveOffsets(null, { a: 5 }, [1, 2]), { a: 5 })
  assert.deepEqual(parseOffsets("1.5,-2"), [1.5, -2])
  assert.equal(parseOffsets(null), undefined)
  assert.equal(encodeOffsets(timeline, {}), null)
  assert.equal(encodeOffsets(timeline, { b: -2.5 }), "0,-2.5")
})

test("the per-channel bar reflects the stream's own progress", () => {
  const [a] = buildTimeline([archive("a", 0, 100)]).videos
  assert.equal(videoProgress(a, 50, 50), 50)
  assert.equal(videoProgress(a, 500, 10), 100)
})

const fakePlayer = (overrides = {}) => {
  const status = {
    state: "paused",
    currentTime: 0,
    muted: false,
    volume: 100,
    playbackRate: 1,
    ...overrides,
  }
  return {
    status,
    calls: [],
    supportsPlaybackRate: true,
    play() {},
    pause() {},
    seekTo() {},
    setMuted(value) {
      this.calls.push(["setMuted", value])
    },
    setVolume() {},
    setPlaybackRate() {},
    read() {
      return { ...this.status }
    },
    destroy() {},
  }
}

const clockHarness = () => {
  let time = 0
  let tick = null
  let started = 0
  const commands = []
  const input = {
    timeline: {
      videos: [{ id: "a", startTs: 1000, endTs: 2000, duration: 1000 }],
      minTs: 1000,
      maxTs: 2000,
    },
    offsets: {},
    positions: new Map(),
  }
  const clock = new ArchiveClock({
    read: () => input,
    run: (planned) => commands.push(...planned),
    now: () => time,
    schedule: (callback) => {
      started++
      tick = callback
      return () => {
        tick = null
      }
    },
  })
  return {
    clock,
    commands,
    input,
    started: () => started,
    ticking: () => tick !== null,
    advance: (ms = 500) => {
      time += ms
      tick?.()
    },
  }
}

test("however many controls show the clock, only one ticks", () => {
  const { clock, started, ticking } = clockHarness()
  assert.equal(clock.running, false)
  const first = clock.acquire()
  const second = clock.acquire()
  assert.equal(started(), 1)
  first()
  first()
  assert.equal(ticking(), true, "releasing twice does not count twice")
  assert.equal(clock.running, true)
  second()
  assert.equal(ticking(), false)
  assert.equal(clock.running, false)
})

test("the clock advances only while playing, at the chosen rate", () => {
  const { clock, advance } = clockHarness()
  clock.acquire()
  advance()
  const start = clock.getSnapshot().currentTs
  assert.equal(start, 1000, "starts where every stream has begun")
  advance()
  assert.equal(clock.getSnapshot().currentTs, start, "paused")
  clock.setPaused(false)
  clock.setRate(2)
  advance(1000)
  assert.equal(clock.getSnapshot().currentTs, start + 2)
})

test("the first seek also starts playback, and later ones keep it as it is", () => {
  const { clock, advance, commands } = clockHarness()
  clock.acquire()
  advance()
  assert.equal(clock.getSnapshot().paused, true)
  clock.seek(1500)
  assert.equal(clock.getSnapshot().paused, false)
  assert.equal(clock.getSnapshot().currentTs, 1500)
  assert.deepEqual(commands.at(-1), {
    kind: "seek",
    videoId: "a",
    time: 500,
    play: true,
  })
  clock.setPaused(true)
  clock.seek(1600)
  assert.equal(clock.getSnapshot().paused, true)
  clock.seek(99999)
  assert.equal(clock.getSnapshot().currentTs, 2000, "stays on the timeline")
})

test("a rate change reaches every stream on the timeline", () => {
  const { clock, commands } = clockHarness()
  clock.acquire()
  clock.setRate(1.5)
  assert.deepEqual(commands, [{ kind: "rate", videoId: "a", rate: 1.5 }])
})

test("closing the last control ends the session", () => {
  const { clock, advance } = clockHarness()
  const release = clock.acquire()
  advance()
  clock.seek(1500)
  clock.setRate(2)
  release()
  assert.deepEqual(clock.getSnapshot(), { paused: true, rate: 1, currentTs: 0 })
  clock.acquire()
  advance()
  clock.seek(1500)
  assert.equal(clock.getSnapshot().paused, false, "first seek again")
})

test("nothing on the timeline means nothing to run", () => {
  const { clock, advance, commands, input } = clockHarness()
  input.timeline = null
  clock.acquire()
  advance()
  clock.seek(1500)
  clock.setPaused(false)
  clock.setRate(2)
  assert.deepEqual(commands, [])
})

const hubHarness = () => {
  let time = 0
  let poll = null
  const events = []
  const hub = new PlaybackHub({
    onEvent: (event) => events.push(event),
    now: () => time,
    schedule: (callback) => {
      poll = callback
      return () => {
        poll = null
      }
    },
  })
  return {
    hub,
    events,
    tick: (ms = 500) => {
      time += ms
      poll?.()
    },
    polling: () => poll !== null,
  }
}

test("the hub only polls while a player exists", () => {
  const { hub, polling } = hubHarness()
  assert.equal(polling(), false)
  const release = hub.register("a", fakePlayer())
  assert.equal(polling(), true)
  release()
  assert.equal(polling(), false)
})

test("the hub publishes changes and keeps a stable snapshot otherwise", () => {
  const { hub, tick } = hubHarness()
  const player = fakePlayer()
  hub.register("a", player)
  let notified = 0
  hub.subscribe(() => notified++)

  tick()
  const first = hub.getStatus("a")
  tick()
  assert.equal(hub.getStatus("a"), first, "no new object without a change")
  assert.equal(notified, 1)

  player.status.currentTime = 12
  tick()
  assert.equal(hub.getStatus("a").currentTime, 12)
  assert.equal(notified, 2)
})

test("a player's first play is reported exactly once", () => {
  const { hub, events, tick } = hubHarness()
  const player = fakePlayer()
  hub.register("a", player)
  tick()
  assert.deepEqual(events, [])
  player.status.state = "playing"
  tick()
  player.status.state = "paused"
  tick()
  player.status.state = "playing"
  tick()
  assert.deepEqual(events, [{ type: "first-play", cellId: "a" }])
})

test("a mute command is settling until the player is seen to obey it", () => {
  const { hub, tick } = hubHarness()
  const player = fakePlayer()
  hub.register("a", player)
  tick()
  let notified = 0
  hub.subscribe(() => notified++)

  hub.applyMuted("a", true)
  assert.equal(hub.isMuteSettling("a"), true)
  // The player has yet to report the change, which is not the viewer undoing it.
  tick()
  assert.equal(hub.isMuteSettling("a"), true)
  assert.equal(hub.getStatus("a").muted, true)

  player.status.muted = true
  notified = 0
  tick()
  assert.equal(hub.isMuteSettling("a"), false)
  assert.equal(
    notified,
    1,
    "listeners hear that it settled, with no status change"
  )
  assert.equal(hub.isMuteSettling("gone"), false)
})

test("muting from inside the player is reported", () => {
  const { hub, events, tick } = hubHarness()
  const player = fakePlayer()
  hub.register("a", player)
  tick()
  player.status.muted = true
  tick()
  assert.deepEqual(events, [
    { type: "muted-by-player", cellId: "a", muted: true },
  ])
})

test("the player's lag after a mute command is not mistaken for the viewer", () => {
  const { hub, events, tick } = hubHarness()
  const player = fakePlayer()
  hub.register("a", player)
  tick()

  hub.applyMuted("a", true)
  assert.deepEqual(player.calls, [["setMuted", true]])
  assert.equal(hub.getStatus("a").muted, true, "reflected immediately")

  // The player still reports the old value for a while.
  tick()
  assert.equal(hub.getStatus("a").muted, true)
  assert.deepEqual(events, [])

  player.status.muted = true
  tick()
  assert.deepEqual(events, [])

  // Once settled, changes are the viewer's again.
  player.status.muted = false
  tick()
  assert.deepEqual(events, [
    { type: "muted-by-player", cellId: "a", muted: false },
  ])
})

test("a mute command with no effect stops being waited on", () => {
  const { hub, events, tick } = hubHarness()
  const player = fakePlayer()
  hub.register("a", player)
  tick()
  hub.applyMuted("a", true)
  tick(2000)
  assert.equal(hub.getStatus("a").muted, false, "falls back to what it reports")
  assert.deepEqual(events, [])
})

test("releasing a stale registration does not remove its replacement", () => {
  const { hub } = hubHarness()
  const first = fakePlayer()
  const second = fakePlayer()
  const releaseFirst = hub.register("a", first)
  hub.register("a", second)
  releaseFirst()
  assert.equal(hub.controller("a"), second)
})

test("chat panels can never both be off", () => {
  assert.deepEqual(togglePanel(DEFAULT_PANELS, "tl"), { chat: true, tl: true })
  assert.deepEqual(togglePanel({ chat: true, tl: true }, "chat"), TL_PANELS)
  assert.deepEqual(togglePanel(TL_PANELS, "tl"), DEFAULT_PANELS)
  assert.deepEqual(togglePanel(DEFAULT_PANELS, "chat"), TL_PANELS)
})

test("chat links name the stream and the embedding page", () => {
  const live = new URL(
    youtubeChatUrl(
      { ...youtubeStub("dQw4w9WgXcQ"), status: "live" },
      { hostname: "holodex.net", dark: true }
    )
  )
  assert.equal(live.pathname, "/live_chat")
  assert.equal(live.searchParams.get("v"), "dQw4w9WgXcQ")
  assert.equal(live.searchParams.get("embed_domain"), "holodex.net")
  assert.equal(live.searchParams.get("dark_theme"), "1")

  const twitch = new URL(twitchChatUrl("peko", "holodex.net", true))
  assert.equal(twitch.pathname, "/embed/peko/chat")
  assert.equal(twitch.searchParams.get("parent"), "holodex.net")
  assert.ok(twitch.searchParams.has("darkpopout"))
})

test("replay chat uses the extension's route when it is installed", () => {
  const video = {
    ...youtubeStub("dQw4w9WgXcQ"),
    status: "past",
    channel: { id: "UC1", name: "Aqua" },
  }
  const plain = new URL(youtubeChatUrl(video, { hostname: "h", dark: false }))
  assert.equal(plain.pathname, "/redirect_replay_chat")
  assert.ok(plain.searchParams.get("continuation"))
  const extended = new URL(
    youtubeChatUrl(video, { hostname: "h", dark: false, extensionV3: true })
  )
  assert.equal(extended.pathname, "/live_chat_replay")
})

test("the replay continuation matches the previous UI's encoder", () => {
  assert.equal(
    replayTimedContinuation({
      videoId: "dQw4w9WgXcQ",
      channelId: "UCuAXFkgsw1L7xaCfnd5JJOw",
    }),
    "op2w0wRmGlhDaWtxSndvWVZVTjFRVmhHYTJkemR6Rk1OM2hoUTJadVpEVktTazkzRWd0a1VYYzBkemxYWjFoalVSb1Q2cWpkdVFFTkNndGtVWGMwZHpsWFoxaGpVU0FCQAFaAhAAcgIIAXgB"
  )
})

test("only channels have an embeddable chat on Twitch", () => {
  assert.equal(hasEmbeddedChat(youtubeStub("a")), true)
  assert.equal(hasEmbeddedChat(twitchChannelStub("a")), true)
  assert.equal(hasEmbeddedChat(twitchVodStub("1")), false)
})

test("narrow chats are scaled down in steps", () => {
  assert.equal(chatScaleForWidth(100), 0.5)
  assert.equal(chatScaleForWidth(175), 0.6)
  assert.equal(chatScaleForWidth(349), 1)
  assert.equal(chatScaleForWidth(1000), 1)
})

test("emoji become images and everything else stays plain text", () => {
  const url = "https://yt3.ggpht.com/abc-_=/def-c-k-nd"
  assert.deepEqual(tokenizeMessage(`hello :HUMU:${url} there`), [
    { kind: "text", text: "hello " },
    { kind: "emoji", src: url, alt: ":HUMU:" },
    { kind: "text", text: " there" },
  ])
})

test("markup and other URLs in a message are never treated as HTML or images", () => {
  const hostile = `<img src=x onerror=alert(1)> https://evil.example/a.png`
  assert.deepEqual(tokenizeMessage(hostile), [{ kind: "text", text: hostile }])
})

test("messages are timed against the video's start", () => {
  const message = parseMessage(
    { name: "TL", message: "hi", timestamp: "5000" },
    2000
  )
  assert.equal(message.timestamp, 5000)
  assert.equal(message.relativeMs, 3000)
  assert.equal(
    parseMessage({ name: "TL", message: "hi", timestamp: 5 }, null).relativeMs,
    0
  )
})

test("live rooms show translators, plus whoever the viewer opted into", () => {
  const settings = {
    showVerified: false,
    showModerator: true,
    showVtuber: false,
  }
  const blocked = new Set(["Blocked"])
  const show = (message) => shouldShowLive(message, blocked, settings)
  assert.equal(show({ name: "A", is_tl: true }), true)
  assert.equal(show({ name: "A", is_owner: true }), true)
  assert.equal(show({ name: "A", is_moderator: true }), true)
  assert.equal(show({ name: "A", is_verified: true }), false)
  assert.equal(show({ name: "A", is_vtuber: true }), false)
  assert.equal(show({ name: "A" }), false)
  assert.equal(show({ name: "Blocked", is_tl: true }), false)
})

const tl = (relativeMs, name = "TL", message = "hello") => ({
  key: `${name}${relativeMs}`,
  name,
  message,
  relativeMs,
  timestamp: relativeMs,
  tokens: [],
})

test("archive playback finds the message current at any time", () => {
  const messages = [tl(0), tl(1000), tl(5000)]
  assert.equal(activeMessageIndex(messages, 0), 0)
  assert.equal(activeMessageIndex(messages, 999), 0)
  assert.equal(activeMessageIndex(messages, 1000), 1)
  assert.equal(activeMessageIndex(messages, 999999), 2)
  assert.equal(activeMessageIndex([], 1000), 0)
})

test("subtitles show messages only during their display time", () => {
  const message = tl(1000)
  const lasts = displayMs(message)
  assert.equal(lasts, "hello".length * 65 + 1800)
  assert.equal(displayMs({ ...message, duration: 500 }), 500)
  assert.deepEqual(archiveSubtitles([message], 0, 1500), [message])
  assert.deepEqual(archiveSubtitles([message], 0, 1000 + lasts), [])
})

test("live subtitles are paced by arrival, not by the stream's timestamps", () => {
  const start = 1_000_000
  const message = { ...tl(0), receivedAt: start + 60_000 }
  assert.deepEqual(liveSubtitles([message], start, start + 60_100), [message])
  assert.deepEqual(liveSubtitles([message], start, start + 10_000), [])
  assert.deepEqual(liveSubtitles([message], null, start), [])
})

test("an author's name is shown once per run of messages", () => {
  const messages = [tl(0, "A"), tl(1, "A"), tl(2, "B")]
  assert.equal(showsAuthor(messages, 0), true)
  assert.equal(showsAuthor(messages, 1), false)
  assert.equal(showsAuthor(messages, 2), true)
})

test("TL rooms can only be joined near the stream's start", () => {
  const now = Date.parse("2026-01-01T12:00:00Z")
  assert.equal(canJoinRoom("live", null, now), true)
  assert.equal(canJoinRoom(undefined, null, now), true)
  assert.equal(canJoinRoom("upcoming", "2026-01-01T12:10:00Z", now), true)
  assert.equal(canJoinRoom("upcoming", "2026-01-01T13:00:00Z", now), false)
})

const fakeSocket = () => {
  const listeners = new Map()
  return {
    connected: false,
    connects: 0,
    emitted: [],
    connect() {
      this.connects++
    },
    emit(event, payload) {
      this.emitted.push([event, payload])
    },
    on(event, listener) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event).add(listener)
    },
    off(event, listener) {
      listeners.get(event)?.delete(listener)
    },
    fire(event, payload) {
      for (const listener of [...(listeners.get(event) ?? [])])
        listener(payload)
    },
    count: (event) => listeners.get(event)?.size ?? 0,
  }
}

const roomListener = () => {
  const log = { messages: [], joined: 0, errors: [], reconnected: 0 }
  return {
    log,
    onMessage: (message) => log.messages.push(message),
    onJoined: () => log.joined++,
    onError: (message) => log.errors.push(message),
    onConnected: () => log.reconnected++,
  }
}

test("joining connects once, and subscribes as soon as the socket is up", () => {
  const socket = fakeSocket()
  const rooms = new TlRooms(socket)
  const listener = roomListener()
  rooms.join("vid", "en", listener)
  assert.equal(socket.connects, 1)
  assert.deepEqual(socket.emitted, [])

  socket.connected = true
  socket.fire("connect")
  assert.deepEqual(socket.emitted, [
    ["subscribe", { video_id: "vid", lang: "en" }],
  ])
  assert.deepEqual(rooms.getConnection(), { kind: "connected" })
  assert.equal(listener.log.reconnected, 1)
})

test("two chats on one room share a single subscription and both get messages", () => {
  const socket = fakeSocket()
  socket.connected = true
  const rooms = new TlRooms(socket)
  const first = roomListener()
  const second = roomListener()
  const leaveFirst = rooms.join("vid", "en", first)
  const leaveSecond = rooms.join("vid", "en", second)

  assert.equal(
    socket.emitted.filter(([event]) => event === "subscribe").length,
    1
  )
  assert.equal(second.log.joined, 1, "already subscribed, so joined at once")

  socket.fire("vid/en", { name: "TL", message: "hello", timestamp: 1 })
  assert.equal(first.log.messages.length, 1)
  assert.equal(second.log.messages.length, 1)

  leaveFirst()
  assert.equal(
    socket.emitted.filter(([event]) => event === "unsubscribe").length,
    0,
    "still in use"
  )
  leaveSecond()
  assert.deepEqual(socket.emitted.at(-1), [
    "unsubscribe",
    { video_id: "vid", lang: "en" },
  ])
  assert.equal(socket.count("vid/en"), 0)
})

test("after a dropped connection, rooms resubscribe without doubling up", () => {
  const socket = fakeSocket()
  socket.connected = true
  const rooms = new TlRooms(socket)
  const listener = roomListener()
  rooms.join("vid", "en", listener)
  assert.equal(socket.count("vid/en"), 1)

  socket.connected = false
  socket.fire("disconnect")
  assert.equal(rooms.getConnection().kind, "reconnecting")
  assert.equal(socket.count("vid/en"), 0)

  socket.connected = true
  socket.fire("connect")
  assert.equal(socket.count("vid/en"), 1)
  assert.equal(listener.log.reconnected, 1, "told to fetch what it missed")
})

test("subscription errors reach only that stream's chats", () => {
  const socket = fakeSocket()
  socket.connected = true
  const rooms = new TlRooms(socket)
  const here = roomListener()
  const there = roomListener()
  rooms.join("here", "en", here)
  rooms.join("there", "en", there)
  socket.fire("subscribeError", { id: "here", message: "Nope" })
  assert.deepEqual(here.log.errors, ["Nope"])
  assert.deepEqual(there.log.errors, [])
})

test("reconnect progress is visible and failure is final", () => {
  const rooms = new TlRooms(fakeSocket())
  let changes = 0
  rooms.subscribeConnection(() => changes++)
  rooms.reportReconnecting(3)
  assert.deepEqual(rooms.getConnection(), { kind: "reconnecting", attempt: 3 })
  rooms.reportReconnectFailed()
  assert.deepEqual(rooms.getConnection(), { kind: "failed" })
  assert.equal(changes, 2)
})
