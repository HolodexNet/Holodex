import assert from "node:assert/strict"
import test from "node:test"
import { frameOrder, soleAudibleCell } from "../src/lib/multiview/cells.ts"
import {
  findCenterCell,
  neighbourOfCenter,
  screenPositions,
  swapIntoCenter,
} from "../src/lib/multiview/director.ts"
import { youtubeStub } from "../src/lib/multiview/stream.ts"

const videoCell = (id, x, y, w, h, muted = false) => ({
  id,
  rect: { x, y, w, h },
  content: {
    type: "video",
    video: youtubeStub(id.padEnd(11, "x")),
    muted,
  },
})

/** A big screen over a row of three. */
const staged = (muted = false) => [
  videoCell("a", 0, 0, 24, 18, muted),
  videoCell("b", 0, 18, 8, 6, muted),
  videoCell("c", 8, 18, 8, 6, muted),
  videoCell("d", 16, 18, 8, 6, muted),
]

const equals = () => [
  videoCell("a", 0, 0, 12, 12),
  videoCell("b", 12, 0, 12, 12),
  videoCell("c", 0, 12, 12, 12),
  videoCell("d", 12, 12, 12, 12),
]

const NEITHER = { director: false, audioFocus: false }

test("a video clearly bigger than the rest is the big screen", () => {
  assert.equal(findCenterCell(staged()).id, "a")
  const sideBySide = [
    videoCell("a", 0, 0, 12, 24),
    videoCell("b", 12, 0, 12, 12),
  ]
  assert.equal(findCenterCell(sideBySide).id, "a")
})

test("a layout of equals has no big screen, unless the director says so", () => {
  assert.equal(findCenterCell(equals()), null)
  assert.equal(findCenterCell(equals(), { force: true }).id, "a")
})

test("one video alone has nothing to swap with", () => {
  const alone = [videoCell("a", 0, 0, 24, 24)]
  assert.equal(findCenterCell(alone), null)
  assert.equal(findCenterCell(alone, { force: true }), null)
})

test("only videos can be the big screen", () => {
  const cells = [
    {
      id: "chat",
      rect: { x: 0, y: 0, w: 24, h: 20 },
      content: { type: "chat" },
    },
    { id: "empty", rect: { x: 0, y: 20, w: 12, h: 4 }, content: null },
    videoCell("a", 12, 20, 8, 4),
    videoCell("b", 20, 20, 4, 4),
  ]
  assert.equal(findCenterCell(cells).id, "a")
})

test("the others are numbered as they read on screen", () => {
  const cells = staged()
  assert.deepEqual(
    screenPositions(cells, cells[0]).map((cell) => cell.id),
    ["b", "c", "d"]
  )
  const stacked = [
    videoCell("big", 0, 0, 16, 24),
    videoCell("low", 16, 12, 8, 12),
    videoCell("high", 16, 0, 8, 12),
  ]
  assert.deepEqual(
    screenPositions(stacked, stacked[0]).map((cell) => cell.id),
    ["high", "low"]
  )
})

test("a swap trades rects and nothing else", () => {
  const cells = staged()
  const swapped = swapIntoCenter(cells, "c", NEITHER)
  const byId = new Map(swapped.map((cell) => [cell.id, cell]))
  assert.deepEqual(byId.get("c").rect, cells[0].rect)
  assert.deepEqual(byId.get("a").rect, cells[2].rect)
  assert.deepEqual(byId.get("b").rect, cells[1].rect)
  for (const before of cells) {
    assert.equal(byId.get(before.id).content, before.content, before.id)
  }
})

test("a swap cannot change the order frames are rendered in", () => {
  const cells = staged()
  const ids = (list) => frameOrder(list).map((cell) => cell.id)
  assert.deepEqual(ids(swapIntoCenter(cells, "c", NEITHER)), ids(cells))
})

test("a number always means the same place, so pressing it twice swaps back", () => {
  const cells = staged()
  const place = (list, position) =>
    screenPositions(list, findCenterCell(list))[position].rect
  const once = swapIntoCenter(cells, "c", NEITHER)
  assert.deepEqual(place(once, 1), place(cells, 1))
  const target = screenPositions(once, findCenterCell(once))[1].id
  assert.equal(target, "a", "the old big screen is what is there now")
  const twice = swapIntoCenter(once, target, NEITHER)
  assert.deepEqual(
    twice,
    cells.map((cell) => ({ ...cell }))
  )
})

test("stepping visits every stream, and wraps around", () => {
  let cells = staged()
  const visited = []
  for (let i = 0; i < 4; i++) {
    const center = findCenterCell(cells)
    visited.push(center.id)
    cells = swapIntoCenter(
      cells,
      neighbourOfCenter(cells, center, 1).id,
      NEITHER
    )
  }
  assert.deepEqual(visited, ["a", "b", "c", "d"])
  assert.equal(findCenterCell(cells).id, "a")
  assert.equal(neighbourOfCenter(cells, findCenterCell(cells), -1).id, "d")
})

test("under Audio Focus the sound goes with the swap", () => {
  const cells = staged(true).map((cell) =>
    cell.id === "a"
      ? { ...cell, content: { ...cell.content, muted: false } }
      : cell
  )
  const swapped = swapIntoCenter(cells, "c", {
    director: false,
    audioFocus: true,
  })
  assert.equal(soleAudibleCell(swapped), "c")
})

test("without Audio Focus a swap leaves all sound alone", () => {
  const cells = staged(true)
  const swapped = swapIntoCenter(cells, "c", NEITHER)
  assert.ok(swapped.every((cell) => cell.content.muted))
})

test("swapping is available in a layout of equals only to a director", () => {
  const cells = equals()
  assert.equal(swapIntoCenter(cells, "d", NEITHER), cells)
  const swapped = swapIntoCenter(cells, "d", {
    director: true,
    audioFocus: false,
  })
  assert.deepEqual(swapped.find((cell) => cell.id === "d").rect, cells[0].rect)
})

test("nothing to do leaves the same list, so nothing is recorded or rendered", () => {
  const cells = staged()
  assert.equal(swapIntoCenter(cells, "a", NEITHER), cells, "already there")
  assert.equal(swapIntoCenter(cells, "gone", NEITHER), cells)
  const withChat = [
    ...cells,
    { id: "chat", rect: { x: 0, y: 0, w: 1, h: 1 }, content: { type: "chat" } },
  ]
  assert.equal(swapIntoCenter(withChat, "chat", NEITHER), withChat)
})
