import assert from "node:assert/strict"
import test from "node:test"
import {
  activeVideos,
  frameOrder,
  instantiateSlots,
  videoCells,
} from "../src/lib/multiview/cells.ts"
import {
  decodeLayout,
  encodeLayout,
  permalinkPath,
  singleVideoPath,
} from "../src/lib/multiview/codec.ts"
import { neighbourTarget, resolveChats } from "../src/lib/multiview/chat.ts"
import { GRID_SIZE, rectsCollide } from "../src/lib/multiview/grid.ts"
import {
  addCell,
  addVideo,
  applyLayout,
  fillFirstEmptyCell,
  matchesPreset,
  mergeVideoData,
  muteAllButFirst,
  muteAllExcept,
  pickAutoPreset,
  removeCellAuto,
  restoreLayout,
  setCellContent,
  swapCells,
} from "../src/lib/multiview/layout.ts"
import { cellsFromLegacy } from "../src/lib/multiview/legacy.ts"
import {
  decodeAutoLayout,
  defaultAutoLayout,
  DESKTOP_PRESETS,
  groupPresets,
  MOBILE_PRESETS,
} from "../src/lib/multiview/presets.ts"
import {
  isPlayableInMultiview,
  needsMetadata,
  parseVideoUrl,
  refreshable,
  selectTrayVideos,
  toMultiviewVideo,
  twitchChannelStub,
  videoFromDrop,
  withMetadata,
  youtubeLang,
  youtubeStub,
} from "../src/lib/multiview/stream.ts"

const decode = (encoded) => {
  const layout = decodeLayout(encoded)
  assert.ok(layout, `${encoded} should decode`)
  return layout
}
const cellsOf = (encoded) => instantiateSlots(decode(encoded).slots)
const video = (id) => youtubeStub(id.padEnd(11, "x"))
const context = () => ({
  autoPresets: decodeAutoLayout(defaultAutoLayout()),
  knownPresets: [
    ...decodeAutoLayout(defaultAutoLayout()),
    ...DESKTOP_PRESETS,
  ],
})
const filled = (encoded, ...ids) => {
  let cells = cellsOf(encoded)
  for (const id of ids) cells = fillFirstEmptyCell(cells, video(id))
  return cells
}

test("permalinks from the previous UI decode to the same cells", () => {
  const layout = decode("AAUYdQw4w9WgXcQ,UAEYchat")
  assert.equal(layout.videoCellCount, 1)
  assert.deepEqual(layout.slots[0].rect, { x: 0, y: 0, w: 20, h: 24 })
  assert.equal(layout.slots[0].content.video.id, "dQw4w9WgXcQ")
  assert.deepEqual(layout.slots[1].rect, { x: 20, y: 0, w: 4, h: 24 })
  assert.equal(layout.slots[1].content.type, "chat")
  assert.deepEqual(layout.slots[1].content.target, { kind: "auto" })
})

test("the channel label on old links is kept as the stream's name", () => {
  const [slot] = decode("AAYYabcdefghijkSome Name").slots
  assert.equal(slot.content.video.id, "abcdefghijk")
  assert.equal(slot.content.video.channel.name, "Some Name")
})

test("twitch cells decode to a playable channel", () => {
  const [slot] = decode("AAYYtwitchSome_Channel").slots
  assert.equal(slot.content.video.id, "tw:some_channel")
  assert.equal(slot.content.video.source.provider, "twitch")
  assert.equal(slot.content.video.source.channel, "some_channel")
})

test("parts are sorted before decoding, which chat numbers depend on", () => {
  const { slots } = decode("MAMYbbbbbbbbbbb,AAMYaaaaaaaaaaa")
  assert.equal(slots[0].content.video.id, "aaaaaaaaaaa")
  assert.equal(slots[1].content.video.id, "bbbbbbbbbbb")
})

test("malformed and hostile layouts are rejected rather than half applied", () => {
  assert.equal(decodeLayout(""), null)
  assert.equal(decodeLayout("AA"), null)
  assert.equal(decodeLayout("!!!!"), null)
  const { slots } = decode("AAYY<img src=x onerror=alert(1)>")
  assert.equal(slots[0].content, null, "unrecognized content is an empty cell")
})

