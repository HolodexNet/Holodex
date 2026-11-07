import { cn } from "cn"

import { GRID_SIZE } from "@/lib/multiview/grid"
import type { LayoutSlot } from "@/lib/multiview/types"

const pct = (units: number) => `${(units / GRID_SIZE) * 100}%`

/** A miniature of a layout, with videos, chats and controls in their own colours. */
export function LayoutPreview({
  slots,
  portrait = false,
  scale = 1,
  className,
}: {
  slots: readonly Pick<LayoutSlot, "rect" | "content">[]
  portrait?: boolean
  scale?: number
  className?: string
}) {
  const width = scale * (portrait ? 108 : 192)
  const height = scale * (portrait ? 192 : 108)
  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0 rounded-sm bg-muted", className)}
      style={{ width, height }}
    >
      {slots.map((slot, index) => (
        <div
          key={index}
          className="absolute p-px"
          style={{
            left: pct(slot.rect.x),
            top: pct(slot.rect.y),
            width: pct(slot.rect.w),
            height: pct(slot.rect.h),
          }}
        >
          <div
            className={cn(
              "flex size-full items-center justify-center rounded-xs text-xs",
              slot.content?.type === "chat"
                ? "bg-amber-500/35"
                : slot.content?.type === "control"
                  ? "bg-emerald-500/35"
                  : "bg-sky-500/35"
            )}
          >
            {slot.content?.type === "chat" && "💬"}
            {slot.content?.type === "control" && "🎛️"}
          </div>
        </div>
      ))}
    </div>
  )
}
