import { useSyncExternalStore } from "react"

import { isVideoCell } from "@/lib/multiview/cells"
import { PlaybackHub, type PlaybackEvent } from "@/lib/multiview/playback"
import type { CellId } from "@/lib/multiview/types"
import { INITIAL_PLAYER_STATUS } from "@/lib/player/types"
import { useMultiview } from "./multiview"

function handleEvent(event: PlaybackEvent) {
  const store = useMultiview.getState()
  if (event.type === "muted-by-player") {
    store.setMuted(event.cellId, event.muted)
    if (!event.muted && store.muteOthers) store.muteAllExcept(event.cellId)
  } else if (store.muteOthers) {
    // Starting a new stream takes the audio focus.
    store.muteAllExcept(event.cellId)
  }
}

export const playbackHub = new PlaybackHub({ onEvent: handleEvent })

// The store says what each player should be; this makes it so.
useMultiview.subscribe((state, previous) => {
  if (state.cells === previous.cells) return
  for (const cell of state.cells) {
    if (isVideoCell(cell)) {
      playbackHub.applyMuted(cell.id, !!cell.content.muted)
    }
  }
})

export function usePlayerStatus(cellId: CellId) {
  return (
    useSyncExternalStore(playbackHub.subscribe, () =>
      playbackHub.getStatus(cellId)
    ) ?? INITIAL_PLAYER_STATUS
  )
}
