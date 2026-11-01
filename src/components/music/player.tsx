import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { cn } from "cn"
import { AnimatePresence, domMax, LazyMotion, MotionConfig } from "motion/react"
import * as m from "motion/react-m"
import {
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  PlayIcon,
  XIcon,
  MusicalNotesIcon,
  PlaylistIcon,
} from "@/components/icons"
import { MusicArtwork } from "@/components/music/artwork"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSettings } from "@/stores/settings"
import { Button } from "@/components/ui/button"
import { musicApi } from "@/lib/musicdex/api"
import {
  FullscreenIcon,
  NextIcon,
  PauseIcon,
  PreviousIcon,
  ShuffleIcon,
} from "@/components/music/player/icons"
import { useMusicPlayer } from "@/stores/music-player"

type YTPlayer = {
  loadVideoById: (options: {
    videoId: string
    startSeconds?: number
    endSeconds?: number
  }) => void
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getVideoData: () => { video_id?: string }
  getIframe: () => HTMLIFrameElement
  setVolume: (volume: number) => void
  destroy: () => void
}
type YTEvent = { target: YTPlayer; data: number }
type YTGlobal = {
  Player: new (element: HTMLElement, options: object) => YTPlayer
}
declare global {
  interface Window {
    YT?: YTGlobal
    onYouTubeIframeAPIReady?: () => void
  }
}
let apiPromise: Promise<YTGlobal> | undefined
let trackedPlaybackId = -1
function loadYouTube(): Promise<YTGlobal> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    const timeout = window.setTimeout(() => {
      apiPromise = undefined
      document
        .querySelector('script[src="https://www.youtube.com/iframe_api"]')
        ?.remove()
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
      'script[src="https://www.youtube.com/iframe_api"]'
    )
    if (!script) {
      script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
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
const time = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, "0")}`

/** Shared by every part of the player so they travel as one surface. */
const PLAYER_TRANSITION = { type: "spring", duration: 0.45, bounce: 0 } as const

export function MusicPlayer() {
  const hasMusic = useMusicPlayer((s) => !!s.current)
  // This module is already a lazy chunk, so loading domMax here keeps Motion out
  // of the main bundle without leaving the bar hidden behind a second request.
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={PLAYER_TRANSITION}>
        <AnimatePresence>
          {hasMusic && <MusicPlayerBar key="player" />}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  )
}

function MusicPlayerBar() {
  const current = useMusicPlayer((s) => s.current)
  const playing = useMusicPlayer((s) => s.playing)
  const playbackId = useMusicPlayer((s) => s.playbackId)
  const volume = useMusicPlayer((s) => s.volume)
  const expanded = useMusicPlayer((s) => s.expanded)
  const queue = useMusicPlayer((s) => s.queue)
  const queueLength = useMusicPlayer((s) => s.queue.length - s.queuedCount)
  const radio = useMusicPlayer((s) => s.radio)
  const source = useMusicPlayer((s) => s.source)
  const shuffle = useMusicPlayer((s) => s.shuffle)
  const repeat = useMusicPlayer((s) => s.repeat)
  const english = useSettings((s) => s.useEnglishName)
  const host = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const expandButton = useRef<HTMLButtonElement>(null)
  const player = useRef<YTPlayer | null>(null)
  const loadedId = useRef(-1)
  const finishedId = useRef(-1)
  const ready = useRef(false)
  const switching = useRef(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  const [radioError, setRadioError] = useState<{
    source: NonNullable<typeof source>
    message: string
  } | null>(null)
  const [radioRetry, setRadioRetry] = useState(0)
  // Closing clears the store, but the last song stays visible as the bar leaves.
  const [shown, setShown] = useState(current)
  if (current && current !== shown) setShown(current)

  useEffect(() => {
    if (!current || !host.current) return
    let disposed = false
    const mount = document.createElement("div")
    host.current.appendChild(mount)
    loadYouTube()
      .then((yt) => {
        if (disposed) return
        player.current = new yt.Player(mount, {
          width: "100%",
          height: "100%",
          playerVars: {
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: YTEvent) => {
              if (disposed) return
              player.current = event.target
              ready.current = true
              event.target.getIframe().title = "Music video player"
              const state = useMusicPlayer.getState()
              if (!state.current) return
              const song = state.current
              loadedId.current = state.playbackId
              event.target.setVolume(state.volume)
              switching.current = true
              event.target.loadVideoById({
                videoId: song.video_id,
                startSeconds: Math.max(0, song.start || 0),
                ...(song.end > song.start ? { endSeconds: song.end } : {}),
              })
              if (!state.playing) event.target.pauseVideo()
            },
            onStateChange: (event: YTEvent) => {
              if (disposed) return
              const state = useMusicPlayer.getState()
              if (
                !state.current ||
                loadedId.current !== state.playbackId ||
                event.target.getVideoData()?.video_id !== state.current.video_id
              )
                return
              if (
                event.data === 0 &&
                !switching.current &&
                finishedId.current !== state.playbackId
              ) {
                finishedId.current = state.playbackId
                state.next(true)
              } else if (event.data === 1) {
                const start = Math.max(0, state.current.start || 0)
                const now = event.target.getCurrentTime()
                // YouTube may seek to a keyframe shortly before the requested start.
                if (
                  switching.current &&
                  (now < start - 10 ||
                    (state.current.end > start && now >= state.current.end))
                )
                  return
                setError("")
                const shouldRecord = state.playing || !switching.current
                if (switching.current && !state.playing)
                  event.target.pauseVideo()
                else if (!state.playing) state.setPlaying(true)
                switching.current = false
                if (shouldRecord && trackedPlaybackId !== state.playbackId) {
                  trackedPlaybackId = state.playbackId
                  void musicApi.trackSong(state.current.id).catch(() => {})
                }
              } else if (
                event.data === 2 &&
                state.playing &&
                !switching.current
              )
                state.setPlaying(false)
            },
            onError: (event: YTEvent) => {
              const state = useMusicPlayer.getState()
              const videoId = event.target.getVideoData()?.video_id
              if (
                disposed ||
                !state.current ||
                loadedId.current !== state.playbackId ||
                (videoId && videoId !== state.current.video_id)
              )
                return
              switching.current = false
              setError("This video cannot be played here.")
              state.pause()
            },
            onAutoplayBlocked: (event: YTEvent) => {
              const state = useMusicPlayer.getState()
              const videoId = event.target.getVideoData()?.video_id
              if (
                disposed ||
                !state.current ||
                loadedId.current !== state.playbackId ||
                (videoId && videoId !== state.current.video_id)
              )
                return
              switching.current = false
              setError("Playback was blocked. Press play to try again.")
              state.pause()
            },
          },
        })
      })
      .catch(() => {
        if (!disposed) setError("Could not load the YouTube player.")
      })
    return () => {
      disposed = true
      player.current?.destroy()
      player.current = null
      ready.current = false
      loadedId.current = -1
      mount.remove()
    }
    // The iframe is kept alive between songs and while expanding the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!current, attempt])

  useEffect(() => {
    const p = player.current
    if (
      !p ||
      !ready.current ||
      !current ||
      loadedId.current === playbackId ||
      !p.loadVideoById
    )
      return
    loadedId.current = playbackId
    finishedId.current = -1
    switching.current = true
    p.loadVideoById({
      videoId: current.video_id,
      startSeconds: Math.max(0, current.start || 0),
      ...(current.end > current.start ? { endSeconds: current.end } : {}),
    })
  }, [current, playbackId])
  useEffect(() => {
    if (ready.current && player.current?.playVideo) {
      if (playing) player.current.playVideo()
      else player.current.pauseVideo()
    }
  }, [playing])
  useEffect(() => {
    if (ready.current) player.current?.setVolume?.(volume)
  }, [volume])
  useEffect(() => {
    if (!radio || !source || queueLength >= 5 || radioError?.source === source)
      return
    const sourceId = source.id
    const controller = new AbortController()
    void musicApi
      .radio(sourceId, controller.signal)
      .then((result) => {
        const state = useMusicPlayer.getState()
        if (
          controller.signal.aborted ||
          !state.radio ||
          state.source !== source
        )
          return
        const existing = new Set([
          state.current?.id,
          ...state.queue.map((song) => song.id),
          ...state.history.map((song) => song.id),
        ])
        const songs = (result.content ?? []).filter((song) => {
          if (existing.has(song.id)) return false
          existing.add(song.id)
          return true
        })
        if (!songs.length) {
          setRadioError({
            source,
            message: "No more radio songs were returned.",
          })
          return
        }
        state.appendRadioSongs(songs)
        if (!state.playing && finishedId.current === state.playbackId)
          state.next()
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setRadioError({ source, message: "Could not load more radio songs." })
      })
    return () => controller.abort()
  }, [radio, source, queueLength, playbackId, radioError, radioRetry])
  useEffect(() => {
    if (!current) return
    const timer = window.setInterval(() => {
      const p = player.current
      if (
        !ready.current ||
        switching.current ||
        loadedId.current !== playbackId ||
        useMusicPlayer.getState().playbackId !== playbackId ||
        !p?.getCurrentTime
      )
        return
      const now = p.getCurrentTime() || 0
      const start = Math.max(0, current.start || 0)
      const end = current.end > start ? current.end : p.getDuration() || 0
      setPosition(Math.max(0, now - start))
      setDuration(Math.max(0, end - start))
      if (
        playing &&
        end > start &&
        now >= end - 0.1 &&
        finishedId.current !== playbackId
      ) {
        finishedId.current = playbackId
        useMusicPlayer.getState().next(true)
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [current, playbackId, playing])
  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return
    if (typeof MediaMetadata !== "undefined")
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.name,
        artist: current.channel?.name,
        artwork: current.art ? [{ src: current.art }] : [],
      })
    const handlers = {
      play: () => {
        const state = useMusicPlayer.getState()
        if (finishedId.current === state.playbackId) state.restart()
        else state.play()
      },
      pause: () => useMusicPlayer.getState().pause(),
      previoustrack: () => useMusicPlayer.getState().previous(),
      nexttrack: () => useMusicPlayer.getState().next(),
    }
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(
          action as MediaSessionAction,
          handler
        )
      } catch {
        /* Browser does not support this action. */
      }
    }
    return () => {
      for (const action of Object.keys(handlers)) {
        try {
          navigator.mediaSession.setActionHandler(
            action as MediaSessionAction,
            null
          )
        } catch {
          /* Unsupported action. */
        }
      }
    }
  }, [current])
  useEffect(() => {
    if (!expanded || !overlay.current) return
    const dialog = overlay.current
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), summary, iframe, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0)
    expandButton.current?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        if (document.fullscreenElement)
          void document.exitFullscreen().catch(() => {})
        useMusicPlayer.getState().setExpanded(false)
      } else if (event.key === "Tab") {
        const items = focusable()
        if (!items.length) {
          event.preventDefault()
          dialog.focus()
          return
        }
        const index = items.indexOf(document.activeElement as HTMLElement)
        if (event.shiftKey && index <= 0) {
          event.preventDefault()
          items[items.length - 1].focus()
        } else if (
          !event.shiftKey &&
          (index < 0 || index === items.length - 1)
        ) {
          event.preventDefault()
          items[0].focus()
        }
      }
    }
    const focusin = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node))
        (focusable()[0] ?? dialog).focus()
    }
    document.addEventListener("keydown", keydown)
    document.addEventListener("focusin", focusin)
    return () => {
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("focusin", focusin)
      document.body.style.overflow = oldOverflow
      if (document.fullscreenElement === dialog)
        void document.exitFullscreen().catch(() => {})
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true })
    }
  }, [expanded])
  if (!shown) return null
  const actions = useMusicPlayer.getState()
  const artist = (english && shown.channel?.english_name) || shown.channel?.name
  const artwork =
    shown.art || `https://i.ytimg.com/vi/${shown.video_id}/hqdefault.jpg`
  // layoutDependency keeps the seek timer's re-renders from measuring layout.
  return (
    <m.div
      ref={overlay}
      layoutRoot
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      role={expanded ? "dialog" : "region"}
      aria-modal={expanded ? true : undefined}
      aria-label={expanded ? "Music player" : "Now playing"}
      tabIndex={expanded ? -1 : undefined}
      className={cn(
        "music-player",
        expanded ? "music-player-expanded" : "music-player-compact"
      )}
    >
      <m.div
        layout
        layoutDependency={expanded}
        aria-hidden="true"
        className="music-player-surface"
      />
      {expanded && (
        <m.img
          src={artwork}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          className="music-player-atmosphere"
        />
      )}
      <div
        className={expanded ? "music-listening-layout" : "music-dock-layout"}
      >
        <div className="music-player-video">
          <m.div
            ref={host}
            layout
            layoutDependency={expanded}
            style={{ borderRadius: 12 }}
            className="music-youtube-host [&_iframe]:h-full [&_iframe]:w-full"
          />
        </div>
        <div className="music-player-track">
          {!expanded && (
            <m.div
              key={shown.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="music-player-thumb"
            >
              <MusicArtwork src={artwork} seed={shown.id} />
            </m.div>
          )}
          <m.div
            layout="position"
            layoutDependency={expanded}
            className="min-w-0"
          >
            <m.div
              key={shown.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="music-player-song">{shown.name}</div>
              <Link
                to={`/channel/${encodeURIComponent(shown.channel_id)}/music`}
                onClick={() => actions.setExpanded(false)}
                className="music-player-artist"
              >
                {artist || "Unknown artist"}
              </Link>
            </m.div>
            {expanded && source && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                From {source.title}
              </p>
            )}
            {error && (
              <div role="alert" className="text-xs text-destructive">
                {error}{" "}
                <button
                  className="underline"
                  onClick={() => {
                    setError("")
                    setAttempt((value) => value + 1)
                    useMusicPlayer.getState().play()
                  }}
                >
                  Retry
                </button>{" "}
                <button
                  className="underline"
                  onClick={() => useMusicPlayer.getState().next()}
                >
                  Skip
                </button>
              </div>
            )}
            {radioError && radioError.source === source && (
              <div role="status" className="text-xs text-destructive">
                {radioError.message}{" "}
                <button
                  className="underline"
                  onClick={() => {
                    setRadioError(null)
                    setRadioRetry((value) => value + 1)
                  }}
                >
                  Retry radio
                </button>
              </div>
            )}
          </m.div>
          {playing && (
            <span
              className="music-equalizer ml-3 hidden shrink-0 lg:inline-flex"
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        <m.div
          layout
          layoutDependency={expanded}
          className="music-player-transport"
        >
          <Button
            className={cn("music-extra-control", shuffle && "text-brand")}
            variant="ghost"
            size="icon-sm"
            aria-label="Shuffle"
            title="Shuffle"
            aria-pressed={shuffle}
            onClick={actions.toggleShuffle}
          >
            <ShuffleIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous song"
            title="Previous song"
            onClick={actions.previous}
          >
            <PreviousIcon />
          </Button>
          <Button
            className="music-player-toggle"
            size="icon-lg"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => {
              if (!playing && finishedId.current === playbackId)
                actions.restart()
              else actions.toggle()
            }}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next song"
            title="Next song"
            onClick={() => actions.next()}
          >
            <NextIcon />
          </Button>
          <Button
            className={cn(
              "music-extra-control",
              repeat !== "none" && "text-brand"
            )}
            variant="ghost"
            size="icon-sm"
            aria-label={`Repeat: ${repeat}`}
            title={`Repeat: ${repeat}`}
            onClick={actions.toggleRepeat}
          >
            {repeat === "one" ? (
              <ArrowCounterClockwiseIcon />
            ) : (
              <ArrowClockwiseIcon />
            )}
            {repeat === "one" && <span className="text-[9px]">1</span>}
          </Button>
        </m.div>
        <m.div
          layout="position"
          layoutDependency={expanded}
          className="music-player-seek"
        >
          <span>{time(position)}</span>
          <input
            aria-label="Seek"
            type="range"
            min={0}
            max={duration || 1}
            step={1}
            value={Math.min(position, duration || 1)}
            onChange={(event) => {
              const value = Number(event.target.value)
              setPosition(value)
              player.current?.seekTo(
                Math.max(0, shown.start || 0) + value,
                true
              )
            }}
          />
          <span>{time(duration)}</span>
        </m.div>
        <m.div
          layout="position"
          layoutDependency={expanded}
          className="music-player-tools"
        >
          <label className="music-player-volume">
            <span className="sr-only">Volume</span>
            <MusicalNotesIcon className="size-4 text-muted-foreground" />
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) =>
                actions.setVolume(Number(event.target.value))
              }
            />
          </label>
          {!expanded && (
            <Popover>
              <PopoverTrigger
                aria-label={`Up next: ${queue.length} songs`}
                title="Up next"
                render={
                  <Button
                    className="music-queue-trigger"
                    variant="ghost"
                    size="icon-sm"
                  />
                }
              >
                <PlaylistIcon />
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-[min(360px,calc(100vw-2rem))] p-0"
              >
                <MusicQueue />
              </PopoverContent>
            </Popover>
          )}
          {expanded && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Enter fullscreen"
              title="Enter fullscreen"
              onClick={() => {
                if (overlay.current?.requestFullscreen)
                  void overlay.current.requestFullscreen().catch(() => {})
              }}
            >
              <FullscreenIcon />
            </Button>
          )}
          <Button
            ref={expandButton}
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Collapse player" : "Expand player"}
            title={expanded ? "Back to browsing" : "Open listening view"}
            onClick={() => actions.setExpanded(!expanded)}
          >
            {expanded ? <CaretDownIcon /> : <CaretUpIcon />}
          </Button>
          <Button
            className="music-player-close"
            variant="ghost"
            size="icon-sm"
            aria-label="Close player"
            title="Close player"
            onClick={actions.close}
          >
            <XIcon />
          </Button>
        </m.div>
        {expanded && (
          <m.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            className="music-player-up-next"
          >
            <MusicQueue />
          </m.aside>
        )}
      </div>
      {expanded && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="music-listening-heading"
        >
          <span className="music-wordmark">
            <MusicalNotesIcon className="size-4 text-brand" />
            musicdex.
          </span>
          <p className="music-eyebrow">
            {radio ? "ON AIR / ARTIST RADIO" : "NOW PLAYING"}
          </p>
        </m.div>
      )}
    </m.div>
  )
}

