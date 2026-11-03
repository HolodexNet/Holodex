import {
  INITIAL_PLAYER_STATUS,
  type PlayerCallbacks,
  type PlayerController,
  type PlayerState,
  type PlayerStatus,
} from "./types.ts"

interface TwitchEmbed {
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
  getCurrentTime: () => number
  getMuted: () => boolean
  setMuted: (muted: boolean) => void
  getVolume: () => number
  setVolume: (volume: number) => void
  setQuality: (quality: string) => void
  isPaused: () => boolean
  addEventListener: (event: string, listener: () => void) => void
}

interface TwitchGlobal {
  Player: new (element: HTMLElement, options: object) => TwitchEmbed
}

declare global {
  interface Window {
    Twitch?: TwitchGlobal
  }
}

const API_SCRIPT = "https://player.twitch.tv/js/embed/v1.js"

let apiPromise: Promise<TwitchGlobal> | undefined

function loadTwitch(): Promise<TwitchGlobal> {
  if (window.Twitch?.Player) return Promise.resolve(window.Twitch)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = API_SCRIPT
    script.addEventListener("load", () => {
      if (window.Twitch) resolve(window.Twitch)
      else reject(new Error("Twitch player failed to initialize"))
    })
    script.addEventListener("error", () => {
      script.remove()
      apiPromise = undefined
      reject(new Error("Could not load Twitch player"))
    })
    document.head.appendChild(script)
  })
  return apiPromise
}

export type TwitchPlayerSource = { channel: string } | { videoId: string }

export type TwitchPlayerOptions = PlayerCallbacks &
  TwitchPlayerSource & {
    host: HTMLElement
    muted: boolean
    onLoadError: (error: Error) => void
  }

export function createTwitchPlayer(
  options: TwitchPlayerOptions
): PlayerController {
  const { host, muted, onReady, onStateChange, onLoadError } = options
  const mount = document.createElement("div")
  mount.style.height = "100%"
  host.appendChild(mount)

  let player: TwitchEmbed | null = null
  let ready = false
  let destroyed = false
  let lastState: PlayerState = "loading"

  const setState = (state: PlayerState) => {
    lastState = state
    onStateChange(state)
  }

  loadTwitch()
    .then((twitch) => {
      if (destroyed) return
      const embed = new twitch.Player(mount, {
        width: "100%",
        height: "100%",
        parent: [window.location.hostname],
        autoplay: false,
        playsinline: true,
        muted,
        ...("channel" in options
          ? { channel: options.channel }
          : { video: `v${options.videoId}` }),
      })
      player = embed
      embed.addEventListener("ready", () => {
        if (destroyed) return
        ready = true
        embed.setQuality("medium")
        embed.setMuted(muted)
        setState(embed.isPaused() ? "paused" : "playing")
        onReady()
      })
      embed.addEventListener("play", () => setState("playing"))
      embed.addEventListener("pause", () => setState("paused"))
      embed.addEventListener("ended", () => setState("ended"))
    })
    .catch((error: Error) => {
      if (!destroyed) onLoadError(error)
    })

  const whenReady = (action: (player: TwitchEmbed) => void) => {
    if (ready && player && !destroyed) action(player)
  }

  return {
    supportsPlaybackRate: false,
    play: () => whenReady((p) => p.play()),
    pause: () => whenReady((p) => p.pause()),
    seekTo: (seconds) => whenReady((p) => p.seek(seconds)),
    setMuted: (value) => whenReady((p) => p.setMuted(value)),
    // The embed works in fractions; the rest of the app in percent.
    setVolume: (volume) => whenReady((p) => p.setVolume(volume / 100)),
    setPlaybackRate: () => {},
    read(): PlayerStatus {
      if (!ready || !player || destroyed) {
        return { ...INITIAL_PLAYER_STATUS, state: lastState, muted }
      }
      return {
        state: lastState,
        currentTime: player.getCurrentTime() || 0,
        muted: player.getMuted(),
        volume: Math.round(player.getVolume() * 100),
        playbackRate: 1,
      }
    },
    destroy() {
      destroyed = true
      player = null
      host.replaceChildren()
    },
  }
}
