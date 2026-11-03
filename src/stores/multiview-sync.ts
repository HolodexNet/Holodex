import { ArchiveClock } from "@/lib/multiview/archive-clock"
import { activeVideos, videoCells } from "@/lib/multiview/cells"
import {
  buildTimeline,
  resolveOffsets,
  type PlayerPosition,
  type SyncCommand,
  type Timeline,
} from "@/lib/multiview/sync"
import type { Cell } from "@/lib/multiview/types"
import { useMultiview } from "./multiview"
import { playbackHub } from "./multiview-playback"

/** What a shared link asked for, kept here so that the clock can read it. */
const link: { time?: number; offsets?: number[] } = {}

export function setArchiveLink(time?: number, offsets?: number[]) {
  link.time = time
  link.offsets = offsets
}

let lastCells: readonly Cell[] | undefined
let lastTimeline: Timeline | null = null

/** Rebuilt only when the cells change, so that renders and ticks can share it. */
export function currentTimeline(cells: readonly Cell[]): Timeline | null {
  if (cells !== lastCells) {
    lastCells = cells
    lastTimeline = buildTimeline(activeVideos(cells))
  }
  return lastTimeline
}

function cellIdsByVideo() {
  const ids = new Map<string, string>()
  for (const cell of videoCells(useMultiview.getState().cells)) {
    ids.set(cell.content.video.id, cell.id)
  }
  return ids
}

function readPositions() {
  const positions = new Map<string, PlayerPosition>()
  for (const [videoId, cellId] of cellIdsByVideo()) {
    const status = playbackHub.getStatus(cellId)
    if (status) {
      positions.set(videoId, {
        currentTime: status.currentTime,
        playing: status.state === "playing" || status.state === "buffering",
      })
    }
  }
  return positions
}

function runCommands(commands: SyncCommand[]) {
  const ids = cellIdsByVideo()
  for (const command of commands) {
    const cellId = ids.get(command.videoId)
    const player = cellId ? playbackHub.controller(cellId) : undefined
    if (!player) continue
    if (command.kind === "pause") {
      player.pause()
    } else if (command.kind === "rate") {
      player.setPlaybackRate(command.rate)
    } else {
      player.seekTo(command.time)
      if (command.play) player.play()
      else player.pause()
      if (command.rate) player.setPlaybackRate(command.rate)
    }
  }
}

export const archiveClock = new ArchiveClock({
  read: () => {
    const { cells, syncOffsets } = useMultiview.getState()
    const timeline = currentTimeline(cells)
    return {
      timeline,
      offsets: resolveOffsets(timeline, syncOffsets, link.offsets),
      positions: readPositions(),
      linkedTime: link.time,
    }
  },
  run: runCommands,
})
