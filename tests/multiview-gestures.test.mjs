import assert from "node:assert/strict"
import test from "node:test"
import {
  planDraw,
  planMove,
  planKeyResize,
  planNudge,
  planResize,
  resizeChanges,
  toGridPoint,
} from "../src/lib/multiview/gestures.ts"
import { invertedTransform, REST } from "../src/lib/multiview/flip.ts"
import {
  cellAt,
  clampRect,
  findFreeRect,
  GRID_SIZE,
  MIN_CELL_SIZE,
  nearestFreeRect,
  rectsCollide,
} from "../src/lib/multiview/grid.ts"

const cell = (id, x, y, w, h) => ({
  id,
  rect: { x, y, w, h },
  content: null,
})

const twoColumns = () => [cell("a", 0, 0, 12, 24), cell("b", 12, 0, 12, 24)]
const withFreeSpace = () => [cell("a", 0, 0, 6, 6), cell("b", 12, 0, 6, 6)]

test("dragging over another cell becomes a swap", () => {
  const cells = twoColumns()
  const plan = planMove(
    cells,
    "a",
    cells[0].rect,
    { x: 2, y: 2 },
    { x: 18, y: 10 }
  )
  assert.equal(plan.swapWith, "b")
  assert.deepEqual(plan.rect, cells[1].rect)
})

test("dragging over free space snaps to the grid and keeps the size", () => {
  const cells = withFreeSpace()
  const plan = planMove(
    cells,
    "a",
    cells[0].rect,
    { x: 1, y: 1 },
    { x: 3.4, y: 10.6 }
  )
  assert.equal(plan.swapWith, null)
  assert.deepEqual(plan.rect, { x: 2, y: 10, w: 6, h: 6 })
})

test("a dragged cell settles beside a neighbour rather than overlapping it", () => {
  const cells = withFreeSpace()
  // The pointer is in free space but the cell would overlap `b` at its edge.
  const plan = planMove(
    cells,
    "a",
    cells[0].rect,
    { x: 5, y: 1 },
    { x: 11, y: 1 }
  )
  assert.equal(plan.swapWith, null)
  assert.ok(!rectsCollide(plan.rect, cells[1].rect))
})

test("a drag past the edge of the grid stays on the grid", () => {
  const cells = [cell("a", 0, 0, 6, 6)]
  const plan = planMove(
    cells,
    "a",
    cells[0].rect,
    { x: 1, y: 1 },
    { x: 24, y: 24 }
  )
  assert.deepEqual(plan.rect, { x: 18, y: 18, w: 6, h: 6 })
})

test("a dragged cell stays put when there is nowhere it would fit", () => {
  const cells = [
    cell("a", 0, 0, 20, 20),
    cell("b", 20, 0, 4, 24),
    cell("c", 0, 20, 20, 4),
  ]
  const plan = planMove(
    cells,
    "a",
    cells[0].rect,
    { x: 1, y: 1 },
    { x: 5, y: 5 }
  )
  assert.deepEqual(plan.rect, cells[0].rect)
})

test("resizing follows the pointer along the dragged edge only", () => {
  const cells = [cell("a", 4, 4, 6, 6)]
  assert.deepEqual(
    planResize(cells, "a", cells[0].rect, "e", { x: 14, y: 99 }).rect,
    { x: 4, y: 4, w: 10, h: 6 }
  )
  assert.deepEqual(
    planResize(cells, "a", cells[0].rect, "n", { x: 99, y: 1 }).rect,
    { x: 4, y: 1, w: 6, h: 9 }
  )
  assert.deepEqual(
    planResize(cells, "a", cells[0].rect, "sw", { x: 2, y: 13 }).rect,
    { x: 2, y: 4, w: 8, h: 9 }
  )
})

test("resizing keeps the opposite edge fixed when shrinking", () => {
  const cells = [cell("a", 4, 4, 8, 8)]
  assert.deepEqual(
    planResize(cells, "a", cells[0].rect, "w", { x: 9, y: 0 }).rect,
    { x: 9, y: 4, w: 3, h: 8 }
  )
  assert.deepEqual(
    planResize(cells, "a", cells[0].rect, "n", { x: 0, y: 9 }).rect,
    { x: 4, y: 9, w: 8, h: 3 }
  )
})

