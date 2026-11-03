import { accentHues, resolveChats } from "@/lib/multiview/chat"
import type { Cell, CellId } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"

/** Derives from the cell list at most once per change to it. */
function perCells<T>(derive: (cells: readonly Cell[]) => T) {
  let lastCells: readonly Cell[] | undefined
  let lastValue: T
  return (cells: readonly Cell[]): T => {
    if (cells !== lastCells) {
      lastCells = cells
      lastValue = derive(cells)
    }
    return lastValue
  }
}

const chatsOf = perCells(resolveChats)
const accentsOf = perCells(accentHues)

export const useResolvedChat = (id: CellId) =>
  useMultiview((s) => chatsOf(s.cells).get(id))

export const useResolvedChats = () => useMultiview((s) => chatsOf(s.cells))

export const useAccents = () => useMultiview((s) => accentsOf(s.cells))

export const accentColor = (hue: number | undefined) =>
  hue === undefined ? "var(--muted-foreground)" : `oklch(0.74 0.15 ${hue})`
