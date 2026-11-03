import { GRID_SIZE } from "./grid.ts"
import type { Rect } from "./types.ts"

/**
 * Animating a cell changes only a transform, never its layout. The element goes
 * straight to its destination (so a player's iframe is resized at most once, not
 * on every frame) and a transform that makes it appear where it just was is
 * eased back to nothing. This is cheap enough to do to many videos at once, and
 * a compositor-only change cannot disturb playback.
 */

export interface CellTransform {
  x: number
  y: number
  scaleX: number
  scaleY: number
}

export interface StageSize {
  width: number
  height: number
}

export const REST: CellTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1 }

/**
 * The transform that draws a cell, already laid out at `to`, exactly where it
 * currently appears. `current` is its live transform relative to `from`, so a
 * move can begin mid-animation or mid-drag without any visible jump.
 */
export function invertedTransform(
  from: Rect,
  to: Rect,
  current: CellTransform,
  stage: StageSize
): CellTransform {
  const unitW = stage.width / GRID_SIZE
  const unitH = stage.height / GRID_SIZE
  return {
    x: from.x * unitW + current.x - to.x * unitW,
    y: from.y * unitH + current.y - to.y * unitH,
    scaleX: (from.w * current.scaleX) / to.w,
    scaleY: (from.h * current.scaleY) / to.h,
  }
}
