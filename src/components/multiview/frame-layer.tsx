import { memo, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "cn"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"

import { frameOrder } from "@/lib/multiview/cells"
import { GRID_SIZE } from "@/lib/multiview/grid"
import type { Cell, CellId, MultiviewVideo, Rect } from "@/lib/multiview/types"
import { createTwitchPlayer } from "@/lib/player/twitch-player"
import type { PlayerController, PlayerState } from "@/lib/player/types"
import { createYoutubePlayer } from "@/lib/player/youtube-player"
import { useT } from "@/lib/i18n"
import { youtubeLang } from "@/lib/multiview/stream"
import { useMultiview } from "@/stores/multiview"
import { playbackHub } from "@/stores/multiview-playback"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { useTlSubtitles } from "@/stores/tldex"
import { useSettings } from "@/stores/settings"
import { Button } from "@/components/ui/button"
import { ArrowClockwiseIcon, WarningIcon } from "@/components/icons"
import { cellMotion, pruneCellMotion, useCellFlip } from "./cell-motion"
import { ChatFrame } from "./chat-frame"
import { ControlFrame } from "./control-frame"
import { EmptyCell } from "./empty-cell"
import { useEditGesture, useEffectiveRect } from "./gesture-store"

const pct = (units: number) => `${(units / GRID_SIZE) * 100}%`

export const rectStyle = (rect: Rect) => ({
  left: pct(rect.x),
  top: pct(rect.y),
  width: pct(rect.w),
  height: pct(rect.h),
})

/**
 * Every player lives here, in an order that never changes, for the whole time it
 * is on the grid. Moving, swapping and resizing only change a frame's style, and
 * Edit mode just stacks another layer above this one, so none of them can reload
 * an iframe or interrupt what it is playing.
 */
export function FrameLayer() {
  const cells = useMultiview((s) => s.cells)
  const editing = useMultiview((s) => s.editing)
  const ordered = useMemo(() => frameOrder(cells), [cells])

  useEffect(() => {
    pruneCellMotion(new Set(cells.map((cell) => cell.id)))
  }, [cells])

  return (
    <div
      className={cn("absolute inset-0", editing && "pointer-events-none")}
      // Keeps keyboard focus from wandering into players during an edit.
      inert={editing}
    >
      <AnimatePresence initial={false}>
        {ordered.map((cell) => (
          <Frame key={cell.id} cell={cell} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const Frame = memo(function Frame({ cell }: { cell: Cell }) {
  const reducedMotion = useReducedMotion() ?? false
  const rect = useEffectiveRect(cell.id, cell.rect)
  const motion = useCellFlip(cell.id, rect, reducedMotion)
  const lifted = useEditGesture(
    (s) => s.active?.kind === "move" && s.active.cellId === cell.id
  )

  return (
    <m.div
      data-cell-frame={cell.id}
      className="absolute p-px"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      style={{
        ...rectStyle(rect),
        x: motion.x,
        y: motion.y,
        scaleX: motion.scaleX,
        scaleY: motion.scaleY,
        originX: 0,
        originY: 0,
        zIndex: lifted ? 10 : undefined,
      }}
    >
      <div className="relative size-full overflow-hidden rounded-[3px] bg-card">
        <CellBody cell={cell} />
      </div>
    </m.div>
  )
})

function CellBody({ cell }: { cell: Cell }) {
  const reloads = useMultiviewUi((s) => s.reloads[cell.id] ?? 0)
  if (cell.content?.type === "video") {
    return (
      <VideoFrame
        // A different stream, or an explicit reload, gets a fresh player.
        key={`${cell.content.video.id}:${reloads}`}
        cellId={cell.id}
        video={cell.content.video}
      />
    )
  }
  if (cell.content?.type === "chat") {
    return <ChatFrame cellId={cell.id} content={cell.content} />
  }
  if (cell.content?.type === "control") {
    return <ControlFrame cellId={cell.id} content={cell.content} />
  }
  return <EmptyCell cellId={cell.id} />
}

/** Whichever embed the source calls for, behind the common controller. */
function createPlayer(
  video: MultiviewVideo,
  host: HTMLElement,
  options: {
    lang: string
    muted: boolean
    onReady: () => void
    onStateChange: (state: PlayerState) => void
    onLoadError: () => void
  }
): PlayerController {
  const { source } = video
  if (source.provider === "youtube") {
    return createYoutubePlayer({ ...options, host, videoId: source.videoId })
  }
  return createTwitchPlayer({
    ...options,
    host,
    ...(source.channel
      ? { channel: source.channel }
      : { videoId: source.videoId! }),
  })
}

function VideoFrame({
  cellId,
  video,
}: {
  cellId: CellId
  video: MultiviewVideo
}) {
  const { t } = useT()
  const host = useRef<HTMLDivElement>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const lang = useSettings((s) => s.lang)
  const reload = useMultiviewUi((s) => s.reload)

  useEffect(() => {
    const node = host.current
    if (!node) return
    const desiredMuted = () => {
      const content = useMultiview
        .getState()
        .cells.find((cell) => cell.id === cellId)?.content
      return content?.type === "video" && !!content.muted
    }
    const controller = createPlayer(video, node, {
      lang: youtubeLang(lang),
      muted: desiredMuted(),
      onReady: () => playbackHub.markReady(cellId, desiredMuted()),
      onStateChange: () => playbackHub.refresh(cellId),
      onLoadError: () => setLoadFailed(true),
    })
    const release = playbackHub.register(cellId, controller)
    return () => {
      release()
      controller.destroy()
    }
    // A rebuilt player restarts the stream, so only a different stream may cause
    // one: never fresher metadata, nor a change of language mid-viewing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellId, video.id])

  return (
    <div className="relative size-full bg-black">
      <div ref={host} className="size-full [&>iframe]:size-full" />
      {loadFailed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center text-sm text-white">
          <WarningIcon className="size-6" />
          {t("views.multiview.playerLoadFailed")}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => reload([cellId])}
          >
            <ArrowClockwiseIcon data-icon="inline-start" />
            {t("views.watch.chat.retryBtn")}
          </Button>
        </div>
      )}
      <Subtitles videoId={video.id} />
    </div>
  )
}

/** Translations laid over the video, fed by a TL panel serving this stream. */
function Subtitles({ videoId }: { videoId: string }) {
  const lines = useTlSubtitles((s) => s.byVideo[videoId])
  if (!lines?.length) return null
  return (
    <div className="pointer-events-none absolute inset-x-[5%] bottom-[min(48px,10%)] flex flex-col items-center gap-0.5 text-center text-lg text-white">
      {lines.map((line) => (
        <div key={line.key}>
          {!line.is_tl && (
            <div
              className={cn(
                "mb-[-0.3rem] w-fit bg-black/75 px-2 text-base",
                line.is_owner ? "text-primary" : "text-complement"
              )}
            >
              {line.name}:
            </div>
          )}
          <span className="bg-black/75 box-decoration-clone px-2 whitespace-pre-wrap">
            {line.tokens.map((token, index) =>
              token.kind === "text" ? (
                <span key={index}>{token.text}</span>
              ) : (
                <img
                  key={index}
                  src={token.src}
                  alt={token.alt}
                  className="inline h-[1.3em] w-auto align-middle"
                />
              )
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Outlines a video while something elsewhere is pointing out which one it is. */
export function HighlightLayer() {
  const id = useMultiviewUi((s) => s.highlightedCell)
  const cell = useMultiview((s) => s.cells.find((c) => c.id === id))
  if (!cell) return null
  const motion = cellMotion(cell.id)
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none absolute z-10 rounded-[3px] ring-2 ring-primary ring-inset"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ ...rectStyle(cell.rect), x: motion.x, y: motion.y }}
    />
  )
}