test("a crafted link cannot create an unbounded number of players", () => {
  const encoded = Array.from({ length: 500 }, () => "AAYY").join(",")
  assert.equal(decode(encoded).slots.length, 64)
})

test("off-grid rects from old layouts are pulled back onto the grid", () => {
  const { rect } = decode("AYEG").slots[0]
  assert.ok(rect.y + rect.h <= GRID_SIZE)
})

test("layouts survive an encode and decode round trip", () => {
  for (const preset of [...DESKTOP_PRESETS, ...MOBILE_PRESETS]) {
    const again = decode(encodeLayout(instantiateSlots(preset.slots)))
    assert.deepEqual(
      again.slots.map((s) => s.rect),
      preset.slots.map((s) => s.rect),
      preset.name
    )
    assert.equal(again.videoCellCount, preset.videoCellCount, preset.name)
  }
})

test("permalinks carry videos while saved presets carry only the shape", () => {
  const cells = filled("AAMY,MAMY", "aaa", "bbb")
  assert.equal(encodeLayout(cells), "AAMY,MAMY")
  assert.equal(
    encodeLayout(cells, { includeVideo: true }),
    "AAMYaaaxxxxxxxx,MAMYbbbxxxxxxxx"
  )
  assert.equal(
    permalinkPath(cells),
    "/multiview/AAMYaaaxxxxxxxx%2CMAMYbbbxxxxxxxx"
  )
})

test("chat numbers in a permalink survive cells being rearranged", () => {
  // The chat follows `bbb`, and moving the cells must not change that.
  let cells = filled("AAKY,KAKY,UAEYchat", "aaa", "bbb")
  const [first, second] = videoCells(cells)
  const chat = cells.find((c) => c.content?.type === "chat")
  cells = setCellContent(cells, chat.id, {
    ...chat.content,
    target: { kind: "cell", cellId: second.id },
  })
  cells = swapCells(cells, first.id, second.id)
  const restored = instantiateSlots(
    decode(encodeLayout(cells, { includeVideo: true })).slots
  )
  const resolved = resolveChats(restored)
  const restoredChat = restored.find((c) => c.content?.type === "chat")
  assert.equal(resolved.get(restoredChat.id).video.id, "bbbxxxxxxxx")
})

test("a chat for a stream off the grid has a permalink form", () => {
  const cells = instantiateSlots([
    {
      rect: { x: 0, y: 0, w: 4, h: 24 },
      content: {
        type: "chat",
        target: { kind: "video", video: video("ccc") },
        panels: { chat: true, tl: false },
      },
    },
  ])
  const encoded = encodeLayout(cells, { includeVideo: true })
  assert.equal(encoded, "AAEYchat-cccxxxxxxxx")
  const [slot] = decode(encoded).slots
  assert.equal(slot.content.target.kind, "video")
  assert.equal(slot.content.target.video.id, "cccxxxxxxxx")

  const twitch = instantiateSlots([
    {
      rect: { x: 0, y: 0, w: 4, h: 24 },
      content: {
        type: "chat",
        target: { kind: "video", video: twitchChannelStub("Peko") },
        panels: { chat: true, tl: false },
      },
    },
  ])
  const decoded = decode(encodeLayout(twitch, { includeVideo: true }))
  assert.equal(decoded.slots[0].content.target.video.id, "tw:peko")
})

test("open-in-multiview links are one video and a side chat", () => {
  assert.equal(
    singleVideoPath(video("abc")),
    "/multiview/AAUYabcxxxxxxxx%2CUAEYchat"
  )
  assert.equal(
    singleVideoPath(twitchChannelStub("peko")),
    "/multiview/AAUYtwitchpeko%2CUAEYchat"
  )
})

test("presets are detected whatever order the cells are in", () => {
  const cells = cellsOf("AAMY,MAMY")
  assert.ok(matchesPreset(cells.toReversed(), DESKTOP_PRESETS))
  const moved = [{ ...cells[0], rect: { x: 0, y: 0, w: 5, h: 5 } }, cells[1]]
  assert.ok(!matchesPreset(moved, DESKTOP_PRESETS))
})

test("auto layout takes the exact size or else the next that fits", () => {
  const presets = decodeAutoLayout(defaultAutoLayout())
  assert.equal(pickAutoPreset(presets, 2).videoCellCount, 2)
  // Nothing is designated for 15 videos.
  assert.equal(pickAutoPreset(presets, 15).videoCellCount, 16)
  assert.equal(pickAutoPreset(presets, 99), undefined)
})

