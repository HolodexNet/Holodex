import { useSyncExternalStore } from "react"

import {
  audibleCells,
  isVideoCell,
  soleAudibleCell,
} from "@/lib/multiview/cells"
import { PlaybackHub, type PlaybackEvent } from "@/lib/multiview/playback"
import type { Cell, CellId } from "@/lib/multiview/types"
import { INITIAL_PLAYER_STATUS } from "@/lib/player/types"
import { useMultiview } from "./multiview"
import { useMultiviewUi } from "./multiview-ui"

function handleEvent(event: PlaybackEvent) {
  const store = useMultiview.getState()
  if (event.type === "muted-by-player") {
    store.setMuted(event.cellId, event.muted)
    if (!event.muted && store.muteOthers) store.muteAllExcept(event.cellId)
  } else if (store.muteOthers) {
    // Starting a new stream takes the audio focus, except from a director, whose
    // choice a player finishing loading in the row of thumbnails should not undo.
    if (store.directorMode && audibleCells(store.cells).length) return
    store.muteAllExcept(event.cellId)
  }
}

export const playbackHub = new PlaybackHub({ onEvent: handleEvent })

let heard = soleAudibleCell(useMultiview.getState().cells)
let handoffs = 0

/** Noticed here, so that it shows no matter what moved the sound. */
function announceHandoff(muteOthers: boolean, cells: readonly Cell[]) {
  const sole = muteOthers ? soleAudibleCell(cells) : null
  if (!muteOthers) heard = null
  // Mid-change two streams can briefly have sound, which is not a handoff yet.
  if (!sole || sole === heard) return
  useMultiviewUi.getState().set({
    audioHandoff: { id: ++handoffs, to: sole, from: heard },
  })
  heard = sole
}

// The store says what each player should be; this makes it so.
useMultiview.subscribe((state, previous) => {
  if (state.cells !== previous.cells) {
    for (const cell of state.cells) {
      if (isVideoCell(cell)) {
        playbackHub.applyMuted(cell.id, !!cell.content.muted)
      }
    }
  }
  if (
    state.cells !== previous.cells ||
    state.muteOthers !== previous.muteOthers
  ) {
    announceHandoff(state.muteOthers, state.cells)
  }
})

export function useMuteSettling(cellId: CellId) {
  return useSyncExternalStore(playbackHub.subscribe, () =>
    playbackHub.isMuteSettling(cellId)
  )
}

export function usePlayerStatus(cellId: CellId) {
  return (
    useSyncExternalStore(playbackHub.subscribe, () =>
      playbackHub.getStatus(cellId)
    ) ?? INITIAL_PLAYER_STATUS
  )
}
