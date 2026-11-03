import {
  INITIAL_PLAYER_STATUS,
  type PlayerController,
  type PlayerStatus,
} from "../player/types.ts"
import type { CellId } from "./types.ts"

/** Reading a player costs little, and sync and chat both want current times. */
const POLL_INTERVAL_MS = 500
/**
 * The YouTube API answers from a copy of the player's state that updates after
 * a command takes effect. For this long a differing value is assumed to be that
 * lag, rather than the viewer pressing the player's own mute button.
 */
const MUTE_SETTLE_MS = 1500

export type PlaybackEvent =
  | { type: "first-play"; cellId: CellId }
  /** Changed inside the player itself, so the app is only finding out now. */
  | { type: "muted-by-player"; cellId: CellId; muted: boolean }

export interface PlaybackHubOptions {
  onEvent: (event: PlaybackEvent) => void
  now?: () => number
  schedule?: (callback: () => void, ms: number) => () => void
}

interface Entry {
  controller: PlayerController
  status: PlayerStatus
  played: boolean
  /** Mute state last asked for, and when, while the player catches up. */
  mute: { value: boolean; at: number } | null
}

const sameStatus = (a: PlayerStatus, b: PlayerStatus) =>
  a.state === b.state &&
  a.currentTime === b.currentTime &&
  a.muted === b.muted &&
  a.volume === b.volume &&
  a.playbackRate === b.playbackRate

const defaultSchedule = (callback: () => void, ms: number) => {
  const timer = setInterval(callback, ms)
  return () => clearInterval(timer)
}

/**
 * Owns the live players, keyed by cell. It polls their status at a fixed rate
 * so that fast-changing values such as the current time never pass through the
 * persisted store, and publishes in a form `useSyncExternalStore` can consume.
 */
export class PlaybackHub {
  private readonly entries = new Map<CellId, Entry>()
  private readonly listeners = new Set<() => void>()
  private readonly options: PlaybackHubOptions
  private stopPolling: (() => void) | null = null

  constructor(options: PlaybackHubOptions) {
    this.options = options
  }

  /** Takes ownership of the player. The returned function releases it. */
  register(cellId: CellId, controller: PlayerController): () => void {
    this.entries.set(cellId, {
      controller,
      status: INITIAL_PLAYER_STATUS,
      played: false,
      mute: null,
    })
    this.startPolling()
    this.emit()
    return () => {
      if (this.entries.get(cellId)?.controller !== controller) return
      this.entries.delete(cellId)
      if (!this.entries.size) {
        this.stopPolling?.()
        this.stopPolling = null
      }
      this.emit()
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Stable between changes, so it can be a `useSyncExternalStore` snapshot. */
  getStatus = (cellId: CellId): PlayerStatus | undefined =>
    this.entries.get(cellId)?.status

  controller(cellId: CellId): PlayerController | undefined {
    return this.entries.get(cellId)?.controller
  }

  /** Told to change its mute state, and not yet seen to have done so. */
  isMuteSettling = (cellId: CellId): boolean => !!this.entries.get(cellId)?.mute

  /** Applies the wanted mute state, skipping players that already match. */
  applyMuted(cellId: CellId, muted: boolean) {
    const entry = this.entries.get(cellId)
    if (!entry || entry.status.muted === muted) return
    entry.mute = { value: muted, at: this.now() }
    entry.controller.setMuted(muted)
    this.publish(cellId, entry, { ...entry.status, muted })
  }

  /**
   * The player can now take commands. Whatever it was asked for at creation may
   * be out of date by the time it finishes loading, so it is told again, and a
   * brief mismatch while that lands is not read as the viewer changing it.
   */
  markReady(cellId: CellId, muted: boolean) {
    const entry = this.entries.get(cellId)
    if (!entry) return
    entry.mute = { value: muted, at: this.now() }
    entry.controller.setMuted(muted)
    this.publish(cellId, entry, { ...entry.status, muted })
  }

  /** Call as soon as a player's state changes, between regular polls. */
  refresh(cellId: CellId) {
    const entry = this.entries.get(cellId)
    if (entry) this.poll(cellId, entry)
  }

  private now() {
    return this.options.now?.() ?? Date.now()
  }

  private emit() {
    for (const listener of this.listeners) listener()
  }

  private startPolling() {
    if (this.stopPolling) return
    const schedule = this.options.schedule ?? defaultSchedule
    this.stopPolling = schedule(() => {
      for (const [cellId, entry] of this.entries) this.poll(cellId, entry)
    }, POLL_INTERVAL_MS)
  }

  private poll(cellId: CellId, entry: Entry) {
    const next = entry.controller.read()
    const events: PlaybackEvent[] = []

    const before = entry.status
    let settledNow = false
    const wanted = entry.mute
    if (wanted) {
      settledNow =
        next.muted === wanted.value || this.now() - wanted.at >= MUTE_SETTLE_MS
      if (settledNow) entry.mute = null
      else next.muted = wanted.value
    } else if (next.muted !== entry.status.muted && next.state !== "loading") {
      events.push({ type: "muted-by-player", cellId, muted: next.muted })
    }

    if (next.state === "playing" && !entry.played) {
      entry.played = true
      events.push({ type: "first-play", cellId })
    }

    // Published first, so anything these events change sees the new status.
    this.publish(cellId, entry, next)
    if (settledNow && entry.status === before) this.emit()
    for (const event of events) this.options.onEvent(event)
  }

  private publish(cellId: CellId, entry: Entry, status: PlayerStatus) {
    if (sameStatus(entry.status, status)) return
    if (this.entries.get(cellId) !== entry) return
    entry.status = status
    this.emit()
  }
}
