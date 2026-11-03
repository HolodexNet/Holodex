/**
 * What the multiview needs from a player, whichever site's embed is behind it.
 * Adapters live next to this file; the rest of the app only sees this contract.
 */

export type PlayerState =
  | "loading"
  | "unstarted"
  | "cued"
  | "buffering"
  | "playing"
  | "paused"
  | "ended"
  | "error"

export interface PlayerStatus {
  state: PlayerState
  /** Seconds. Live streams report position in the broadcast's DVR window. */
  currentTime: number
  muted: boolean
  /** 0 to 100. */
  volume: number
  playbackRate: number
}

export const INITIAL_PLAYER_STATUS: PlayerStatus = {
  state: "loading",
  currentTime: 0,
  muted: false,
  volume: 100,
  playbackRate: 1,
}

export interface PlayerController {
  /** Providers without variable-speed playback ignore `setPlaybackRate`. */
  readonly supportsPlaybackRate: boolean
  play(): void
  pause(): void
  seekTo(seconds: number): void
  setMuted(muted: boolean): void
  setVolume(volume: number): void
  setPlaybackRate(rate: number): void
  /** The player's present status, read without waiting on anything. */
  read(): PlayerStatus
  destroy(): void
}

export interface PlayerCallbacks {
  /** Controls now take effect. Sets the player to the muted state requested. */
  onReady: () => void
  onStateChange: (state: PlayerState) => void
}
