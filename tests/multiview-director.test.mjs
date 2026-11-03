import assert from "node:assert/strict"
import test from "node:test"
import {
  frameOrder,
  instantiateSlots,
  isControlCell,
  soleAudibleCell,
  videoCells,
} from "../src/lib/multiview/cells.ts"
import {
  arrangeDirector,
  directorRects,
  findCenterCell,
  neighbourOfCenter,
  screenPositions,
  swapIntoCenter,
} from "../src/lib/multiview/director.ts"
import {
  GRID_SIZE,
  MIN_CELL_SIZE,
  rectsCollide,
} from "../src/lib/multiview/grid.ts"
import {
  addVideo,
  fillFirstEmptyCell,
  matchesPreset,
  removeCellAuto,
} from "../src/lib/multiview/layout.ts"
import {
  decodeAutoLayout,
  defaultAutoLayout,
  DESKTOP_PRESETS,
  directorAutoPresets,
  groupPresets,
} from "../src/lib/multiview/presets.ts"
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

const allRects = ({ center, row, chats }) => [center, ...row, ...chats]

const assertFillsTheGrid = (rects, name) => {
  const covered = rects.reduce((sum, { w, h }) => sum + w * h, 0)
  assert.equal(covered, GRID_SIZE * GRID_SIZE, `${name} leaves a gap`)
  rects.forEach((a, i) =>
    rects.slice(i + 1).forEach((b) => {
      assert.equal(rectsCollide(a, b), false, `${name} overlaps`)
    })
  )
  for (const { x, y, w, h } of rects) {
    assert.ok(
      x >= 0 && y >= 0 && x + w <= GRID_SIZE && y + h <= GRID_SIZE,
      name
    )
    assert.ok(w >= MIN_CELL_SIZE && h >= MIN_CELL_SIZE, `${name} too small`)
  }
}

test("a director layout fills the grid, whatever is in it", () => {
  for (let row = 0; row <= 12; row++) {
    assertFillsTheGrid(allRects(directorRects(row)), `row of ${row}`)
  }
  for (let row = 0; row <= 9; row++) {
    for (const chats of [1, 2, 3]) {
      assertFillsTheGrid(
        allRects(directorRects(row, chats)),
        `row of ${row} with ${chats} chats`
      )
    }
  }
})

test("the big screen is on top, with the row in a line under it", () => {
  const { center, row } = directorRects(4)
  assert.deepEqual(center, { x: 0, y: 0, w: 24, h: 18 })
  for (const rect of row) {
    assert.equal(rect.y, center.h, "directly below")
    assert.equal(rect.w, rect.h, "square grid units are 16:9 on a 16:9 stage")
  }
})

test("a chat column leaves the big screen exactly 16:9", () => {
  const { center, row, chats } = directorRects(3, 1)
  assert.deepEqual(center, { x: 0, y: 0, w: 18, h: 18 })
  assert.deepEqual(chats, [{ x: 18, y: 0, w: 6, h: 24 }])
  assert.equal(row[0].w, row[0].h)
})

test("a row with no room left is refused rather than crushed", () => {
  assert.equal(directorRects(13), null)
  assert.equal(directorRects(10, 1), null)
  assert.equal(directorRects(3, 13), null)
})

const mixed = () => [
  videoCell("a", 0, 0, 12, 12),
  videoCell("big", 12, 0, 12, 18),
  videoCell("c", 0, 12, 12, 12),
  { id: "chat", rect: { x: 12, y: 18, w: 6, h: 6 }, content: { type: "chat" } },
  {
    id: "ctl",
    rect: { x: 18, y: 18, w: 6, h: 6 },
    content: { type: "control", panels: { media: true, sync: false } },
  },
]

test("arranging keeps every id and all content, changing only rects", () => {
  const cells = mixed()
  const arranged = arrangeDirector(cells)
  assert.deepEqual(
    arranged.map((cell) => cell.id),
    cells.map((cell) => cell.id)
  )
  arranged.forEach((cell, i) => assert.equal(cell.content, cells[i].content))
  assertFillsTheGrid(
    arranged.map((cell) => cell.rect),
    "arranged"
  )
  assert.deepEqual(
    frameOrder(arranged).map((c) => c.id),
    frameOrder(cells).map((c) => c.id)
  )
})