test("the saved auto-layout table groups saved layouts ahead of built-ins", () => {
  const custom = [{ ...decode("AAMY,MAMY"), name: "Mine" }]
  const twos = groupPresets(custom).find((g) => g.videoCount === 2)
  assert.equal(twos.presets[0].name, "Mine")
  assert.equal(twos.presets[0].custom, true)
  assert.equal(
    twos.presets.filter((p) => p.id === "AAMY,MAMY").length,
    1,
    "a saved layout replaces the identical built-in"
  )
})

test("adding a video uses an empty cell before touching the layout", () => {
  const cells = cellsOf("AAMY,MAMY")
  const outcome = addVideo(cells, video("aaa"), context())
  assert.equal(outcome.kind, "placed")
  assert.equal(activeVideos(outcome.cells).length, 1)
  assert.deepEqual(
    outcome.cells.map((c) => c.id),
    cells.map((c) => c.id)
  )
})

test("adding a video to a preset grows into the next one, keeping players", () => {
  let cells = []
  const ids = new Map()
  for (const name of ["aaa", "bbb", "ccc", "ddd"]) {
    const outcome = addVideo(cells, video(name), context())
    assert.equal(outcome.kind, "placed", name)
    cells = outcome.cells
    for (const cell of videoCells(cells)) {
      const known = ids.get(cell.content.video.id)
      if (known) {
        assert.equal(cell.id, known, `${cell.content.video.id} kept its cell`)
      }
      ids.set(cell.content.video.id, cell.id)
    }
  }
  assert.equal(activeVideos(cells).length, 4)
})

test("a hand-made layout asks before auto layout replaces it", () => {
  const cells = filled("AAMY,MAMY", "aaa", "bbb").map((cell, i) =>
    i === 0 ? { ...cell, rect: { ...cell.rect, w: 11 } } : cell
  )
  const outcome = addVideo(cells, video("ccc"), context())
  assert.equal(outcome.kind, "needs-confirmation")
  assert.equal(outcome.proposal.videoCellCount, 3)
})

test("adding a cell to a hand-made layout finds free space, and refuses when full", () => {
  const tiny = cellsOf("AAEE,EAEE")
  const next = addCell(tiny, context())
  assert.equal(next.length, 3)
  assert.ok(!rectsCollide(next[2].rect, next[0].rect))
  assert.ok(!rectsCollide(next[2].rect, next[1].rect))

  const full = [
    { id: "full", rect: { x: 0, y: 0, w: 24, h: 23 }, content: null },
    { id: "rest", rect: { x: 0, y: 23, w: 24, h: 1 }, content: null },
  ]
  assert.equal(addCell(full, context()), null)
})

test("merging moves videos by position without changing their ids", () => {
  const cells = filled("AAMY,MAMM,MMMM", "aaa", "bbb", "ccc")
  const before = new Map(cells.map((c) => [c.content.video.id, c.id]))
  const next = applyLayout(cells, decode("AAIM,AMIM,IAIM,IMIM,QAIM,QMIM"), {
    merge: true,
  })
  assert.equal(next.length, 6)
  for (const cell of videoCells(next)) {
    assert.equal(cell.id, before.get(cell.content.video.id))
  }
})

test("merging follows what is on screen, not the order cells were added", () => {
  let cells = filled("AAMY,MAMY", "aaa", "bbb")
  const [first, second] = cells
  cells = swapCells(cells, first.id, second.id)
  const next = applyLayout(cells, decode("AAMM,AMMM,MAMY"), { merge: true })
  assert.equal(videoCells(next)[0].content.video.id, "bbbxxxxxxxx")
})

test("merging keeps chat cells alive and pointed at the same video", () => {
  let cells = filled("AAKM,AMKM,UAEYchat", "aaa", "bbb")
  const chat = cells.find((c) => c.content?.type === "chat")
  const bbb = videoCells(cells).find((c) => c.content.video.id.startsWith("bbb"))
  cells = setCellContent(cells, chat.id, {
    ...chat.content,
    target: { kind: "cell", cellId: bbb.id },
  })
  const next = applyLayout(cells, decode("AAJM,AMJM,JAJM,JMJM,SAGYchat"), {
    merge: true,
  })
  const kept = next.find((c) => c.id === chat.id)
  assert.ok(kept, "the chat cell, and so its iframe, survives")
  assert.equal(resolveChats(next).get(chat.id).video.id, "bbbxxxxxxxx")
})

