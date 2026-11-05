import {
  INITIAL_PLAYER_STATUS,
  type PlayerCallbacks,
  type PlayerController,
  type PlayerState,
  type PlayerStatus,
} from "./types.ts"
import { loadYouTube, type YTEvent, type YTPlayer } from "./youtube-api.ts"

const STATES: Record<number, PlayerState> = {
  [-1]: "unstarted",
  0: "ended",
  1: "playing",
  2: "paused",
  3: "buffering",
  5: "cued",
}

/** "Embedding disabled" sometimes clears up on a single retry. */
const RETRYABLE_ERROR = 150

export interface YoutubePlayerOptions extends PlayerCallbacks {
  host: HTMLElement
  videoId: string
  /** Language for captions and the player's interface. */
  lang: string
  muted: boolean
  /** The API script could not be loaded. */
  onLoadError: (error: Error) => void
}

/** YouTube can also say how long the video is, which not every provider can. */
export interface YoutubeController extends PlayerController {
  /** Seconds, or 0 while that is not known yet. */
  duration(): number
}

export function createYoutubePlayer({
  host,
  videoId,
  lang,
  muted,
  onReady,
  onStateChange,
  onLoadError,
}: YoutubePlayerOptions): YoutubeController {
  // YT.Player replaces this element, so React's own node is never involved.
  const mount = document.createElement("div")
  host.appendChild(mount)

  let player: YTPlayer | null = null
  let ready = false
  let destroyed = false
  let retried = false
  let lastState: PlayerState = "loading"

  const setState = (state: PlayerState) => {
    lastState = state
    onStateChange(state)
  }

  loadYouTube()
    .then((yt) => {
      if (destroyed) return
      player = new yt.Player(mount, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          playsinline: 1,
          cc_lang_pref: lang,
          hl: lang,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (destroyed || !player) return
            ready = true
            if (muted) player.mute()
            else player.unMute()
            onReady()
          },
          onStateChange: (event: YTEvent) => {
            const state = STATES[event.data]
            if (!destroyed && state) setState(state)
          },
          onError: (event: YTEvent) => {
            if (destroyed) return
            if (!retried && event.data === RETRYABLE_ERROR) {
              retried = true
              event.target.loadVideoById(videoId)
              return
            }
            setState("error")
          },
        },
      })
    })
    .catch((error: Error) => {
      if (!destroyed) onLoadError(error)
    })

  const whenReady = (action: (player: YTPlayer) => void) => {
    if (ready && player && !destroyed) action(player)
  }

  return {
    supportsPlaybackRate: true,
    play: () => whenReady((p) => p.playVideo()),
    pause: () => whenReady((p) => p.pauseVideo()),
    seekTo: (seconds) => whenReady((p) => p.seekTo(seconds, true)),
    setMuted: (value) =>
      whenReady((p) => {
        if (value) p.mute()
        else p.unMute()
      }),
    setVolume: (volume) => whenReady((p) => p.setVolume(volume)),
    setPlaybackRate: (rate) => whenReady((p) => p.setPlaybackRate(rate)),
    duration: () => (ready && player ? player.getDuration() || 0 : 0),
    read(): PlayerStatus {
      if (!ready || !player || destroyed) {
        return { ...INITIAL_PLAYER_STATUS, state: lastState, muted }
      }
      return {
        state: lastState,
        currentTime: player.getCurrentTime() || 0,
        muted: player.isMuted(),
        volume: player.getVolume(),
        playbackRate: player.getPlaybackRate(),
      }
    },
    destroy() {
      destroyed = true
      player?.destroy()
      player = null
      host.replaceChildren()
    },
  }
}