test("resizing stops at the minimum size", () => {
  const cells = [cell("a", 4, 4, 8, 8)]
  const { rect } = planResize(cells, "a", cells[0].rect, "se", { x: 0, y: 0 })
  assert.equal(rect.w, MIN_CELL_SIZE)
  assert.equal(rect.h, MIN_CELL_SIZE)
  assert.equal(rect.x, 4, "the anchored corner does not move")
})

test("resizing stops at a cell it was not touching, and at the grid's edge", () => {
  const cells = withFreeSpace()
  const plan = planResize(cells, "a", cells[0].rect, "e", { x: 20, y: 3 })
  assert.equal(plan.rect.w, 12, "stops touching b")
  assert.equal(plan.pushed.size, 0, "and leaves it alone")
  const free = [cell("a", 0, 0, 6, 6)]
  assert.equal(
    planResize(free, "a", free[0].rect, "e", { x: 40, y: 3 }).rect.w,
    GRID_SIZE
  )
})

test("in a tiled layout, growing pushes the neighbour back", () => {
  const cells = twoColumns()
  const plan = planResize(cells, "a", cells[0].rect, "e", { x: 18, y: 5 })
  assert.deepEqual(plan.rect, { x: 0, y: 0, w: 18, h: 24 })
  assert.deepEqual(plan.pushed.get("b"), { x: 18, y: 0, w: 6, h: 24 })
})

test("either side of a shared edge can grow into the other", () => {
  const cells = twoColumns()
  const plan = planResize(cells, "b", cells[1].rect, "w", { x: 6, y: 5 })
  assert.deepEqual(plan.rect, { x: 6, y: 0, w: 18, h: 24 })
  assert.deepEqual(plan.pushed.get("a"), { x: 0, y: 0, w: 6, h: 24 })
})

test("pushing works vertically too", () => {
  const cells = [cell("top", 0, 0, 24, 12), cell("bottom", 0, 12, 24, 12)]
  const down = planResize(cells, "top", cells[0].rect, "s", { x: 5, y: 18 })
  assert.equal(down.rect.h, 18)
  assert.deepEqual(down.pushed.get("bottom"), { x: 0, y: 18, w: 24, h: 6 })
  const up = planResize(cells, "bottom", cells[1].rect, "n", { x: 5, y: 6 })
  assert.deepEqual(up.rect, { x: 0, y: 6, w: 24, h: 18 })
  assert.deepEqual(up.pushed.get("top"), { x: 0, y: 0, w: 24, h: 6 })
})

test("a neighbour gives way only down to its minimum size", () => {
  const cells = twoColumns()
  const plan = planResize(cells, "a", cells[0].rect, "e", { x: 24, y: 5 })
  assert.equal(plan.rect.w, GRID_SIZE - MIN_CELL_SIZE)
  assert.equal(plan.pushed.get("b").w, MIN_CELL_SIZE)
})

test("shrinking leaves free space behind rather than pulling neighbours along", () => {
  const cells = twoColumns()
  const plan = planResize(cells, "a", cells[0].rect, "e", { x: 8, y: 5 })
  assert.equal(plan.rect.w, 8)
  assert.equal(plan.pushed.size, 0)
})

test("pushing never makes cells overlap, whichever corner is dragged", () => {
  const grid = [
    cell("nw", 0, 0, 12, 12),
    cell("ne", 12, 0, 12, 12),
    cell("sw", 0, 12, 12, 12),
    cell("se", 12, 12, 12, 12),
  ]
  const plan = planResize(grid, "nw", grid[0].rect, "se", { x: 16, y: 16 })
  const after = grid.map((c) =>
    c.id === "nw"
      ? { ...c, rect: plan.rect }
      : { ...c, rect: plan.pushed.get(c.id) ?? c.rect }
  )
  assert.deepEqual(plan.rect, { x: 0, y: 0, w: 16, h: 16 })
  for (const first of after) {
    for (const second of after) {
      if (first.id !== second.id) {
        assert.ok(
          !rectsCollide(first.rect, second.rect),
          `${first.id} overlaps ${second.id}`
        )
      }
    }
  }
})

