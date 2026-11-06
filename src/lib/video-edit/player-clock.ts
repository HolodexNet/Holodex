import type { PlayerController, PlayerState } from "../player/types.ts"

export interface ClockController extends PlayerController {
  duration(): number
}

export interface ClockStatus {
  state: PlayerState
  ready: boolean
  /** Seconds, or 0 while the player has not said. */
  duration: number
}

const POLL_MS = 100
/** A player reports its old position for a moment after being told to seek. */
const SEEK_SETTLE_MS = 1200

/**
 * The editor's one source of "where are we in the video". Position changes many
 * times a second, so it stays out of React: `now()` reads it directly for the
 * timeline's playhead, and React only hears about whole seconds and state changes.
 */
export class PlayerClock {
  private controller: ClockController | null = null
  private timer: ReturnType<typeof setInterval> | undefined
  private status: ClockStatus = { state: "loading", ready: false, duration: 0 }
  private time = 0
  private lastRead = -1
  private readAt = 0
  private rate = 1
  private second = 0
  private stopAt: number | null = null
  private listening: { from: number; to: number } | null = null
  private seeking: { target: number; until: number } | null = null
  private pendingSeek: number | null = null
  private statusListeners = new Set<() => void>()
  private secondListeners = new Set<() => void>()

  attach(controller: ClockController) {
    this.controller = controller
    clearInterval(this.timer)
    this.timer = setInterval(() => this.poll(), POLL_MS)
  }

  detach() {
    clearInterval(this.timer)
    this.controller = null
    this.setStatus({ state: "loading", ready: false })
  }

  markReady() {
    this.setStatus({ ready: true })
    if (this.pendingSeek !== null) {
      const target = this.pendingSeek
      this.pendingSeek = null
      this.seek(target)
    }
  }

  setState(state: PlayerState) {
    // Read first: where `now()` reads from depends on whether it is playing.
    const position = this.now()
    this.setStatus({ state })
    this.anchor(position)
  }

  /** The position right now, between the player's own updates. */
  now(): number {
    if (this.status.state !== "playing") return this.time
    return this.time + ((performance.now() - this.readAt) / 1000) * this.rate
  }

  seek(seconds: number) {
    const target = Math.max(0, seconds)
    this.stopAt = null
    this.listening = null
    if (!this.controller || !this.status.ready) {
      this.pendingSeek = target
      this.anchor(target)
      this.publishSecond()
      return
    }
    this.controller.seekTo(target)
    this.seeking = { target, until: performance.now() + SEEK_SETTLE_MS }
    this.anchor(target)
    this.publishSecond()
  }

  skip(delta: number) {
    this.seek(this.now() + delta)
  }

  play() {
    this.controller?.play()
  }

  pause() {
    this.stopAt = null
    this.controller?.pause()
  }

  toggle() {
    if (this.status.state === "playing") this.pause()
    else this.play()
  }

  /** Plays from a point onward: how to check that a song starts where it should. */
  hearFrom(seconds: number) {
    this.seek(seconds)
    this.play()
  }

  /**
   * Plays up to a point and stops there, which is how to check that a song ends
   * where it should: the cut is what you are listening for.
   */
  hearUntil(seconds: number, lead = 6) {
    const from = Math.max(0, seconds - lead)
    this.seek(from)
    this.stopAt = seconds
    this.listening = { from, to: seconds }
    this.play()
  }

  /**
   * The stretch last played by `hearUntil`, for showing how far along it is. It
   * stays after playback stops at the end, and is only meaningful while the
   * playhead is still inside it.
   */
  get hearing(): { from: number; to: number } | null {
    return this.listening
  }

  subscribeStatus = (listener: () => void) => {
    this.statusListeners.add(listener)
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  getStatus = () => this.status

  subscribeSecond = (listener: () => void) => {
    this.secondListeners.add(listener)
    return () => {
      this.secondListeners.delete(listener)
    }
  }

  getSecond = () => this.second

  private setStatus(patch: Partial<ClockStatus>) {
    const next = { ...this.status, ...patch }
    if (
      next.state === this.status.state &&
      next.ready === this.status.ready &&
      next.duration === this.status.duration
    )
      return
    this.status = next
    for (const listener of this.statusListeners) listener()
  }

  private anchor(time: number) {
    this.time = time
    this.readAt = performance.now()
  }

  private publishSecond() {
    const second = Math.floor(this.now())
    if (second === this.second) return
    this.second = second
    for (const listener of this.secondListeners) listener()
  }

  private poll() {
    const controller = this.controller
    if (!controller) return
    const read = controller.read()
    const duration = controller.duration()
    if (duration && duration !== this.status.duration)
      this.setStatus({ duration })
    if (read.state !== this.status.state) this.setState(read.state)
    this.rate = read.playbackRate || 1

    if (this.seeking) {
      const settled =
        Math.abs(read.currentTime - this.seeking.target) < 2 ||
        performance.now() > this.seeking.until
      if (settled) this.seeking = null
    }
    // The player's clock only moves a few times a second. Anchoring on each new
    // value, not each poll, is what lets `now()` run smoothly in between.
    if (!this.seeking && read.currentTime !== this.lastRead) {
      this.lastRead = read.currentTime
      this.anchor(read.currentTime)
    }

    if (
      this.stopAt !== null &&
      this.status.state === "playing" &&
      this.now() >= this.stopAt
    ) {
      this.stopAt = null
      controller.pause()
    }
    this.publishSecond()
  }
}
