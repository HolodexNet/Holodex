import { useLayoutEffect, useRef } from "react"
import { animate, motionValue, type MotionValue } from "motion/react"

import {
  invertedTransform,
  REST,
  type CellTransform,
  type StageSize,
} from "@/lib/multiview/flip"
import { rectsEqual } from "@/lib/multiview/grid"
import type { CellId, Rect } from "@/lib/multiview/types"
import { useStageSizeRef } from "./stage-size"

/** Quick to arrive with no overshoot, which would read as the video wobbling. */
const SETTLE = {
  type: "spring",
  stiffness: 520,
  damping: 44,
  mass: 0.9,
} as const

export interface CellMotion {
  x: MotionValue<number>
  y: MotionValue<number>
  scaleX: MotionValue<number>
  scaleY: MotionValue<number>
}

/**
 * One set of values per cell, shared by its frame and its edit-mode chrome. This
 * is what keeps them locked together, and lets a drag move the frame directly on
 * every pointer event without React rendering anything.
 */
const registry = new Map<CellId, CellMotion>()

export function cellMotion(id: CellId): CellMotion {
  let values = registry.get(id)
  if (!values) {
    values = {
      x: motionValue(REST.x),
      y: motionValue(REST.y),
      scaleX: motionValue(REST.scaleX),
      scaleY: motionValue(REST.scaleY),
    }
    registry.set(id, values)
  }
  return values
}

/**
 * Forgets cells that no longer exist. Goes by the cell list rather than by any
 * component unmounting: strict mode's rehearsal of an unmount would otherwise
 * replace the values behind a frame that is still bound to the old ones.
 */
export function pruneCellMotion(live: ReadonlySet<CellId>) {
  for (const id of registry.keys()) {
    if (!live.has(id)) registry.delete(id)
  }
}

const currentTransform = (values: CellMotion): CellTransform => ({
  x: values.x.get(),
  y: values.y.get(),
  scaleX: values.scaleX.get(),
  scaleY: values.scaleY.get(),
})

/** Eases a cell back to its laid-out position from wherever it appears now. */
export function settleCell(values: CellMotion, reducedMotion: boolean) {
  if (reducedMotion) {
    values.x.jump(REST.x)
    values.y.jump(REST.y)
    values.scaleX.jump(REST.scaleX)
    values.scaleY.jump(REST.scaleY)
    return
  }
  animate(values.x, REST.x, SETTLE)
  animate(values.y, REST.y, SETTLE)
  animate(values.scaleX, REST.scaleX, SETTLE)
  animate(values.scaleY, REST.scaleY, SETTLE)
}

/**
 * Keeps a cell's transform consistent when its laid-out rect changes: it first
 * jumps to appear exactly where it was, then settles into the new position. Runs
 * before paint, so the jump itself is never seen.
 */
export function useCellFlip(
  id: CellId,
  rect: Rect,
  reducedMotion: boolean
): CellMotion {
  const stage = useStageSizeRef()
  const values = cellMotion(id)
  const previous = useRef(rect)

  useLayoutEffect(() => {
    const from = previous.current
    previous.current = rect
    if (rectsEqual(from, rect)) return
    flipCell(values, from, rect, stage.current, reducedMotion)
  })

  return values
}

function flipCell(
  values: CellMotion,
  from: Rect,
  to: Rect,
  stage: StageSize,
  reducedMotion: boolean
) {
  if (!stage.width || !stage.height) return
  const inverted = invertedTransform(from, to, currentTransform(values), stage)
  values.x.jump(inverted.x)
  values.y.jump(inverted.y)
  values.scaleX.jump(inverted.scaleX)
  values.scaleY.jump(inverted.scaleY)
  settleCell(values, reducedMotion)
}