test("a neighbour that is only partly alongside the edge still gives way", () => {
  const cells = [cell("a", 0, 0, 12, 12), cell("b", 12, 6, 12, 18)]
  const plan = planResize(cells, "a", cells[0].rect, "e", { x: 16, y: 5 })
  assert.equal(plan.rect.w, 16)
  assert.deepEqual(plan.pushed.get("b"), { x: 16, y: 6, w: 8, h: 18 })
})

test("a resize becomes a set of changes for the store", () => {
  const cells = twoColumns()
  const plan = planResize(cells, "a", cells[0].rect, "e", { x: 18, y: 5 })
  const changes = resizeChanges("a", plan)
  assert.equal(changes.size, 2)
  assert.equal(changes.get("a").w, 18)
  assert.equal(changes.get("b").w, 6)
})

test("a cell already overlapping another can still be resized", () => {
  const cells = [cell("a", 0, 0, 12, 12), cell("b", 6, 6, 12, 12)]
  const { rect } = planResize(cells, "a", cells[0].rect, "w", { x: 4, y: 0 })
  assert.equal(rect.x, 4)
})

test("drawing creates a cell between the anchor and the pointer", () => {
  assert.deepEqual(planDraw([], { x: 2.5, y: 3.5 }, { x: 8.2, y: 9.1 }), {
    x: 2,
    y: 3,
    w: 7,
    h: 7,
  })
})

test("drawing works toward every corner", () => {
  assert.deepEqual(planDraw([], { x: 10.5, y: 10.5 }, { x: 4.2, y: 5.2 }), {
    x: 4,
    y: 5,
    w: 7,
    h: 6,
  })
})

test("drawing stops at existing cells", () => {
  const cells = [cell("a", 10, 0, 4, 24)]
  const rect = planDraw(cells, { x: 2.5, y: 2.5 }, { x: 20, y: 8 })
  assert.equal(rect.x + rect.w, 10)
})

test("drawing needs a usable size and a free starting point", () => {
  assert.equal(planDraw([], { x: 2.5, y: 2.5 }, { x: 2.8, y: 2.8 }), null)
  const cells = [cell("a", 0, 0, 6, 6)]
  assert.equal(planDraw(cells, { x: 2.5, y: 2.5 }, { x: 12, y: 12 }), null)
})

test("keyboard nudges move by one, refusing what cannot fit", () => {
  const cells = [cell("a", 2, 2, 4, 4), cell("b", 6, 2, 4, 4)]
  assert.deepEqual(planNudge(cells, "a", cells[0].rect, { x: 0, y: 1 }), {
    x: 2,
    y: 3,
    w: 4,
    h: 4,
  })
  assert.deepEqual(
    planNudge(cells, "a", cells[0].rect, { x: 1, y: 0 }),
    cells[0].rect,
    "b is in the way"
  )
  const corner = [cell("a", 0, 0, 2, 2)]
  assert.deepEqual(
    planNudge(corner, "a", corner[0].rect, { x: -1, y: 0 }),
    corner[0].rect,
    "edge of the grid"
  )
})

test("keyboard resizing grows, shrinks, and pushes like the handles do", () => {
  const cells = [cell("a", 2, 2, 4, 4), cell("b", 6, 2, 4, 4)]
  const down = planKeyResize(cells, "a", cells[0].rect, { x: 0, y: 1 })
  assert.deepEqual(down.rect, { x: 2, y: 2, w: 4, h: 5 })
  const narrower = planKeyResize(cells, "a", cells[0].rect, { x: -1, y: 0 })
  assert.equal(narrower.rect.w, 3)
  const wider = planKeyResize(cells, "a", cells[0].rect, { x: 1, y: 0 })
  assert.equal(wider.rect.w, 5)
  assert.deepEqual(wider.pushed.get("b"), { x: 7, y: 2, w: 3, h: 4 })
  const small = [cell("a", 0, 0, 2, 2)]
  assert.equal(
    planKeyResize(small, "a", small[0].rect, { x: -1, y: 0 }).rect.w,
    MIN_CELL_SIZE,
    "minimum size"
  )
})

