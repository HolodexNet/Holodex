import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { cn } from "cn"
import { toast } from "sonner"

import {
  ArrowsOutLineHorizontalIcon,
  CrosshairSimpleIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import {
  clamp,
  MAX_PX_PER_SECOND,
  snapTime,
  tickStep,
  ticksBetween,
} from "@/lib/video-edit/timeline"
import { MIN_SONG_SECONDS, songCovers } from "@/lib/video-edit/songs"
import { formatTimecode } from "@/lib/video-edit/timecode"
import { useSongEditor } from "@/stores/song-editor"
import { focusSongName, SongForm } from "./song-form"
import {
  usePlayheadSecond,
  useSongShortcuts,
  useSongWorkspace,
} from "./workspace"

/** Until the player knows better, room for the longest stream we expect to see. */
const FALLBACK_DURATION = 4 * 3600
/** How close a dragged edge has to get to something before it clicks onto it. */
const SNAP_PX = 8
/** Movement below this is a click that wobbled, not a drag. */
const DRAG_THRESHOLD_PX = 4
/** After scrolling by hand, how long the view stops chasing the playhead. */
const FOLLOW_PAUSE_MS = 3000

type DragKind = "move" | "start" | "end" | "create"

interface Drag {
  kind: DragKind
  id: string | null
  pointerId: number
  originX: number
  originTime: number
  start: number
  end: number
  moved: boolean
  targets: number[]
}

interface Preview {
  id: string | null
  start: number
  end: number
  edge: "start" | "end"
}

function PlayheadClock() {
  const { clock, duration } = useSongWorkspace()
  const second = usePlayheadSecond(clock)
  return (
    <span className="text-xs text-muted-foreground tabular-nums">
      {formatTimecode(second)}
      {duration > 0 && ` / ${formatTimecode(duration)}`}
    </span>
  )
}

/**
 * The whole stream as one long strip, with songs as blocks you can slide and
 * stretch, and what the comments mention pinned above them. Dragging an edge plays
 * the result as soon as it's let go, so the ear can confirm what the eye picked.
 */
function SongTimeline({ className }: { className?: string }) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const { clock, songs, rows, hints } = workspace
  const selectedId = useSongEditor((state) => state.selectedId)
  const status = useSyncExternalStore(clock.subscribeStatus, clock.getStatus)
  const scroller = useRef<HTMLDivElement>(null)
  const lane = useRef<HTMLDivElement>(null)
  const playhead = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const pendingScroll = useRef<number | null>(null)
  const lastManualScroll = useRef(0)
  const lastScrubSeek = useRef(0)
  const scrubbing = useRef<number | null>(null)
  const [viewport, setViewport] = useState({ left: 0, width: 0 })
  const [zoom, setZoom] = useState<number | null>(null)
  const [follow, setFollow] = useState(true)
  const [preview, setPreview] = useState<Preview | null>(null)

  const lastKnown = Math.max(
    0,
    ...songs.map((song) => song.end),
    ...hints.map((hint) => hint.start)
  )
  const duration = Math.max(
    workspace.duration || FALLBACK_DURATION,
    lastKnown + 60
  )
  const fit = viewport.width ? viewport.width / duration : 0.1
  const scale = clamp(zoom ?? fit, fit, MAX_PX_PER_SECOND)
  const width = duration * scale
  const windowStart = (viewport.left - viewport.width) / scale
  const windowEnd = (viewport.left + viewport.width * 2) / scale
  const step = tickStep(scale)
  const ticks = ticksBetween(
    Math.max(0, windowStart),
    Math.min(duration, windowEnd),
    step
  )

  useEffect(() => {
    const element = scroller.current
    if (!element) return
    const measure = () =>
      setViewport({ left: element.scrollLeft, width: element.clientWidth })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Keeps the same moment under the pointer through a zoom.
  useLayoutEffect(() => {
    const element = scroller.current
    if (element && pendingScroll.current !== null) {
      element.scrollLeft = pendingScroll.current
      pendingScroll.current = null
    }
  }, [scale])

  const zoomAround = (next: number, anchorTime: number, anchorX: number) => {
    const target = clamp(next, fit, MAX_PX_PER_SECOND)
    pendingScroll.current = Math.max(0, anchorTime * target - anchorX)
    setZoom(target)
  }
  const zoomBy = (factor: number) => {
    const element = scroller.current
    if (!element) return
    zoomAround(scale * factor, clock.now(), element.clientWidth / 2)
  }
  const zoomToSong = (start: number, end: number) => {
    const element = scroller.current
    if (!element) return
    const target = clamp(
      (element.clientWidth * 0.7) / Math.max(end - start, 1),
      fit,
      MAX_PX_PER_SECOND
    )
    pendingScroll.current = Math.max(
      0,
      ((start + end) / 2) * target - element.clientWidth / 2
    )
    setZoom(target)
  }

  // The playhead moves every frame, so it goes straight to the DOM, not via React.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const time = scrubbing.current ?? clock.now()
      const x = time * scale
      if (playhead.current)
        playhead.current.style.transform = `translateX(${x}px)`
      const element = scroller.current
      if (
        element &&
        follow &&
        clock.getStatus().state === "playing" &&
        Date.now() - lastManualScroll.current > FOLLOW_PAUSE_MS &&
        (x < element.scrollLeft ||
          x > element.scrollLeft + element.clientWidth * 0.9)
      )
        element.scrollLeft = x - element.clientWidth * 0.1
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [clock, scale, follow])

  const onWheel = useEffectEvent((event: WheelEvent) => {
    const element = scroller.current
    if (!element) return
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const x = event.clientX - element.getBoundingClientRect().left
      zoomAround(
        scale * Math.exp(-event.deltaY * 0.002),
        (element.scrollLeft + x) / scale,
        x
      )
    } else if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      // Nothing here scrolls vertically, so a plain wheel may as well pan.
      event.preventDefault()
      element.scrollLeft += event.deltaY
      lastManualScroll.current = Date.now()
    }
  })

  useEffect(() => {
    const element = scroller.current
    if (!element) return
    // Passive by default as a React prop, which couldn't stop the page zooming.
    const listener = (event: WheelEvent) => onWheel(event)
    element.addEventListener("wheel", listener, { passive: false })
    return () => element.removeEventListener("wheel", listener)
  }, [])

  const timeAt = (clientX: number) => {
    const element = scroller.current
    if (!element) return 0
    return clamp(
      (clientX - element.getBoundingClientRect().left + element.scrollLeft) /
        scale,
      0,
      duration
    )
  }

  const beginDrag = (
    event: ReactPointerEvent<HTMLElement>,
    kind: DragKind,
    song: { id: string; start: number; end: number } | null
  ) => {
    if (event.button !== 0 || !lane.current) return
    event.stopPropagation()
    const time = timeAt(event.clientX)
    drag.current = {
      kind,
      id: song?.id ?? null,
      pointerId: event.pointerId,
      originX: event.clientX,
      originTime: time,
      start: song?.start ?? time,
      end: song?.end ?? time,
      moved: false,
      targets: [
        clock.now(),
        ...hints.map((hint) => hint.start),
        ...songs
          .filter((other) => other.id !== song?.id)
          .flatMap((other) => [other.start, other.end]),
      ],
    }
  }

  const onLanePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = drag.current
    if (!active || event.pointerId !== active.pointerId) return
    // Let go somewhere we couldn't see it, before the drag had really begun.
    if (event.buttons === 0) {
      drag.current = null
      setPreview(null)
      return
    }
    if (
      !active.moved &&
      Math.abs(event.clientX - active.originX) < DRAG_THRESHOLD_PX
    )
      return
    if (!active.moved) {
      // Only now: capturing any sooner would retarget the click that a press
      // without a drag turns into, and with it the double-click to zoom.
      active.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    const time = timeAt(event.clientX)
    const snap = (value: number) =>
      event.altKey ? value : snapTime(value, active.targets, SNAP_PX / scale)
    const edgeScroll = scroller.current
    if (edgeScroll) {
      const rect = edgeScroll.getBoundingClientRect()
      if (event.clientX < rect.left + 24) edgeScroll.scrollLeft -= 16
      else if (event.clientX > rect.right - 24) edgeScroll.scrollLeft += 16
    }
    if (active.kind === "move") {
      const length = active.end - active.start
      const start = clamp(
        snap(active.start + time - active.originTime),
        0,
        duration - length
      )
      setPreview({ id: active.id, start, end: start + length, edge: "start" })
    } else if (active.kind === "start") {
      setPreview({
        id: active.id,
        start: clamp(snap(time), 0, active.end - MIN_SONG_SECONDS),
        end: active.end,
        edge: "start",
      })
    } else if (active.kind === "end") {
      setPreview({
        id: active.id,
        start: active.start,
        end: clamp(snap(time), active.start + MIN_SONG_SECONDS, duration),
        edge: "end",
      })
    } else {
      const moving = snap(time)
      setPreview({
        id: null,
        start: Math.min(active.originTime, moving),
        end: Math.max(active.originTime, moving),
        edge: moving < active.originTime ? "start" : "end",
      })
    }
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = drag.current
    if (!active || event.pointerId !== active.pointerId) return
    drag.current = null
    const shown = preview
    setPreview(null)
    const store = useSongEditor.getState()
    if (!active.moved || !shown) {
      // A plain click: picks a song, or lets go of it on empty space.
      store.select(active.id)
      return
    }
    const start = Math.round(shown.start)
    const end = Math.round(shown.end)
    if (active.kind === "create") {
      if (end - start >= MIN_SONG_SECONDS) {
        workspace.addAt(start, { end, endSource: "user" })
        clock.hearFrom(start)
      }
    } else if (active.id) {
      store.select(active.id)
      store.update(active.id, {
        start,
        end,
        ...(active.kind === "start" ? {} : { endSource: "user" as const }),
      })
      if (active.kind === "end") clock.hearUntil(end, 4)
      else clock.hearFrom(start)
    }
  }

  // Escape abandons a drag, so that a slip of the mouse costs nothing.
  const dragging = preview !== null
  useEffect(() => {
    if (!dragging) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.stopPropagation()
      drag.current = null
      setPreview(null)
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [dragging])

  const scrub = (event: ReactPointerEvent<HTMLDivElement>, final: boolean) => {
    const time = timeAt(event.clientX)
    scrubbing.current = final ? null : time
    if (final || event.timeStamp - lastScrubSeek.current > 200) {
      lastScrubSeek.current = event.timeStamp
      clock.seek(time)
    }
  }

  const visible = (start: number, end: number) =>
    end >= windowStart && start <= windowEnd

  return (
    <div className={cn("flex min-h-56 flex-col bg-card", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("videoEdit.keys.toggle")}
          title={t("videoEdit.keys.toggle")}
          onClick={() => clock.toggle()}
        >
          {status.state === "playing" ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <PlayheadClock />
        <span className="flex-1" />
        {workspace.canAdd && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              workspace.addAt(clock.now())
              focusSongName()
            }}
          >
            <PlusIcon data-icon="inline-start" />
            {t("videoEdit.songs.add")}
          </Button>
        )}
        <Button
          variant={follow ? "secondary" : "ghost"}
          size="icon-sm"
          aria-pressed={follow}
          aria-label={t("videoEdit.timeline.follow")}
          title={t("videoEdit.timeline.follow")}
          onClick={() => setFollow(!follow)}
        >
          <CrosshairSimpleIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("videoEdit.timeline.zoomOut")}
          title={t("videoEdit.timeline.zoomOut")}
          onClick={() => zoomBy(0.6)}
        >
          <MagnifyingGlassMinusIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("videoEdit.timeline.zoomIn")}
          title={t("videoEdit.timeline.zoomIn")}
          onClick={() => zoomBy(1.6)}
        >
          <MagnifyingGlassPlusIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("videoEdit.timeline.fit")}
          title={t("videoEdit.timeline.fit")}
          onClick={() => setZoom(null)}
        >
          <ArrowsOutLineHorizontalIcon />
        </Button>
      </div>
      <div
        ref={scroller}
        className="relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden"
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget
          setViewport({ left: scrollLeft, width: clientWidth })
          // Scrollbars count as scrolling by hand, but not while following.
          if (clock.getStatus().state !== "playing")
            lastManualScroll.current = Date.now()
        }}
      >
        <div className="relative h-full min-h-44" style={{ width }}>
          {/* Time ruler: click or drag to move through the video. */}
          <div
            className="absolute inset-x-0 top-0 h-6 cursor-ew-resize touch-none border-b bg-muted/40 select-none"
            onPointerDown={(event) => {
              if (event.button !== 0) return
              event.currentTarget.setPointerCapture(event.pointerId)
              scrub(event, false)
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                scrub(event, false)
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                scrub(event, true)
            }}
          >
            {ticks.map((time) => (
              <span
                key={time}
                className="pointer-events-none absolute top-0 flex h-full items-center border-l pl-1 text-[0.65rem] text-muted-foreground tabular-nums"
                style={{ left: time * scale }}
              >
                {formatTimecode(time)}
              </span>
            ))}
          </div>

          {/* What the comments mention, pinned where it happens. */}
          <div className="absolute inset-x-0 top-6 h-7 border-b">
            {hints
              .filter((hint) => visible(hint.start, hint.start))
              .map((hint) => {
                const covered = songCovers(songs, hint.start)
                return (
                  <button
                    key={hint.start}
                    type="button"
                    title={`${formatTimecode(hint.start)} ${hint.text}`}
                    aria-label={`${formatTimecode(hint.start)} ${hint.text}`}
                    className={cn(
                      "group/pin absolute top-1 flex h-5 -translate-x-1 cursor-pointer items-center gap-1 outline-none",
                      covered && "opacity-40"
                    )}
                    style={{ left: hint.start * scale }}
                    onClick={() => clock.seek(hint.start)}
                    onDoubleClick={() => {
                      if (workspace.canAdd && !covered) workspace.addHint(hint)
                    }}
                  >
                    <span className="size-2 rotate-45 rounded-[2px] bg-complement group-hover/pin:scale-125 group-focus-visible/pin:ring-2 group-focus-visible/pin:ring-ring" />
                    {scale > 0.5 && (
                      <span className="max-w-32 truncate text-[0.65rem] text-muted-foreground">
                        {hint.title}
                      </span>
                    )}
                  </button>
                )
              })}
          </div>

          {/* The songs. Drag on empty space to draw a new one. */}
          <div
            ref={lane}
            className="absolute inset-x-0 top-[3.25rem] bottom-0 touch-pan-x select-none"
            onPointerDown={(event) => {
              if (workspace.canAdd) beginDrag(event, "create", null)
              else useSongEditor.getState().select(null)
            }}
            onPointerMove={onLanePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={() => {
              drag.current = null
              setPreview(null)
            }}
          >
            {rows
              .filter(
                (row) =>
                  row.state !== "removed" &&
                  visible(row.song.start, row.song.end)
              )
              .map(({ song, state }) => {
                const shown = preview?.id === song.id ? preview : song
                const blockWidth = (shown.end - shown.start) * scale
                const editable = workspace.canEdit(song)
                const overlapping = songs.some(
                  (other) =>
                    other.id !== song.id &&
                    other.start < song.end &&
                    song.start < other.end
                )
                return (
                  <div
                    key={song.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={song.id === selectedId}
                    aria-label={`${song.name || t("videoEdit.songs.untitled")}, ${formatTimecode(song.start)} – ${formatTimecode(song.end)}`}
                    className={cn(
                      "group/block absolute inset-y-2 flex items-center gap-1.5 overflow-hidden rounded-md border text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      editable
                        ? "cursor-grab active:cursor-grabbing"
                        : "cursor-pointer",
                      !editable
                        ? "border-border bg-muted text-muted-foreground"
                        : state === "saved"
                          ? "border-complement/60 bg-complement-soft/60"
                          : "border-primary bg-primary/20",
                      state === "new" && "border-dashed",
                      song.id === selectedId && "ring-2 ring-primary",
                      overlapping && "ring-2 ring-destructive"
                    )}
                    style={{
                      left: shown.start * scale,
                      width: Math.max(blockWidth, 3),
                    }}
                    onPointerDown={(event) => {
                      if (editable) beginDrag(event, "move", song)
                      else {
                        event.stopPropagation()
                        useSongEditor.getState().select(song.id)
                      }
                    }}
                    onDoubleClick={() => {
                      zoomToSong(song.start, song.end)
                      clock.seek(song.start)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        event.stopPropagation()
                        workspace.openSong(song.id)
                      }
                    }}
                  >
                    {blockWidth >= 44 && song.art && (
                      <img
                        src={song.art}
                        alt=""
                        draggable={false}
                        referrerPolicy="no-referrer"
                        className="ml-1 size-7 shrink-0 rounded object-cover"
                      />
                    )}
                    {blockWidth >= 20 && (
                      <span className="pointer-events-none min-w-0 flex-1 truncate px-1.5">
                        {song.name || t("videoEdit.songs.untitled")}
                      </span>
                    )}
                    {editable && (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-2 cursor-ew-resize touch-none bg-foreground/0 group-hover/block:bg-foreground/15 pointer-coarse:w-5"
                          onPointerDown={(event) =>
                            beginDrag(event, "start", song)
                          }
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 right-0 w-2 cursor-ew-resize touch-none bg-foreground/0 group-hover/block:bg-foreground/15 pointer-coarse:w-5"
                          onPointerDown={(event) =>
                            beginDrag(event, "end", song)
                          }
                        />
                      </>
                    )}
                  </div>
                )
              })}
            {preview && preview.id === null && (
              <div
                className="pointer-events-none absolute inset-y-2 rounded-md border border-dashed border-primary bg-primary/15"
                style={{
                  left: preview.start * scale,
                  width: (preview.end - preview.start) * scale,
                }}
              />
            )}
            {preview && (
              <span
                className="pointer-events-none absolute -top-5 z-10 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[0.65rem] text-background tabular-nums"
                style={{
                  left:
                    (preview.edge === "end" ? preview.end : preview.start) *
                    scale,
                }}
              >
                {formatTimecode(
                  preview.edge === "end" ? preview.end : preview.start
                )}
              </span>
            )}
          </div>

          <div
            ref={playhead}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-primary will-change-transform"
          />
        </div>
      </div>
    </div>
  )
}

