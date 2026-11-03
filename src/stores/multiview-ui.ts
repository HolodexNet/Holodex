import { create } from "zustand"

import type { Point } from "@/lib/multiview/control"
import type {
  CellId,
  ControlPanels,
  DecodedLayout,
  MultiviewVideo,
} from "@/lib/multiview/types"

/** What choosing a video in the picker will do. */
export type PickerPurpose =
  /** Find it a place with auto-layout. */
  | { kind: "auto" }
  /** Show it in this cell. */
  | { kind: "cell"; cellId: CellId }
  /** Make this chat cell serve it, on the grid or not. */
  | { kind: "chat"; cellId: CellId }

export interface LayoutPrompt {
  layout: DecodedLayout
  /** Whether "fill empty cells with current videos" starts checked. */
  defaultMerge: boolean
  /** A video to place once the new layout is in, when one prompted this. */
  pendingVideo?: MultiviewVideo
  /** Called when the viewer declines. */
  onCancel?: () => void
}

/** Audio Focus just moved the sound, whatever moved it. */
export interface AudioHandoff {
  /** Tells one handoff from the next, including back to the same stream. */
  id: number
  to: CellId
  from: CellId | null
}

/** Brief feedback for something the keyboard did, which has no button to show it. */
export interface CellNotice {
  id: number
  /** The stream it concerns, or `null` for the whole view. */
  cellId: CellId | null
  icon: "sound" | "muted" | "screen"
  text: string
}

interface MultiviewUiStore {
  toolbarCollapsed: boolean
  syncBarOpen: boolean
  mediaControlsOpen: boolean
  controlWindowPanels: ControlPanels
  /** Where it was dragged to; until then it keeps to its corner. */
  controlWindowAt: Point | null
  presetDialogOpen: boolean
  saveDialogOpen: boolean
  helpOpen: boolean
  picker: PickerPurpose | null
  prompt: LayoutPrompt | null
  /** Video cell to outline, while pointing at a chat that serves it. */
  highlightedCell: CellId | null
  audioHandoff: AudioHandoff | null
  notice: CellNotice | null
  /** Bumped per cell to remount its player. */
  reloads: Record<CellId, number>

  set: (patch: Partial<MultiviewUiState>) => void
  reload: (ids: CellId[]) => void
  showNotice: (notice: Omit<CellNotice, "id">) => void
}

type MultiviewUiState = Omit<
  MultiviewUiStore,
  "set" | "reload" | "reloads" | "showNotice"
>

let notices = 0

/** Which panels are open right now; nothing here survives leaving the page. */
export const useMultiviewUi = create<MultiviewUiStore>()((set) => ({
  toolbarCollapsed: false,
  syncBarOpen: false,
  mediaControlsOpen: false,
  controlWindowPanels: { media: true, sync: false },
  controlWindowAt: null,
  presetDialogOpen: false,
  saveDialogOpen: false,
  helpOpen: false,
  picker: null,
  prompt: null,
  highlightedCell: null,
  audioHandoff: null,
  notice: null,
  reloads: {},

  set: (patch) => set(patch),
  reload: (ids) =>
    set((state) => {
      const reloads = { ...state.reloads }
      for (const id of ids) reloads[id] = (reloads[id] ?? 0) + 1
      return { reloads }
    }),
  showNotice: (notice) => set({ notice: { ...notice, id: ++notices } }),
}))
