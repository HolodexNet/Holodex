import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"

import { videoCells } from "@/lib/multiview/cells"
import {
  buildTimeline,
  clampToTimeline,
  findStartTime,
  parseOffsets,
  planSeek,
  planTick,
  resolveOffsets,
  type PlayerPositions,
  type SyncCommand,
} from "@/lib/multiview/sync"
import { useMultiview } from "@/stores/multiview"
import { playbackHub } from "@/stores/multiview-playback"

const TICK_MS = 500

function cellIdsByVideo() {
  const ids = new Map<string, string>()
  for (const cell of videoCells(useMultiview.getState().cells)) {
    ids.set(cell.content.video.id, cell.id)
  }
  return ids
}

function readPositions(): PlayerPositions {
  const positions = new Map()
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
    } else {
      player.seekTo(command.time)
      if (command.play) player.play()
      else player.pause()
      if (command.rate) player.setPlaybackRate(command.rate)
    }
  }
}

/** Drives every archive on the grid along one shared timeline. */
export function useArchiveSync() {
  const [params] = useSearchParams()
  const cells = useMultiview((s) => s.cells)
  const localOffsets = useMultiview((s) => s.syncOffsets)
  const videos = useMemo(
    () => videoCells(cells).map((cell) => cell.content.video),
    [cells]
  )
  const timeline = useMemo(() => buildTimeline(videos), [videos])
  const linkedOffsets = params.get("offsets")
  const offsets = useMemo(
    () => resolveOffsets(timeline, localOffsets, parseOffsets(linkedOffsets)),
    [timeline, localOffsets, linkedOffsets]
  )
  const linkedTime = params.get("t")

  const [paused, setPausedState] = useState(true)
  const [rate, setRateState] = useState(1)
  const [currentTs, setCurrentTs] = useState(0)

  /** Mutable copy for the ticker, so changing them does not restart it. */
  const state = useRef({ currentTs, paused, rate, offsets, timeline })
  useEffect(() => {
    Object.assign(state.current, { paused, rate, offsets, timeline })
  }, [paused, rate, offsets, timeline])
  const lastTick = useRef(0)
  const firstSeek = useRef(true)

  const applyTs = (ts: number) => {
    state.current.currentTs = ts
    setCurrentTs(ts)
  }

  useEffect(() => {
    lastTick.current = Date.now()
    const timer = setInterval(() => {
      const { timeline, paused, rate, offsets } = state.current
      const now = Date.now()
      const elapsed = (now - lastTick.current) / 1000
      lastTick.current = now
      if (!timeline) return

      let ts = state.current.currentTs
      const positions = readPositions()
      if (ts <= 0 || ts < timeline.minTs || ts > timeline.maxTs) {
        ts = findStartTime(
          timeline,
          positions,
          linkedTime ? Number(linkedTime) : undefined
        )
      } else if (!paused) {
        ts = clampToTimeline(timeline, ts + elapsed * rate)
      }
      applyTs(ts)
      runCommands(
        planTick({ timeline, currentTs: ts, paused, rate, offsets, positions })
      )
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [linkedTime])

  const seek = useCallback((ts: number) => {
    const { timeline, offsets } = state.current
    if (!timeline) return
    const target = clampToTimeline(timeline, ts)
    // Moving on the timeline for the first time means they want to watch.
    let { paused } = state.current
    if (firstSeek.current) {
      firstSeek.current = false
      paused = false
      setPausedState(false)
    }
    applyTs(target)
    runCommands(planSeek(timeline, target, paused, offsets))
  }, [])

  const setPaused = useCallback((next: boolean) => {
    const { timeline, offsets, currentTs } = state.current
    state.current.paused = next
    setPausedState(next)
    firstSeek.current = false
    if (!timeline) return
    if (next) {
      runCommands(
        timeline.videos.map((video) => ({ kind: "pause", videoId: video.id }))
      )
    } else {
      runCommands(planSeek(timeline, currentTs, false, offsets))
    }
  }, [])

  const setRate = useCallback((next: number) => {
    setRateState(next)
    const { timeline } = state.current
    if (!timeline) return
    const ids = cellIdsByVideo()
    for (const video of timeline.videos) {
      const cellId = ids.get(video.id)
      if (cellId) playbackHub.controller(cellId)?.setPlaybackRate(next)
    }
  }, [])

  return {
    timeline,
    offsets,
    paused,
    rate,
    currentTs,
    seek,
    setPaused,
    setRate,
  }
}