/** Beside the player: the song you've picked, or what the comments suggest next. */
function Inspector({ className }: { className?: string }) {
  const { t, tc } = useT()
  const workspace = useSongWorkspace()
  const { selected, rows, hints, clock, songs, sources, canAdd } = workspace
  const second = usePlayheadSecond(clock)
  const row = rows.find((item) => item.song.id === selected?.id)

  if (selected)
    return (
      <div className={cn("overflow-y-auto", className)}>
        <SongForm
          song={selected}
          removed={row?.state === "removed"}
          doneLabel={t("videoEdit.songs.done")}
          onDone={() => useSongEditor.getState().select(null)}
        />
      </div>
    )

  // Roughly where the viewer is, with a little context behind them.
  const upcoming = hints
    .filter((hint) => hint.start >= second - 60)
    .slice(0, 40)
  const best = sources[0]
  const remaining =
    best?.entries.filter(
      (entry) => entry.kind === "song" && !songCovers(songs, entry.start)
    ).length ?? 0
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex flex-wrap items-center gap-2 p-3">
        <h2 className="text-sm font-semibold">
          {t("videoEdit.timeline.nothingSelected")}
        </h2>
        <span className="flex-1" />
        {canAdd && best && remaining > 0 && (
          <Button
            size="sm"
            onClick={() => {
              const added = workspace.addAllEntries(best)
              if (added) toast.success(tc("videoEdit.songs.addedMany", added))
            }}
          >
            <PlusIcon data-icon="inline-start" />
            {tc("videoEdit.songs.addAll", remaining)}
          </Button>
        )}
      </div>
      {upcoming.length ? (
        <ul className="grid min-h-0 flex-1 content-start gap-px overflow-y-auto px-2 pb-3">
          {upcoming.map((hint) => {
            const covered = songCovers(songs, hint.start)
            return (
              <li
                key={hint.start}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-1.5 py-0.5 hover:bg-muted/60",
                  covered && "opacity-50"
                )}
              >
                <button
                  type="button"
                  className="shrink-0 cursor-pointer text-xs text-complement tabular-nums outline-none hover:underline focus-visible:underline"
                  onClick={() => clock.hearFrom(hint.start)}
                >
                  {formatTimecode(hint.start)}
                </button>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {hint.text}
                </span>
                {canAdd && !covered && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("videoEdit.songs.addOne", {
                      name: hint.title,
                    })}
                    title={t("videoEdit.songs.addOne", { name: hint.title })}
                    onClick={() => workspace.addHint(hint)}
                  >
                    <PlusIcon />
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="px-3 pb-3 text-sm text-muted-foreground">
          {canAdd ? t("videoEdit.timeline.howTo") : t("videoEdit.songs.none")}
        </p>
      )}
    </div>
  )
}

/**
 * Sees the stream all at once, which makes gaps, overlaps and mistimed songs
 * obvious at a glance. Best for tidying up what's already there.
 */
export function TimelineApproach() {
  useSongShortcuts()
  return (
    <>
      <SongTimeline className="border-t lg:[grid-area:timeline]" />
      <Inspector className="border-t lg:border-t-0 lg:border-l lg:[grid-area:inspector]" />
    </>
  )
}
