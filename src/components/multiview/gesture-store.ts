import { create } from "zustand"

import type { CellId, GridPoint, Rect } from "@/lib/multiview/types"

/** The gesture in progress on the edit layer, as far as rendering cares. */
export type ActiveGesture =
  | {
      kind: "move"
      cellId: CellId
      origin: Rect
      /** Where the cell would land if released now. */
      target: Rect
      swapWith: CellId | null
    }
  | {
      kind: "resize"
      cellId: CellId
      rect: Rect
      /** Neighbours giving way, drawn at the size they would shrink to. */
      pushed: ReadonlyMap<CellId, Rect>
    }
  | { kind: "draw"; rect: Rect | null }
  | { kind: "bind"; cellId: CellId; pointer: GridPoint; over: CellId | null }

interface GestureStore {
  active: ActiveGesture | null
  setActive: (active: ActiveGesture | null) => void
}

export const useEditGesture = create<GestureStore>()((set) => ({
  active: null,
  setActive: (active) => set({ active }),
}))

/**
 * The rect a cell should be drawn at mid-gesture, if not its own: the one being
 * resized, one it is pushing back, or one making way for a cell about to swap
 * with it. A dragged cell has no entry here, because it follows the pointer
 * through its transform.
 */
function draftRect(active: ActiveGesture | null, id: CellId): Rect | null {
  if (active?.kind === "resize") {
    return active.cellId === id ? active.rect : (active.pushed.get(id) ?? null)
  }
  if (active?.kind === "move" && active.swapWith === id) return active.origin
  return null
}

export function useEffectiveRect(id: CellId, rect: Rect): Rect {
  return useEditGesture((state) => draftRect(state.active, id)) ?? rect
}
