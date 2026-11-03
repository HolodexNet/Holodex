/** The parts of YouTube's iframe player API this app calls. */
export interface YTPlayer {
  loadVideoById: (
    options:
      string | { videoId: string; startSeconds?: number; endSeconds?: number }
  ) => void
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getVideoData: () => { video_id?: string }
  getIframe: () => HTMLIFrameElement
  getPlayerState: () => number
  getPlaybackRate: () => number
  setPlaybackRate: (rate: number) => void
  getVolume: () => number
  setVolume: (volume: number) => void
  isMuted: () => boolean
  mute: () => void
  unMute: () => void
  destroy: () => void
}

export interface YTEvent {
  target: YTPlayer
  data: number
}

export interface YTGlobal {
  Player: new (element: HTMLElement, options: object) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTGlobal
    onYouTubeIframeAPIReady?: () => void
  }
}

const API_SCRIPT = "https://www.youtube.com/iframe_api"

let apiPromise: Promise<YTGlobal> | undefined

export function loadYouTube(): Promise<YTGlobal> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    const timeout = window.setTimeout(() => {
      apiPromise = undefined
      document.querySelector(`script[src="${API_SCRIPT}"]`)?.remove()
      reject(new Error("Timed out loading YouTube"))
    }, 15000)
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) {
        window.clearTimeout(timeout)
        resolve(window.YT)
      }
    }
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${API_SCRIPT}"]`
    )
    if (!script) {
      script = document.createElement("script")
      script.src = API_SCRIPT
      document.head.appendChild(script)
    }
    script.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeout)
        script?.remove()
        apiPromise = undefined
        reject(new Error("Could not load YouTube player"))
      },
      { once: true }
    )
  })
  return apiPromise
}
