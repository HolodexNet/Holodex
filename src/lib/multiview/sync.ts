import type { MultiviewVideo } from "./types.ts"

/**
 * Archive sync lines up finished streams by when they originally aired, on one
 * shared timeline. These functions decide what each player should do; applying
 * those decisions is up to the caller.
 */

/** Streams further apart than this have nothing to line up. */
const OVERLAP_THRESHOLD_SECONDS = 60 * 60
/** How far a player may drift, per unit of playback rate, before correcting. */
const DRIFT_TOLERANCE_SECONDS = 1.5
/** Positions this close together count as already synced. */
const ALIGNED_SECONDS = 2

export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const

export interface SyncVideo {
  id: string
  video: MultiviewVideo
  startTs: number
  endTs: number
  duration: number
}

export interface Timeline {
  videos: SyncVideo[]
  minTs: number
  maxTs: number
}

function toSyncVideo(video: MultiviewVideo): SyncVideo | null {
  if (video.status !== "past" || !video.available_at || !video.duration) {
    return null
  }
  const startTs = new Date(video.available_at).getTime() / 1000
  if (!Number.isFinite(startTs)) return null
  return {
    id: video.id,
    video,
    startTs,
    endTs: startTs + video.duration,
    duration: video.duration,
  }
}

/**
 * The finished streams that can play together. Walking them in air order, a
 * stream joins when it began within the threshold of the previous one ending.
 * A lone stream that nothing joined gives way to the next one.
 */
export function buildTimeline(
  videos: readonly MultiviewVideo[]
): Timeline | null {
  const candidates = videos
    .map(toSyncVideo)
    .filter((video) => video !== null)
    .sort((a, b) => a.startTs - b.startTs)

  const overlap: SyncVideo[] = []
  for (const video of candidates) {
    const last = overlap.at(-1)
    if (!last || video.startTs - last.endTs < OVERLAP_THRESHOLD_SECONDS) {
      overlap.push(video)
    } else if (overlap.length === 1) {
      overlap[0] = video
    }
  }
  if (!overlap.length) return null
  return {
    videos: overlap,
    minTs: Math.min(...overlap.map((video) => video.startTs)),
    maxTs: Math.max(...overlap.map((video) => video.endTs)),
  }
}

export const percentForTime = (timeline: Timeline, ts: number) => {
  const span = timeline.maxTs - timeline.minTs
  return span > 0 ? ((ts - timeline.minTs) / span) * 100 : 0
}

export const timeForPercent = (timeline: Timeline, percent: number) =>
  (percent / 100) * (timeline.maxTs - timeline.minTs) + timeline.minTs

export const clampToTimeline = (timeline: Timeline, ts: number) =>
  Math.min(Math.max(ts, timeline.minTs), timeline.maxTs)

export interface BarSegment {
  id: string
  video: MultiviewVideo
  /** Position and length as fractions of the whole timeline. */
  offset: number
  width: number
}

export function barSegments(timeline: Timeline): BarSegment[] {
  const span = timeline.maxTs - timeline.minTs || 1
  return timeline.videos.map((video) => ({
    id: video.id,
    video: video.video,
    offset: (video.startTs - timeline.minTs) / span,
    width: video.duration / span,
  }))
}

/** Offsets from a shared link fill in for videos with no local adjustment. */
export function resolveOffsets(
  timeline: Timeline | null,
  local: Readonly<Record<string, number>>,
  fromLink: readonly number[] | undefined
): Record<string, number> {
  if (!timeline || !fromLink) return { ...local }
  const merged: Record<string, number> = { ...local }
  timeline.videos.forEach((video, index) => {
    const linked = fromLink[index]
    if (merged[video.id] === undefined && Number.isFinite(linked)) {
      merged[video.id] = linked
    }
  })
  return merged
}

export function parseOffsets(value: string | null): number[] | undefined {
  return value ? value.split(",").map(Number) : undefined
}

/** Local offsets in timeline order, or nothing if they are all zero. */
export function encodeOffsets(
  timeline: Timeline,
  offsets: Readonly<Record<string, number>>
): string | null {
  const values = timeline.videos.map((video) => offsets[video.id] ?? 0)
  return values.some(Boolean) ? values.join(",") : null
}

export interface PlayerPosition {
  currentTime: number
  playing: boolean
}

export type PlayerPositions = ReadonlyMap<string, PlayerPosition>

/**
 * Where to begin: the shared link's time, then the position everything is
 * already agreed on, then the moment every stream has started.
 */
export function findStartTime(
  timeline: Timeline,
  positions: PlayerPositions,
  fromLink?: number
): number {
  if (fromLink !== undefined && Number.isFinite(fromLink)) {
    return clampToTimeline(timeline, fromLink)
  }
  const absolute = timeline.videos.flatMap((video) => {
    const position = positions.get(video.id)
    return position ? [position.currentTime + video.startTs] : []
  })
  if (
    absolute.length === timeline.videos.length &&
    Math.max(...absolute) - Math.min(...absolute) < ALIGNED_SECONDS
  ) {
    return absolute.reduce((sum, t) => sum + t, 0) / absolute.length
  }
  return Math.max(...timeline.videos.map((video) => video.startTs))
}

export type SyncCommand =
  | { kind: "pause"; videoId: string }
  | { kind: "rate"; videoId: string; rate: number }
  | {
      kind: "seek"
      videoId: string
      time: number
      play: boolean
      rate?: number
    }

export interface TickInput {
  timeline: Timeline
  currentTs: number
  paused: boolean
  rate: number
  offsets: Readonly<Record<string, number>>
  positions: PlayerPositions
}

/** Pauses streams outside their window; seeks ones that have drifted too far. */
export function planTick({
  timeline,
  currentTs,
  paused,
  rate,
  offsets,
  positions,
}: TickInput): SyncCommand[] {
  const tolerance = DRIFT_TOLERANCE_SECONDS * rate
  return timeline.videos.flatMap((video): SyncCommand[] => {
    const position = positions.get(video.id)
    if (!position) return []
    const expected = currentTs - video.startTs + (offsets[video.id] ?? 0)
    if (expected < 0 || expected > video.duration) {
      return position.playing ? [{ kind: "pause", videoId: video.id }] : []
    }
    if (Math.abs(expected - position.currentTime) > tolerance) {
      return [
        {
          kind: "seek",
          videoId: video.id,
          time: expected,
          play: !paused,
          rate,
        },
      ]
    }
    return []
  })
}

/** Moves every stream to a point on the timeline. */
export function planSeek(
  timeline: Timeline,
  ts: number,
  paused: boolean,
  offsets: Readonly<Record<string, number>>
): SyncCommand[] {
  return timeline.videos.flatMap((video): SyncCommand[] => {
    const time = ts - video.startTs + (offsets[video.id] ?? 0)
    if (time < 0 || time > video.duration) {
      return [
        { kind: "pause", videoId: video.id },
        {
          kind: "seek",
          videoId: video.id,
          time: time < 0 ? 0 : video.duration - 1,
          play: false,
        },
      ]
    }
    return [{ kind: "seek", videoId: video.id, time, play: !paused }]
  })
}

/** How far through its own stream a video is, for the per-channel bars. */
export function videoProgress(
  video: SyncVideo,
  currentTs: number,
  currentTime: number
): number {
  if (currentTs > video.endTs) return 100
  return Math.min(Math.max((currentTime / video.duration) * 100, 0), 100)
}