test("merging into a smaller layout releases chats whose video was dropped", () => {
  let cells = filled("AAKM,AMKM,UAEYchat", "aaa", "bbb")
  const chat = cells.find((c) => c.content?.type === "chat")
  const bbb = videoCells(cells).find((c) => c.content.video.id.startsWith("bbb"))
  cells = setCellContent(cells, chat.id, {
    ...chat.content,
    target: { kind: "cell", cellId: bbb.id },
  })
  const next = applyLayout(cells, decode("AAUY,UAEYchat0"), { merge: true })
  const resolved = resolveChats(next).get(chat.id)
  assert.equal(resolved.video.id, "aaaxxxxxxxx", "chat moves to what remains")
})

test("removing from a preset flows into the next smaller one", () => {
  const cells = filled("AAMY,MAMM,MMMM", "aaa", "bbb", "ccc")
  const gone = videoCells(cells)[0]
  const next = removeCellAuto(cells, gone.id, context())
  assert.equal(activeVideos(next).length, 2)
  const remaining = new Set(cells.map((c) => c.id))
  for (const cell of videoCells(next)) assert.ok(remaining.has(cell.id))
})

test("removing the last video of a preset clears the layout", () => {
  const cells = filled("AAUY,UAEYchat0", "aaa")
  const [only] = videoCells(cells)
  assert.deepEqual(removeCellAuto(cells, only.id, context()), [])
})

test("removing from a hand-made layout leaves the rest where they are", () => {
  const cells = filled("AAFF,FAFF,KAFF", "aaa", "bbb", "ccc")
  const next = removeCellAuto(cells, cells[1].id, context())
  assert.equal(next.length, 2)
  assert.deepEqual(next[0].rect, cells[0].rect)
  assert.deepEqual(next[1].rect, cells[2].rect)
})

test("swapping trades rects and nothing else", () => {
  const cells = filled("AAMY,MAMM", "aaa", "bbb")
  const [a, b] = cells
  const next = swapCells(cells, a.id, b.id)
  assert.deepEqual(next[0].rect, b.rect)
  assert.deepEqual(next[1].rect, a.rect)
  assert.equal(next[0].id, a.id)
  assert.equal(next[0].content, a.content)
})

test("frame order is stable: updates never reorder two existing frames", () => {
  const cells = filled("AAKM,AMKM,KAKM,KMKM", "a", "b", "c", "d")
  const before = frameOrder(cells).map((c) => c.id)
  const swapped = swapCells(cells, cells[0].id, cells[3].id)
  assert.deepEqual(
    frameOrder(swapped).map((c) => c.id),
    before
  )

  const grown = addVideo(swapped, video("e"), context())
  const after = frameOrder(
    grown.kind === "placed" ? grown.cells : swapped
  ).map((c) => c.id)
  const survivors = after.filter((id) => before.includes(id))
  assert.deepEqual(
    survivors,
    before.filter((id) => survivors.includes(id))
  )
})

test("mute others silences everything but the chosen video", () => {
  const cells = filled("AAKM,AMKM,UAEYchat", "aaa", "bbb")
  const [a, b] = videoCells(cells)
  const next = videoCells(muteAllExcept(cells, b.id))
  assert.equal(next.find((c) => c.id === a.id).content.muted, true)
  assert.equal(next.find((c) => c.id === b.id).content.muted, false)
  const first = videoCells(muteAllButFirst(cells))
  assert.equal(first[0].content.muted, false)
  assert.equal(first[1].content.muted, true)
})

test("fresh details reach both cells and fixed chats, and failures are marked", () => {
  const cells = instantiateSlots([
    {
      rect: { x: 0, y: 0, w: 12, h: 24 },
      content: { type: "video", video: video("aaa") },
    },
    {
      rect: { x: 12, y: 0, w: 12, h: 24 },
      content: {
        type: "chat",
        target: { kind: "video", video: video("bbb") },
        panels: { chat: true, tl: false },
      },
    },
  ])
  const next = mergeVideoData(
    cells,
    new Map([
      [
        "aaaxxxxxxxx",
        { title: "A title", channel: { id: "UC1", name: "Aqua" } },
      ],
    ]),
    new Set(["bbbxxxxxxxx"])
  )
  assert.equal(next[0].content.video.title, "A title")
  assert.equal(next[0].content.video.channel.name, "Aqua")
  assert.equal(next[1].content.target.video.noData, true)
})

