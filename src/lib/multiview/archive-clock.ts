import {
  clampToTimeline,
  findStartTime,
  planSeek,
  planTick,
  type PlayerPositions,
  type SyncCommand,
  type Timeline,
} from "./sync.ts"

const TICK_MS = 500

export interface ArchiveClockSnapshot {
  paused: boolean
  rate: number
  /** Where everything should be on the shared timeline, in Unix seconds. */
  currentTs: number
}

/** What is on the grid at this moment; read afresh on every tick. */
export interface ArchiveClockInput {
  timeline: Timeline | null
  offsets: Readonly<Record<string, number>>
  positions: PlayerPositions
  /** The time a shared link asked to start from. */
  linkedTime?: number
}

export interface ArchiveClockOptions {
  read: () => ArchiveClockInput
  run: (commands: SyncCommand[]) => void
  now?: () => number
  schedule?: (callback: () => void, ms: number) => () => void
}

const INITIAL: ArchiveClockSnapshot = { paused: true, rate: 1, currentTs: 0 }

const defaultSchedule = (callback: () => void, ms: number) => {
  const timer = setInterval(callback, ms)
  return () => clearInterval(timer)
}

/**
 * The one clock behind archive sync, however many controls are showing it. Two
 * clocks would seek the same players against each other, so controls share this
 * one, and it runs only while at least one of them is on screen: a player nobody
 * can see the sync for should not be getting seeked.
 */
export class ArchiveClock {
  private readonly options: ArchiveClockOptions
  private readonly listeners = new Set<() => void>()
  private snapshot = INITIAL
  private users = 0
  private stop: (() => void) | null = null
  private lastTick = 0
  private firstSeek = true

  constructor(options: ArchiveClockOptions) {
    this.options = options
  }

  /** Whether anything on screen is showing the clock, which is what keeps it running. */
  get running() {
    return this.users > 0
  }

  /** Starts the clock if this is the first user. The returned function releases it. */
  acquire(): () => void {
    this.users++
    if (this.users === 1) {
      this.lastTick = this.now()
      const schedule = this.options.schedule ?? defaultSchedule
      this.stop = schedule(() => this.tick(), TICK_MS)
    }
    let released = false
    return () => {
      if (released) return
      released = true
      this.users--
      if (this.users > 0) return
      this.stop?.()
      this.stop = null
      // Closing the last control is the end of the session, as it always was.
      this.firstSeek = true
      this.update(INITIAL)
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): ArchiveClockSnapshot => this.snapshot

  seek = (ts: number) => {
    const { timeline, offsets } = this.options.read()
    if (!timeline) return
    const currentTs = clampToTimeline(timeline, ts)
    // Moving on the timeline for the first time means they want to watch.
    const paused = this.firstSeek ? false : this.snapshot.paused
    this.firstSeek = false
    this.update({ ...this.snapshot, paused, currentTs })
    this.options.run(planSeek(timeline, currentTs, paused, offsets))
  }

  setPaused = (paused: boolean) => {
    this.update({ ...this.snapshot, paused })
    this.firstSeek = false
    const { timeline, offsets } = this.options.read()
    if (!timeline) return
    this.options.run(
      paused
        ? timeline.videos.map((video) => ({ kind: "pause", videoId: video.id }))
        : planSeek(timeline, this.snapshot.currentTs, false, offsets)
    )
  }

  setRate = (rate: number) => {
    this.update({ ...this.snapshot, rate })
    const { timeline } = this.options.read()
    if (!timeline) return
    this.options.run(
      timeline.videos.map((video) => ({
        kind: "rate",
        videoId: video.id,
        rate,
      }))
    )
  }

  private now() {
    return this.options.now?.() ?? Date.now()
  }

  private update(next: ArchiveClockSnapshot) {
    const { paused, rate, currentTs } = this.snapshot
    if (
      paused === next.paused &&
      rate === next.rate &&
      currentTs === next.currentTs
    ) {
      return
    }
    this.snapshot = next
    for (const listener of this.listeners) listener()
  }

  private tick() {
    const now = this.now()
    const elapsed = (now - this.lastTick) / 1000
    this.lastTick = now
    const { timeline, offsets, positions, linkedTime } = this.options.read()
    if (!timeline) return

    const { paused, rate } = this.snapshot
    let ts = this.snapshot.currentTs
    if (ts <= 0 || ts < timeline.minTs || ts > timeline.maxTs) {
      ts = findStartTime(timeline, positions, linkedTime)
    } else if (!paused) {
      ts = clampToTimeline(timeline, ts + elapsed * rate)
    }
    this.update({ ...this.snapshot, currentTs: ts })
    this.options.run(
      planTick({ timeline, currentTs: ts, paused, rate, offsets, positions })
    )
  }
}