function MusicQueue() {
  const queue = useMusicPlayer((s) => s.queue)
  const english = useSettings((s) => s.useEnglishName)
  return (
    <div className="music-queue-panel">
      <div className="music-queue-heading">
        <div>
          <h2>
            Up next<span>{queue.length}</span>
          </h2>
        </div>
        {queue.length > 0 && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => useMusicPlayer.getState().clearQueue()}
          >
            Clear
          </Button>
        )}
      </div>
      {queue.length ? (
        <ol className="music-queue-list">
          {queue.map((song, index) => (
            <li key={`${song.id}-${index}`} className="group">
              <span className="music-queue-index">{index + 1}</span>
              <div className="music-queue-art">
                <MusicArtwork
                  src={
                    song.art ||
                    `https://i.ytimg.com/vi/${song.video_id}/mqdefault.jpg`
                  }
                  seed={song.id}
                />
              </div>
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  for (let i = 0; i <= index; i++)
                    useMusicPlayer.getState().next()
                }}
              >
                <span className="block truncate text-xs font-medium">
                  {song.name}
                </span>
                <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                  {(english && song.channel?.english_name) ||
                    song.channel?.name}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${song.name} from queue`}
                onClick={() => useMusicPlayer.getState().removeFromQueue(index)}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="music-queue-empty">
          <PlaylistIcon className="size-7" />
          <p>A little quiet in here.</p>
          <span>Add a song from any collection.</span>
        </div>
      )}
    </div>
  )
}
