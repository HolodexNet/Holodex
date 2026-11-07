import type { RefObject } from "react"
import { cn } from "cn"

import { useT } from "@/lib/i18n"

/**
 * A drag handle between two panes, sizing one of them as a percentage of the
 * container. `reverse` measures from the far edge, for a pane on the right.
 * Arrow keys nudge it, so it works without a pointer too.
 */
export function Splitter({
  axis,
  value,
  min,
  max,
  reverse = false,
  container,
  onChange,
  onDragChange,
}: {
  axis: "x" | "y"
  value: number
  min: number
  max: number
  reverse?: boolean
  container: RefObject<HTMLElement | null>
  onChange: (value: number) => void
  onDragChange: (dragging: boolean) => void
}) {
  const { t } = useT()
  const clamp = (next: number) =>
    Math.round(Math.min(max, Math.max(min, next)) * 10) / 10

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = container.current?.getBoundingClientRect()
    if (!box) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    onDragChange(true)
    const move = (moveEvent: PointerEvent) => {
      const offset =
        axis === "x"
          ? (moveEvent.clientX - box.left) / box.width
          : (moveEvent.clientY - box.top) / box.height
      onChange(clamp((reverse ? 1 - offset : offset) * 100))
    }
    const end = () => {
      handle.removeEventListener("pointermove", move)
      handle.removeEventListener("pointerup", end)
      handle.removeEventListener("pointercancel", end)
      onDragChange(false)
    }
    handle.addEventListener("pointermove", move)
    handle.addEventListener("pointerup", end)
    handle.addEventListener("pointercancel", end)
  }

  const keys = (event: React.KeyboardEvent) => {
    const grow =
      axis === "x" ? (reverse ? "ArrowLeft" : "ArrowRight") : "ArrowDown"
    const shrink =
      axis === "x" ? (reverse ? "ArrowRight" : "ArrowLeft") : "ArrowUp"
    if (event.key === grow) onChange(clamp(value + 2))
    else if (event.key === shrink) onChange(clamp(value - 2))
    else return
    event.preventDefault()
  }

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={axis === "x" ? "vertical" : "horizontal"}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={t("tlClient.layout.resize")}
      onPointerDown={start}
      onKeyDown={keys}
      className={cn(
        "group relative z-10 flex shrink-0 touch-none items-center justify-center outline-none",
        axis === "x"
          ? "w-1.5 cursor-col-resize flex-col"
          : "h-1.5 cursor-row-resize"
      )}
    >
      <span
        className={cn(
          "rounded-full bg-border transition-colors group-hover:bg-primary/60 group-focus-visible:bg-primary",
          axis === "x" ? "h-10 w-0.5" : "h-0.5 w-10"
        )}
      />
    </div>
  )
}