test("automatic chats spread across videos instead of doubling up", () => {
  const cells = filled("AAKM,AMKM,UAEMchat0,UMEMchat0", "aaa", "bbb")
  const chats = cells.filter((c) => c.content?.type === "chat")
  const resolved = resolveChats(cells)
  assert.equal(resolved.get(chats[0].id).video.id, "aaaxxxxxxxx")
  assert.equal(resolved.get(chats[1].id).video.id, "bbbxxxxxxxx")
})

test("a chat prefers the video its number points at", () => {
  const cells = filled("AAMM,AMMM,MAHY,TAFYchat2", "aaa", "bbb", "ccc")
  const chat = cells.find((c) => c.content?.type === "chat")
  assert.equal(resolveChats(cells).get(chat.id).video.id, "cccxxxxxxxx")
})

test("explicit chat choices are taken before automatic ones spread out", () => {
  let cells = filled("AAKM,AMKM,UAEMchat,UMEMchat", "aaa", "bbb")
  const chats = cells.filter((c) => c.content?.type === "chat")
  const [aaa] = videoCells(cells)
  cells = setCellContent(cells, chats[1].id, {
    ...chats[1].content,
    target: { kind: "cell", cellId: aaa.id },
  })
  const resolved = resolveChats(cells)
  assert.equal(resolved.get(chats[1].id).sourceCellId, aaa.id)
  assert.equal(resolved.get(chats[0].id).video.id, "bbbxxxxxxxx")
})

test("a fixed chat keeps its stream, and links up if that stream is on the grid", () => {
  const cells = instantiateSlots([
    {
      rect: { x: 0, y: 0, w: 12, h: 24 },
      content: { type: "video", video: video("aaa") },
    },
    {
      rect: { x: 12, y: 0, w: 6, h: 24 },
      content: {
        type: "chat",
        target: { kind: "video", video: video("zzz") },
        panels: { chat: true, tl: false },
      },
    },
    {
      rect: { x: 18, y: 0, w: 6, h: 24 },
      content: {
        type: "chat",
        target: { kind: "video", video: video("aaa") },
        panels: { chat: true, tl: false },
      },
    },
  ])
  const resolved = resolveChats(cells)
  assert.equal(resolved.get(cells[1].id).video.id, "zzzxxxxxxxx")
  assert.equal(resolved.get(cells[1].id).sourceCellId, null)
  assert.equal(resolved.get(cells[2].id).sourceCellId, cells[0].id)
})

test("clearing a cell releases chats following it", () => {
  let cells = filled("AAKM,AMKM,UAEYchat", "aaa", "bbb")
  const chat = cells.find((c) => c.content?.type === "chat")
  const [aaa] = videoCells(cells)
  cells = setCellContent(cells, chat.id, {
    ...chat.content,
    target: { kind: "cell", cellId: aaa.id },
  })
  cells = setCellContent(cells, aaa.id, null)
  assert.equal(cells.find((c) => c.id === chat.id).content.target.kind, "auto")
})

test("chat arrows step through videos and stop at the ends", () => {
  const cells = filled("AAKM,AMKM", "aaa", "bbb")
  const [a, b] = videoCells(cells)
  assert.deepEqual(neighbourTarget(cells, a.id, 1), {
    kind: "cell",
    cellId: b.id,
  })
  assert.equal(neighbourTarget(cells, b.id, 1), null)
  assert.equal(neighbourTarget(cells, a.id, -1), null)
})