test("pointer positions convert to grid units and clamp to the stage", () => {
  assert.deepEqual(toGridPoint(500, 250, 1000, 500), { x: 12, y: 12 })
  assert.deepEqual(toGridPoint(-50, 9999, 1000, 500), { x: 0, y: 24 })
})

test("hit testing finds the topmost cell and can ignore one", () => {
  const cells = [cell("a", 0, 0, 12, 12), cell("b", 6, 6, 12, 12)]
  assert.equal(cellAt(cells, { x: 8, y: 8 }).id, "b")
  assert.equal(cellAt(cells, { x: 8, y: 8 }, "b").id, "a")
  assert.equal(cellAt(cells, { x: 20, y: 20 }), undefined)
})

test("new cells find room, shrinking on a crowded grid", () => {
  assert.deepEqual(findFreeRect([]), { x: 0, y: 0, w: 4, h: 6 })
  const crowded = [cell("a", 0, 0, 24, 20)]
  assert.deepEqual(findFreeRect(crowded), { x: 0, y: 20, w: 3, h: 4 })
  const nearlyFull = [cell("a", 0, 0, 24, 22)]
  assert.deepEqual(findFreeRect(nearlyFull), { x: 0, y: 22, w: 2, h: 2 })
  assert.equal(findFreeRect([cell("a", 0, 0, 24, 24)]), null)
})

test("the nearest free position is the closest one that fits", () => {
  const cells = [cell("self", 0, 0, 4, 4), cell("wall", 4, 0, 4, 24)]
  const rect = nearestFreeRect(cells, { x: 5, y: 0, w: 4, h: 4 }, "self")
  assert.deepEqual(rect, { x: 8, y: 0, w: 4, h: 4 })
})

test("rects are cleaned up from whatever a stored layout contained", () => {
  assert.deepEqual(clampRect({ x: 30, y: -2, w: 4.4, h: 0 }), {
    x: 20,
    y: 0,
    w: 4,
    h: 1,
  })
  assert.deepEqual(clampRect({ x: NaN, y: NaN, w: 99, h: NaN }), {
    x: 0,
    y: 0,
    w: 24,
    h: 1,
  })
})

const stage = { width: 2400, height: 1200 }

test("a move inverts to exactly where the cell just was", () => {
  const from = { x: 0, y: 0, w: 12, h: 12 }
  const to = { x: 12, y: 12, w: 12, h: 12 }
  assert.deepEqual(invertedTransform(from, to, REST, stage), {
    x: -1200,
    y: -600,
    scaleX: 1,
    scaleY: 1,
  })
})

test("a resize inverts to the old size, by scale alone", () => {
  const from = { x: 0, y: 0, w: 6, h: 6 }
  const to = { x: 0, y: 0, w: 12, h: 24 }
  assert.deepEqual(invertedTransform(from, to, REST, stage), {
    x: 0,
    y: 0,
    scaleX: 0.5,
    scaleY: 0.25,
  })
})

test("a new move picks up from wherever a running animation has reached", () => {
  // Halfway through travelling from column 0 to column 12.
  const from = { x: 12, y: 0, w: 12, h: 12 }
  const midway = { x: -600, y: 0, scaleX: 1, scaleY: 1 }
  const to = { x: 0, y: 0, w: 12, h: 12 }
  // Appears at column 6, so relative to its new home that is +600px.
  assert.deepEqual(invertedTransform(from, to, midway, stage), {
    x: 600,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  })
})

test("dropping a dragged cell continues from the pointer, not its old slot", () => {
  const from = { x: 0, y: 0, w: 12, h: 12 }
  const dragged = { x: 1300, y: 50, scaleX: 1, scaleY: 1 }
  const to = { x: 12, y: 0, w: 12, h: 12 }
  assert.deepEqual(invertedTransform(from, to, dragged, stage), {
    x: 100,
    y: 50,
    scaleX: 1,
    scaleY: 1,
  })
})

test("a cell at rest stays at rest", () => {
  const rect = { x: 3, y: 4, w: 5, h: 6 }
  assert.deepEqual(invertedTransform(rect, rect, REST, stage), REST)
})
