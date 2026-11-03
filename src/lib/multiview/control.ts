import type { ControlPanels } from "./types.ts"

export const ALL_CONTROL_PANELS: ControlPanels = { media: true, sync: true }

/** Flips one panel, turning the other on rather than leaving nothing to show. */
export function toggleControlPanel(
  panels: ControlPanels,
  panel: keyof ControlPanels
): ControlPanels {
  const next = { ...panels, [panel]: !panels[panel] }
  if (next.media || next.sync) return next
  return panel === "media"
    ? { media: false, sync: true }
    : { media: true, sync: false }
}

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

/** Keeps a floating window wholly on screen, top left winning if it cannot fit. */
export function clampWindow(at: Point, size: Size, viewport: Size): Point {
  return {
    x: Math.max(Math.min(at.x, viewport.width - size.width), 0),
    y: Math.max(Math.min(at.y, viewport.height - size.height), 0),
  }
}