test("arranging leaves the current big screen as the big screen", () => {
  const arranged = arrangeDirector(mixed())
  assert.equal(findCenterCell(arranged).id, "big")
  const byId = new Map(arranged.map((cell) => [cell.id, cell.rect]))
  assert.equal(byId.get("big").x, 0)
  assert.equal(byId.get("chat").x, 18, "chats go down the side")
})

test("controls go to the end of the row, keeping videos' numbers together", () => {
  const arranged = arrangeDirector(mixed())
  const numbered = screenPositions(arranged, findCenterCell(arranged))
  const control = arranged.find(isControlCell)
  assert.deepEqual(
    numbered.map((cell) => cell.id),
    ["a", "c"]
  )
  assert.ok(numbered.every((cell) => cell.rect.x < control.rect.x))
})

test("arranging needs two videos, and room for everything", () => {
  assert.equal(arrangeDirector([videoCell("a", 0, 0, 24, 24)]), null)
  const crowd = Array.from({ length: 14 }, (_, i) =>
    videoCell(`v${i}`, i, 0, 1, 1)
  )
  assert.equal(arrangeDirector(crowd), null)
})

test("director presets are ordinary presets, and every one has a big screen", () => {
  const directors = DESKTOP_PRESETS.filter((p) => p.name.startsWith("Director"))
  assert.ok(directors.length > 0)
  for (const preset of directors) {
    const cells = instantiateSlots(preset.slots).map((cell, index) =>
      cell.content
        ? cell
        : {
            ...cell,
            content: {
              type: "video",
              video: youtubeStub(String(index).padEnd(11, "x")),
            },
          }
    )
    assertFillsTheGrid(
      cells.map((cell) => cell.rect),
      preset.name
    )
    assert.deepEqual(
      findCenterCell(cells).rect,
      preset.slots[0].rect,
      preset.name
    )
  }
})

test("director presets are offered, but do not take over auto-layout", () => {
  const groups = groupPresets([])
  const threes = groups.find((group) => group.videoCount === 3).presets
  assert.ok(threes.some((preset) => preset.name === "Director 3"))
  const defaults = decodeAutoLayout(defaultAutoLayout())
  assert.equal(
    defaults.some((preset) =>
      DESKTOP_PRESETS.some(
        (named) => named.id === preset.id && named.name.startsWith("Director")
      )
    ),
    false
  )
})

const directorContext = (chats = 0) => {
  const autoPresets = directorAutoPresets(chats)
  return {
    autoPresets,
    knownPresets: [...autoPresets, ...DESKTOP_PRESETS],
  }
}

const directorCells = (videos) => {
  let cells = instantiateSlots(directorAutoPresets(0)[videos - 1].slots)
  for (let i = 0; i < videos; i++) {
    cells = fillFirstEmptyCell(cells, youtubeStub(String(i).padEnd(11, "x")))
  }
  return cells
}

test("in director mode, adding a video keeps the big screen and its player", () => {
  const cells = directorCells(3)
  const center = findCenterCell(cells)
  const outcome = addVideo(
    cells,
    youtubeStub("new".padEnd(11, "x")),
    directorContext()
  )
  assert.equal(outcome.kind, "placed")
  assert.equal(videoCells(outcome.cells).length, 4)
  const after = findCenterCell(outcome.cells)
  assert.equal(after.id, center.id)
  assert.deepEqual(after.rect, { x: 0, y: 0, w: 24, h: 18 })
  assert.ok(matchesPreset(outcome.cells, directorAutoPresets(0)))
})

test("in director mode, removing a video closes the gap in the row", () => {
  const cells = directorCells(4)
  const center = findCenterCell(cells)
  const gone = screenPositions(cells, center)[1].id
  const next = removeCellAuto(cells, gone, directorContext())
  assert.equal(videoCells(next).length, 3)
  assert.equal(findCenterCell(next).id, center.id)
  assertFillsTheGrid(
    next.map((cell) => cell.rect),
    "after removing"
  )
})

test("removing all but one leaves it filling the screen", () => {
  const cells = directorCells(2)
  const center = findCenterCell(cells)
  const next = removeCellAuto(
    cells,
    screenPositions(cells, center)[0].id,
    directorContext()
  )
  assert.deepEqual(
    next.map((cell) => cell.rect),
    [{ x: 0, y: 0, w: 24, h: 24 }]
  )
})
