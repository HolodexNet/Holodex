import { create } from "zustand"

import type {
  CellId,
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

interface MultiviewUiStore {
  toolbarCollapsed: boolean
  syncBarOpen: boolean
  mediaControlsOpen: boolean
  presetDialogOpen: boolean
  saveDialogOpen: boolean
  picker: PickerPurpose | null
  prompt: LayoutPrompt | null
  /** Video cell to outline, while pointing at a chat that serves it. */
  highlightedCell: CellId | null
  /** Bumped per cell to remount its player. */
  reloads: Record<CellId, number>

  set: (patch: Partial<MultiviewUiState>) => void
  reload: (ids: CellId[]) => void
}

type MultiviewUiState = Omit<MultiviewUiStore, "set" | "reload" | "reloads">

/** Which panels are open right now; nothing here survives leaving the page. */
export const useMultiviewUi = create<MultiviewUiStore>()((set) => ({
  toolbarCollapsed: false,
  syncBarOpen: false,
  mediaControlsOpen: false,
  presetDialogOpen: false,
  saveDialogOpen: false,
  picker: null,
  prompt: null,
  highlightedCell: null,
  reloads: {},

  set: (patch) => set(patch),
  reload: (ids) =>
    set((state) => {
      const reloads = { ...state.reloads }
      for (const id of ids) reloads[id] = (reloads[id] ?? 0) + 1
      return { reloads }
    }),
}))