test("links of every supported shape parse to the right stream", () => {
  const youtube = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=abc",
    "https://www.youtube.com/watch?list=abc&v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?t=10",
    "https://www.youtube.com/live/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://holodex.net/watch/dQw4w9WgXcQ",
    "youtube.com/watch?v=dQw4w9WgXcQ",
  ]
  for (const link of youtube) {
    assert.equal(parseVideoUrl(link)?.id, "dQw4w9WgXcQ", link)
  }
  assert.equal(parseVideoUrl("https://www.twitch.tv/Peko")?.id, "tw:peko")
  assert.equal(parseVideoUrl("twitch.tv/peko")?.id, "tw:peko")
  assert.equal(
    parseVideoUrl("https://www.twitch.tv/videos/12345")?.id,
    "twvod:12345"
  )
  assert.equal(parseVideoUrl("https://www.twitch.tv/directory"), null)
  assert.equal(parseVideoUrl("https://example.com/watch?v=dQw4w9WgXcQ"), null)
  assert.equal(parseVideoUrl("not a link"), null)
})

test("feed videos map to streams; unplayable placeholders do not", () => {
  const base = { channel: { id: "UC1", name: "Aqua" }, status: "live" }
  assert.equal(
    toMultiviewVideo({ ...base, id: "dQw4w9WgXcQ", type: "stream" }).id,
    "dQw4w9WgXcQ"
  )
  assert.equal(
    toMultiviewVideo({ ...base, id: "tw:Peko:123", type: "stream" }).id,
    "tw:peko"
  )
  const twitchPlaceholder = toMultiviewVideo({
    ...base,
    id: "abc",
    type: "placeholder",
    placeholderType: "external-stream",
    link: "https://www.twitch.tv/peko",
  })
  assert.equal(twitchPlaceholder.source.provider, "twitch")
  assert.equal(
    toMultiviewVideo({
      ...base,
      id: "abc",
      type: "placeholder",
      placeholderType: "event",
      link: "https://example.com",
    }),
    null
  )
})

test("the previous UI's saved layout imports with its videos and chats", () => {
  const cells = cellsFromLegacy({
    layout: [
      { i: "one", x: 0, y: 0, w: 12, h: 24 },
      { i: "two", x: 12, y: 0, w: 6, h: 24 },
      { i: "three", x: 18, y: 0, w: 3, h: 24 },
      { i: "four", x: 21, y: 0, w: 3, h: 24 },
      { i: "five", x: 40, y: 40, w: 3, h: 3 },
    ],
    layoutContent: {
      one: {
        type: "video",
        id: "dQw4w9WgXcQ",
        muted: true,
        video: {
          id: "dQw4w9WgXcQ",
          title: "A stream",
          status: "live",
          channel: { id: "UC1", name: "Aqua" },
        },
      },
      two: {
        type: "video",
        id: "peko",
        video: { id: "peko", type: "twitch", channel: { name: "peko" } },
      },
      three: { type: "chat", currentTab: 1 },
      four: { type: "chat", initAsTL: true },
    },
  })
  assert.equal(cells.length, 5)
  assert.equal(cells[0].content.video.title, "A stream")
  assert.equal(cells[0].content.muted, true)
  assert.equal(cells[1].content.video.id, "tw:peko")
  assert.deepEqual(cells[2].content.target, { kind: "auto", prefer: 1 })
  assert.deepEqual(cells[3].content.panels, { chat: false, tl: true })
  assert.equal(cells[4].content, null)
  assert.ok(cells[4].rect.x + cells[4].rect.w <= GRID_SIZE)
})

test("corrupt saved state from the previous UI imports as nothing", () => {
  assert.deepEqual(cellsFromLegacy({}), [])
  assert.deepEqual(cellsFromLegacy({ layout: "nope" }), [])
  assert.deepEqual(cellsFromLegacy({ layout: [null, { i: 3 }] }), [])
})

test("a stream known only by id needs looking up, even with a channel label", () => {
  assert.equal(needsMetadata(youtubeStub("abcdefghijk")), true)
  assert.equal(needsMetadata(youtubeStub("abcdefghijk", "Aqua")), true)
  assert.equal(
    needsMetadata({ ...youtubeStub("abcdefghijk"), status: "past" }),
    false
  )
  assert.equal(
    needsMetadata({ ...youtubeStub("abcdefghijk"), noData: true }),
    false
  )
  assert.equal(needsMetadata(twitchChannelStub("peko")), false)
})

test("details found by oEmbed stop further lookups; catalog ones allow them", () => {
  const stub = youtubeStub("abcdefghijk")
  assert.equal(withMetadata(stub, { title: "A", noData: true }).noData, true)
  assert.equal(withMetadata(stub, { status: "live" }).noData, false)
})

