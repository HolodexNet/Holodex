import { useCallback, useMemo } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { getT } from "@/lib/i18n"
import { isControlCell, isVideoCell } from "@/lib/multiview/cells"
import { DEFAULT_PANELS, TL_PANELS } from "@/lib/multiview/chat"
import { ALL_CONTROL_PANELS } from "@/lib/multiview/control"
import { cellAt } from "@/lib/multiview/grid"
import {
  addCell as planAddCell,
  addVideo as planAddVideo,
  dockControls as planDockControls,
  fillFirstEmptyCell,
  removeCellAuto,
  type AutoLayoutContext,
} from "@/lib/multiview/layout"
import {
  decodeAutoLayout,
  DESKTOP_PRESETS,
  MOBILE_PRESETS,
} from "@/lib/multiview/presets"
import type {
  CellId,
  ControlPanels,
  DecodedLayout,
  GridPoint,
  MultiviewVideo,
} from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewPresets } from "@/stores/multiview-presets"
import {
  useMultiviewUi,
  type LayoutPrompt,
  type PickerPurpose,
} from "@/stores/multiview-ui"

export function useAutoLayoutContext(): AutoLayoutContext {
  const isMobile = useIsMobile()
  const auto = useMultiviewPresets((s) => s.auto)
  return useMemo(() => {
    if (isMobile) {
      return { autoPresets: MOBILE_PRESETS, knownPresets: MOBILE_PRESETS }
    }
    const autoPresets = decodeAutoLayout(auto)
    return {
      autoPresets,
      knownPresets: [...autoPresets, ...DESKTOP_PRESETS],
    }
  }, [isMobile, auto])
}

const multiview = () => useMultiview.getState()
const ui = () => useMultiviewUi.getState()

/**
 * Asks before replacing a layout that holds anything, then applies it. Permalinks
 * and auto-layout share this so that neither can silently discard someone's work.
 */
export function requestLayout(
  layout: DecodedLayout,
  options: Omit<LayoutPrompt, "layout" | "defaultMerge"> & {
    defaultMerge?: boolean
  } = {}
) {
  if (ui().prompt) return
  if (!multiview().cells.length) {
    multiview().applyLayout(layout)
    if (options.pendingVideo) placeInEmptyCell(options.pendingVideo)
    return
  }
  ui().set({
    prompt: { layout, defaultMerge: false, ...options },
  })
}

function placeInEmptyCell(video: MultiviewVideo) {
  const cells = fillFirstEmptyCell(multiview().cells, video)
  if (cells) multiview().replaceCells(cells)
}

export function confirmLayoutPrompt(merge: boolean) {
  const prompt = ui().prompt
  if (!prompt) return
  ui().set({ prompt: null })
  multiview().applyLayout(prompt.layout, { merge })
  if (prompt.pendingVideo) placeInEmptyCell(prompt.pendingVideo)
}

export function cancelLayoutPrompt() {
  const prompt = ui().prompt
  ui().set({ prompt: null })
  prompt?.onCancel?.()
}

/** Shows a video in a specific cell, or points a chat cell at it. */
function assignVideo(cellId: CellId, video: MultiviewVideo) {
  const store = multiview()
  const cell = store.cells.find((c) => c.id === cellId)
  if (cell?.content?.type === "chat") {
    const onGrid = store.cells.find(
      (c) => isVideoCell(c) && c.content.video.id === video.id
    )
    store.setChatTarget(
      cellId,
      onGrid ? { kind: "cell", cellId: onGrid.id } : { kind: "video", video }
    )
  } else {
    store.setContent(cellId, { type: "video", video })
  }
}

/** The actions the UI offers, on top of the pure layout rules. */
export function useMultiviewCommands() {
  const context = useAutoLayoutContext()

  const addVideo = useCallback(
    (video: MultiviewVideo) => {
      const store = multiview()
      const outcome = planAddVideo(store.cells, video, context)
      switch (outcome.kind) {
        case "placed":
          store.replaceCells(outcome.cells)
          break
        case "needs-confirmation":
          requestLayout(outcome.proposal, {
            defaultMerge: true,
            pendingVideo: video,
          })
          break
        case "no-layout":
          toast.error(getT().t("views.multiview.noRoom"))
          break
      }
    },
    [context]
  )

  const addCell = useCallback(() => {
    const store = multiview()
    const cells = planAddCell(store.cells, context)
    if (cells) store.replaceCells(cells)
    else toast.error(getT().t("views.multiview.noRoom"))
  }, [context])

  const removeCell = useCallback(
    (id: CellId) => {
      const store = multiview()
      store.replaceCells(removeCellAuto(store.cells, id, context))
    },
    [context]
  )

  const pick = useCallback(
    (video: MultiviewVideo, purpose: PickerPurpose) => {
      if (purpose.kind === "auto") addVideo(video)
      else assignVideo(purpose.cellId, video)
    },
    [addVideo]
  )

  const dropVideo = useCallback(
    (video: MultiviewVideo, point: GridPoint) => {
      const target = cellAt(multiview().cells, point)
      if (target && !isControlCell(target)) assignVideo(target.id, video)
      else addVideo(video)
    },
    [addVideo]
  )

  /** Whether it found a place; the viewer is told if it did not. */
  const dockControls = useCallback(
    (panels: ControlPanels) => {
      const store = multiview()
      const cells = planDockControls(store.cells, panels, context)
      if (cells) store.replaceCells(cells)
      else toast.error(getT().t("views.multiview.noRoom"))
      return !!cells
    },
    [context]
  )

  return useMemo(
    () => ({ addVideo, addCell, removeCell, pick, dropVideo, dockControls }),
    [addVideo, addCell, removeCell, pick, dropVideo, dockControls]
  )
}

export function makeControlCell(id: CellId) {
  multiview().setContent(id, { type: "control", panels: ALL_CONTROL_PANELS })
}

/** Turns an empty cell into a chat, in either of its starting forms. */
export function makeChatCell(id: CellId, tl: boolean) {
  multiview().setContent(id, {
    type: "chat",
    target: { kind: "auto" },
    panels: tl ? TL_PANELS : DEFAULT_PANELS,
  })
}
