import { create } from "zustand"
import { persist } from "zustand/middleware"

import { cellsFromLegacy } from "@/lib/multiview/legacy"
import {
  addCellAt,
  applyLayout,
  mergeVideoData,
  muteAllButFirst,
  muteAllExcept,
  removeCell,
  restoreLayout,
  setAllMuted,
  setCellContent,
  setMuted,
  setRects,
  swapCells,
} from "@/lib/multiview/layout"
import type { VideoDetails } from "@/lib/multiview/stream"
import type {
  Cell,
  CellContent,
  CellId,
  ChatPanels,
  ChatTarget,
  DecodedLayout,
  Rect,
} from "@/lib/multiview/types"
import { readLegacyState } from "./legacy"

/** Undo steps kept for one editing session. */
const HISTORY_LIMIT = 50
const URL_HISTORY_LIMIT = 8

export type UrlHistoryKind = "youtube" | "twitch"

interface Persisted {
  cells: Cell[]
  /** Unmuting one video mutes the rest. */
  muteOthers: boolean
  /** Video id -> seconds, for archive sync. */
  syncOffsets: Record<string, number>
  urlHistory: Record<UrlHistoryKind, string[]>
}

interface MultiviewStore extends Persisted {
  /** The whole view is in layout editing mode. */
  editing: boolean
  /** Layouts to go back to, oldest first, within this editing session. */
  past: Cell[][]
  future: Cell[][]

  /** A layout change that editing mode can undo. */
  replaceCells: (cells: Cell[]) => void
  applyLayout: (layout: DecodedLayout, options?: { merge?: boolean }) => void
  clearAll: () => void
  addCellAt: (rect: Rect) => void
  removeCell: (id: CellId) => void
  setContent: (id: CellId, content: CellContent | null) => void
  setChatTarget: (id: CellId, target: ChatTarget) => void
  setChatPanels: (id: CellId, panels: ChatPanels) => void
  setRects: (rects: ReadonlyMap<CellId, Rect>) => void
  swap: (a: CellId, b: CellId) => void

  enterEditing: () => void
  exitEditing: () => void
  undo: () => void
  redo: () => void
  /** Back to how the layout was on entering editing mode. */
  discardEdits: () => void

  setMuted: (id: CellId, muted: boolean) => void
  setAllMuted: (muted: boolean) => void
  muteAllExcept: (id: CellId) => void
  setMuteOthers: (enabled: boolean) => void
  /** Keeps metadata fresh; deliberately not an undoable edit. */
  mergeVideoData: (
    fresh: ReadonlyMap<string, VideoDetails>,
    failed?: ReadonlySet<string>
  ) => void
  setSyncOffset: (videoId: string, seconds: number) => void
  addUrlHistory: (kind: UrlHistoryKind, url: string) => void
}

/** iOS can only play one unmuted video at a time anyway. */
function isAppleMobile(): boolean {
  return (
    ["iPad", "iPhone", "iPod"].some((name) =>
      navigator.platform?.startsWith(name)
    ) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  )
}

function initial(): Persisted {
  const legacy = readLegacyState()?.multiview
  return {
    cells: legacy ? cellsFromLegacy(legacy) : [],
    muteOthers: legacy?.muteOthers ?? isAppleMobile(),
    syncOffsets: legacy?.syncOffsets ?? {},
    urlHistory: {
      youtube: legacy?.ytUrlHistory ?? [],
      twitch: legacy?.twUrlHistory ?? [],
    },
  }
}

export const useMultiview = create<MultiviewStore>()(
  persist(
    (set, get) => {
      /** Applies a layout change, recording it if an edit session is open. */
      const edit = (change: (cells: Cell[]) => Cell[]) =>
        set((state) => {
          const cells = change(state.cells)
          if (cells === state.cells) return state
          return state.editing
            ? {
                cells,
                past: [...state.past, state.cells].slice(-HISTORY_LIMIT),
                future: [],
              }
            : { cells }
        })

      const setChat = (
        id: CellId,
        update: (content: Extract<CellContent, { type: "chat" }>) => CellContent
      ) =>
        edit((cells) => {
          const content = cells.find((cell) => cell.id === id)?.content
          return content?.type === "chat"
            ? setCellContent(cells, id, update(content))
            : cells
        })

      return {
        ...initial(),
        editing: false,
        past: [],
        future: [],

        replaceCells: (cells) => edit(() => cells),
        applyLayout: (layout, options) =>
          edit((cells) => applyLayout(cells, layout, options)),
        clearAll: () => edit(() => []),
        addCellAt: (rect) => edit((cells) => addCellAt(cells, rect)),
        removeCell: (id) => edit((cells) => removeCell(cells, id)),
        setContent: (id, content) =>
          edit((cells) => setCellContent(cells, id, content)),
        setChatTarget: (id, target) =>
          setChat(id, (content) => ({ ...content, target })),
        setChatPanels: (id, panels) =>
          setChat(id, (content) => ({ ...content, panels })),
        setRects: (rects) => edit((cells) => setRects(cells, rects)),
        swap: (a, b) => edit((cells) => swapCells(cells, a, b)),

        enterEditing: () => set({ editing: true, past: [], future: [] }),
        exitEditing: () => set({ editing: false, past: [], future: [] }),
        undo: () =>
          set((state) => {
            const previous = state.past.at(-1)
            if (!previous) return state
            return {
              cells: restoreLayout(previous, state.cells),
              past: state.past.slice(0, -1),
              future: [state.cells, ...state.future],
            }
          }),
        redo: () =>
          set((state) => {
            const [next, ...future] = state.future
            if (!next) return state
            return {
              cells: restoreLayout(next, state.cells),
              past: [...state.past, state.cells],
              future,
            }
          }),
        discardEdits: () =>
          set((state) => {
            const first = state.past[0]
            return first
              ? {
                  cells: restoreLayout(first, state.cells),
                  past: [],
                  future: [],
                }
              : state
          }),

        setMuted: (id, muted) =>
          set((state) => ({ cells: setMuted(state.cells, id, muted) })),
        setAllMuted: (muted) =>
          set((state) => ({ cells: setAllMuted(state.cells, muted) })),
        muteAllExcept: (id) =>
          set((state) => ({ cells: muteAllExcept(state.cells, id) })),
        setMuteOthers: (enabled) =>
          set((state) => ({
            muteOthers: enabled,
            cells: enabled ? muteAllButFirst(state.cells) : state.cells,
          })),
        mergeVideoData: (fresh, failed) =>
          set((state) => ({
            cells: mergeVideoData(state.cells, fresh, failed),
          })),
        setSyncOffset: (videoId, seconds) =>
          set((state) => ({
            syncOffsets: { ...state.syncOffsets, [videoId]: seconds },
          })),
        addUrlHistory: (kind, url) => {
          const history = get().urlHistory[kind]
          if (history.includes(url)) return
          set((state) => ({
            urlHistory: {
              ...state.urlHistory,
              [kind]: [...history, url].slice(-URL_HISTORY_LIMIT),
            },
          }))
        },
      }
    },
    {
      name: "holodex-v3/multiview",
      version: 1,
      // Editing state and undo history never outlive the page.
      partialize: ({ cells, muteOthers, syncOffsets, urlHistory }) => ({
        cells,
        muteOthers,
        syncOffsets,
        urlHistory,
      }),
    }
  )
)
