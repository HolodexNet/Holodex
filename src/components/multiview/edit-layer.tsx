import { memo, useMemo } from "react"
import { cn } from "cn"
import { AnimatePresence, useTransform } from "motion/react"
import * as m from "motion/react-m"

import {
  ArrowClockwiseIcon,
  EraserIcon,
  LinkSimpleIcon,
  PencilSimpleIcon,
  SlidersHorizontalIcon,
  TrashIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { isChatCell, isControlCell, isVideoCell } from "@/lib/multiview/cells"
import {
  planKeyResize,
  planNudge,
  RESIZE_HANDLES,
  resizeChanges,
  type ResizeHandle,
} from "@/lib/multiview/gestures"
import { GRID_SIZE, rectsEqual } from "@/lib/multiview/grid"
import type { Cell, Rect } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { cellMotion } from "./cell-motion"
import { ChatTargetMenu } from "./chat-target-menu"
import { EmptyCellActions } from "./empty-cell"
import { rectStyle } from "./frame-layer"
import { useEditGesture, useEffectiveRect } from "./gesture-store"
import {
  accentColor,
  useAccents,
  useResolvedChat,
  useResolvedChats,
} from "./selectors"
import { useStageSize } from "./stage-size"
import { StreamAvatar, useStreamName } from "./stream-badge"
import { useMultiviewCommands } from "./use-commands"
import { useEditGestures, type GestureStart } from "./use-edit-gestures"

type Begin = (event: React.PointerEvent, start: GestureStart) => void

const GRID_LINES = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px)",
  backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`,
}

/**
 * The whole view in editing mode. This sheet of glass covers every iframe and
 * takes all the pointer input, so players carry on underneath and nothing can
 * swallow a drag. Everything moved here is drawn from the same motion values as
 * the frames below, which is why the two never separate.
 */
export function EditLayer() {
  const { t } = useT()
  const cells = useMultiview((s) => s.cells)
  const { layer, begin } = useEditGestures()
  const gestureActive = useEditGesture((s) => s.active !== null)

  return (
    <m.div
      ref={layer}
      data-edit-layer=""
      className={cn(
        "absolute inset-0 z-20 touch-none bg-background/30 select-none",
        gestureActive && "cursor-grabbing"
      )}
      style={GRID_LINES}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onPointerDown={(event) => begin(event, { kind: "draw" })}
    >
      <Threads />
      {cells.map((cell) => (
        <EditCell key={cell.id} cell={cell} begin={begin} />
      ))}
      <Ghost />
      <AnimatePresence>
        {!gestureActive && (
          <m.div
            key="hint"
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            <span className="rounded-full bg-popover/95 px-3 py-1.5 text-center text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10">
              {t("views.multiview.edit.hint")}
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

/** The outline a drag or draw would land in. */
function Ghost() {
  const rect = useEditGesture((s) => {
    if (s.active?.kind === "draw") return s.active.rect
    if (s.active?.kind === "move") return s.active.target
    return null
  })
  if (!rect) return null
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute rounded-[3px] border-2 border-dashed border-primary bg-primary/15"
      style={rectStyle(rect)}
    />
  )
}

const center = (rect: Rect) => ({
  x: rect.x + rect.w / 2,
  y: rect.y + rect.h / 2,
})

/** Lines showing which chat serves which video, or follow a bind in progress. */
function Threads() {
  const cells = useMultiview((s) => s.cells)
  const resolved = useResolvedChats()
  const accents = useAccents()
  const binding = useEditGesture((s) =>
    s.active?.kind === "bind" ? s.active : null
  )

  const threads = useMemo(() => {
    const rectOf = new Map(cells.map((cell) => [cell.id, cell.rect]))
    return cells.filter(isChatCell).flatMap((chat) => {
      if (binding?.cellId === chat.id) return []
      const source = resolved.get(chat.id)?.sourceCellId
      const to = source && rectOf.get(source)
      return to
        ? [
            {
              id: chat.id,
              from: center(chat.rect),
              to: center(to),
              hue: accents.get(source),
            },
          ]
        : []
    })
  }, [cells, resolved, accents, binding])

  const bindFrom = binding && cells.find((c) => c.id === binding.cellId)
  const path = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const bend = (a.x + b.x) / 2
    return `M ${a.x} ${a.y} C ${bend} ${a.y}, ${bend} ${b.y}, ${b.x} ${b.y}`
  }

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-10 size-full"
    >
      {threads.map(({ id, from, to, hue }) => (
        <path
          key={id}
          d={path(from, to)}
          fill="none"
          stroke={accentColor(hue)}
          strokeWidth={2}
          strokeDasharray="6 5"
          strokeOpacity={0.8}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {binding && bindFrom && (
        <path
          d={path(center(bindFrom.rect), binding.pointer)}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}

/**
 * Each handle stays inside its own cell, so neighbours never compete for the
 * same pixels: which side of a shared edge you grab says which cell you mean.
 */
const HANDLE_CLASSES: Record<ResizeHandle, string> = {
  n: "inset-x-4 top-0 h-2 cursor-ns-resize pointer-coarse:h-4",
  s: "inset-x-4 bottom-0 h-2 cursor-ns-resize pointer-coarse:h-4",
  e: "inset-y-4 right-0 w-2 cursor-ew-resize pointer-coarse:w-4",
  w: "inset-y-4 left-0 w-2 cursor-ew-resize pointer-coarse:w-4",
  nw: "top-0 left-0 size-4 cursor-nwse-resize pointer-coarse:size-6",
  se: "right-0 bottom-0 size-4 cursor-nwse-resize pointer-coarse:size-6",
  ne: "top-0 right-0 size-4 cursor-nesw-resize pointer-coarse:size-6",
  sw: "bottom-0 left-0 size-4 cursor-nesw-resize pointer-coarse:size-6",
}

/** The little mark drawn inside each corner, so handles can be seen and hit. */
const CORNER_MARKS: Partial<Record<ResizeHandle, string>> = {
  nw: "top-1 left-1 border-t-2 border-l-2 rounded-tl-sm",
  ne: "top-1 right-1 border-t-2 border-r-2 rounded-tr-sm",
  sw: "bottom-1 left-1 border-b-2 border-l-2 rounded-bl-sm",
  se: "bottom-1 right-1 border-b-2 border-r-2 rounded-br-sm",
}

const EditCell = memo(function EditCell({
  cell,
  begin,
}: {
  cell: Cell
  begin: Begin
}) {
  const { t } = useT()
  const rect = useEffectiveRect(cell.id, cell.rect)
  const motion = cellMotion(cell.id)
  const stage = useStageSize()
  const accents = useAccents()
  const resolved = useResolvedChat(cell.id)
  const setRects = useMultiview((s) => s.setRects)
  const { removeCell } = useMultiviewCommands()
  const lifted = useEditGesture(
    (s) => s.active?.kind === "move" && s.active.cellId === cell.id
  )
  const swapTarget = useEditGesture(
    (s) => s.active?.kind === "move" && s.active.swapWith === cell.id
  )
  const bindTarget = useEditGesture(
    (s) => s.active?.kind === "bind" && s.active.over === cell.id
  )

  // Follows the frame's scale as real size, so labels and handles do not stretch.
  const width = useTransform(
    motion.scaleX,
    (scale) => (scale * rect.w * stage.width) / GRID_SIZE
  )
  const height = useTransform(
    motion.scaleY,
    (scale) => (scale * rect.h * stage.height) / GRID_SIZE
  )

  const hue = isVideoCell(cell)
    ? accents.get(cell.id)
    : resolved?.sourceCellId
      ? accents.get(resolved.sourceCellId)
      : undefined

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== event.currentTarget) return
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault()
      removeCell(cell.id)
      return
    }
    const delta = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    }[event.key]
    if (!delta) return
    event.preventDefault()
    const cells = useMultiview.getState().cells
    if (event.shiftKey) {
      const plan = planKeyResize(cells, cell.id, cell.rect, delta)
      if (!rectsEqual(plan.rect, cell.rect)) {
        setRects(resizeChanges(cell.id, plan))
      }
      return
    }
    const next = planNudge(cells, cell.id, cell.rect, delta)
    if (!rectsEqual(next, cell.rect)) setRects(new Map([[cell.id, next]]))
  }

  return (
    <m.div
      data-edit-cell={cell.id}
      role="group"
      tabIndex={0}
      aria-label={t("views.multiview.edit.cellLabel", [rect.w, rect.h])}
      className={cn(
        "@container absolute cursor-grab overflow-visible rounded-[3px] bg-background/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        lifted && "z-20 cursor-grabbing shadow-2xl",
        (swapTarget || bindTarget) && "bg-primary/25"
      )}
      style={{
        left: `${(rect.x / GRID_SIZE) * 100}%`,
        top: `${(rect.y / GRID_SIZE) * 100}%`,
        width,
        height,
        x: motion.x,
        y: motion.y,
        boxShadow: `inset 0 0 0 2px ${accentColor(hue)}`,
      }}
      onPointerDown={(event) => {
        event.currentTarget.focus({ preventScroll: true })
        begin(event, { kind: "move", cell })
      }}
      onKeyDown={onKeyDown}
    >
      <CellChrome cell={cell} begin={begin} hue={hue} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 bottom-1.5 rounded-sm bg-background/80 px-1 text-[11px] tabular-nums"
      >
        {rect.w} × {rect.h}
      </span>
      {RESIZE_HANDLES.map((handle) => (
        <div
          key={handle}
          data-handle={handle}
          aria-hidden="true"
          className={cn("absolute z-10 touch-none", HANDLE_CLASSES[handle])}
          onPointerDown={(event) =>
            begin(event, { kind: "resize", cell, handle })
          }
        >
          {CORNER_MARKS[handle] && (
            <span
              className={cn("absolute size-2.5", CORNER_MARKS[handle])}
              style={{ borderColor: accentColor(hue) }}
            />
          )}
        </div>
      ))}
    </m.div>
  )
})

const stop = (event: React.PointerEvent) => event.stopPropagation()

/** The label and per-cell actions, with no effect on the drag beneath them. */
function CellChrome({
  cell,
  begin,
  hue,
}: {
  cell: Cell
  begin: Begin
  hue: number | undefined
}) {
  const { t } = useT()
  const setContent = useMultiview((s) => s.setContent)
  const setUi = useMultiviewUi((s) => s.set)
  const reload = useMultiviewUi((s) => s.reload)
  const { removeCell } = useMultiviewCommands()
  const video = isVideoCell(cell) ? cell.content.video : null
  const name = useStreamName(video)

  return (
    <div className="pointer-events-none absolute inset-1.5 flex flex-col items-start gap-1 overflow-hidden">
      <div className="flex max-w-full flex-wrap items-center gap-1">
        {video && (
          <span className="flex h-6 max-w-full items-center gap-1.5 rounded-md bg-background/85 pr-2 pl-1 text-xs">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: accentColor(hue) }}
            />
            <StreamAvatar video={video} size={16} />
            <span className="hidden min-w-0 truncate @[11rem]:block">
              {name}
            </span>
          </span>
        )}
        {isControlCell(cell) && (
          <span className="flex h-6 max-w-full items-center gap-1.5 rounded-md bg-background/85 px-2 text-xs">
            <SlidersHorizontalIcon className="shrink-0" />
            <span className="hidden min-w-0 truncate @[11rem]:block">
              {t("views.multiview.mediaControls")}
            </span>
          </span>
        )}
        {isChatCell(cell) && (
          // Opaque and full width, covering the same control on the frame below.
          <span
            className="pointer-events-auto absolute -inset-x-1.5 -top-1.5 flex h-8 items-center bg-card pr-22 pl-1.5"
            onPointerDown={stop}
          >
            <ChatTargetMenu cellId={cell.id} />
          </span>
        )}
      </div>

      {cell.content === null && (
        <div
          className="pointer-events-auto m-auto max-w-full"
          onPointerDown={stop}
        >
          <EmptyCellActions cellId={cell.id} />
        </div>
      )}

      <div
        className="pointer-events-auto absolute top-0 right-0 flex items-center gap-0.5 rounded-md bg-background/85 p-0.5"
        onPointerDown={stop}
      >
        {isChatCell(cell) && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="cursor-crosshair touch-none"
            title={t("views.multiview.edit.bind")}
            aria-label={t("views.multiview.edit.bind")}
            onPointerDown={(event) => begin(event, { kind: "bind", cell })}
          >
            <LinkSimpleIcon />
          </Button>
        )}
        {video && (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              title={t("views.multiview.edit.replace")}
              aria-label={t("views.multiview.edit.replace")}
              onClick={() =>
                setUi({ picker: { kind: "cell", cellId: cell.id } })
              }
            >
              <PencilSimpleIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              title={t("views.multiview.edit.reload")}
              aria-label={t("views.multiview.edit.reload")}
              onClick={() => reload([cell.id])}
            >
              <ArrowClockwiseIcon />
            </Button>
          </>
        )}
        {cell.content && (
          <Button
            variant="ghost"
            size="icon-xs"
            title={t("views.multiview.edit.clear")}
            aria-label={t("views.multiview.edit.clear")}
            onClick={() => setContent(cell.id, null)}
          >
            <EraserIcon />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-destructive"
          title={t("views.multiview.edit.delete")}
          aria-label={t("views.multiview.edit.delete")}
          onClick={() => removeCell(cell.id)}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  )
}