test("only streams that could have changed get refreshed", () => {
  const stub = youtubeStub("abcdefghijk")
  assert.equal(refreshable({ ...stub, status: "live" }), true)
  assert.equal(refreshable({ ...stub, status: "upcoming" }), true)
  assert.equal(refreshable({ ...stub, status: "past" }), false)
  assert.equal(refreshable(twitchChannelStub("peko")), false)
})

const feedVideo = (id, overrides = {}) => ({
  id,
  type: "stream",
  status: "upcoming",
  channel: { id: "UC1", name: "Aqua" },
  ...overrides,
})

test("the tray shows who is on now and soon, minus what is on screen", () => {
  const now = Date.parse("2026-01-01T12:00:00Z")
  const inHours = (h) => new Date(now + h * 3600_000).toISOString()
  const videos = [
    feedVideo("live", { status: "live" }),
    feedVideo("soon", { start_scheduled: inHours(1) }),
    feedVideo("later", { start_scheduled: inHours(5) }),
    feedVideo("onscreen", { status: "live" }),
    feedVideo("distant", { start_scheduled: inHours(30) }),
  ]
  assert.deepEqual(
    selectTrayVideos(videos, new Set(["onscreen"]), now).map((v) => v.id),
    ["live", "soon", "later"]
  )
})

test("a long tray narrows to the next two hours", () => {
  const now = Date.parse("2026-01-01T12:00:00Z")
  const later = new Date(now + 5 * 3600_000).toISOString()
  const videos = Array.from({ length: 10 }, (_, i) =>
    feedVideo(`v${i}`, { start_scheduled: later })
  )
  assert.equal(selectTrayVideos(videos, new Set(), now).length, 7)
})

test("the feed only offers what the multiview can actually play", () => {
  assert.equal(isPlayableInMultiview(feedVideo("abcdefghijk")), true)
  assert.equal(
    isPlayableInMultiview(feedVideo("abcdefghijk", { type: "clip" })),
    false
  )
  assert.equal(
    isPlayableInMultiview(
      feedVideo("abc", {
        type: "placeholder",
        placeholderType: "event",
        link: "https://example.com",
      })
    ),
    false
  )
})

test("drops accept a card's JSON or a link, and survive garbage", () => {
  const card = JSON.stringify(feedVideo("abcdefghijk"))
  assert.equal(videoFromDrop(card, "")?.id, "abcdefghijk")
  assert.equal(
    videoFromDrop("", "https://youtu.be/dQw4w9WgXcQ")?.id,
    "dQw4w9WgXcQ"
  )
  assert.equal(
    videoFromDrop("{not json", "https://youtu.be/dQw4w9WgXcQ")?.id,
    "dQw4w9WgXcQ"
  )
  assert.equal(videoFromDrop('{"id": 5}', "nothing useful"), null)
  assert.equal(videoFromDrop("null", ""), null)
})

test("languages map to what YouTube's player understands", () => {
  assert.equal(youtubeLang("en"), "en")
  assert.equal(youtubeLang("pt-BR"), "pt")
  assert.equal(youtubeLang("zh"), "zh-Hant")
  assert.equal(youtubeLang("lol-PEKO"), "en")
})

test("undoing a layout change keeps details and mute state learned since", () => {
  const before = filled("AAMY,MAMY", "aaa", "bbb")
  const [first, second] = before
  const swapped = swapCells(before, first.id, second.id)
  // While that edit stands, a lookup answers and someone gets muted.
  let current = mergeVideoData(
    swapped,
    new Map([["aaaxxxxxxxx", { title: "Now known" }]])
  )
  current = muteAllExcept(current, second.id)

  const restored = restoreLayout(before, current)
  const a = restored.find((c) => c.id === first.id)
  assert.deepEqual(a.rect, first.rect, "the position is what gets undone")
  assert.equal(a.content.video.title, "Now known")
  assert.equal(a.content.muted, true)
})

test("undo brings back a removed video exactly as it was", () => {
  const before = filled("AAMY,MAMY", "aaa", "bbb")
  const current = before.slice(1)
  const restored = restoreLayout(before, current)
  assert.equal(restored.length, 2)
  assert.equal(restored[0].content.video.id, "aaaxxxxxxxx")
})
