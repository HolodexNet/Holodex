import { useState } from "react"
import { cn } from "cn"

import type { ChannelSummary } from "@/lib/types"
import { channelPhoto } from "@/lib/video"

interface ChannelAvatarProps {
  channel: Pick<ChannelSummary, "id" | "name" | "photo">
  /** Rendered size in CSS pixels. */
  size?: number
  /** Draws the red "currently live" ring. */
  live?: boolean
  className?: string
}

export function ChannelAvatar({
  channel,
  size = 36,
  live = false,
  className,
}: ChannelAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const src = channelPhoto(channel, size)

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted",
        live && "ring-2 ring-live ring-offset-2 ring-offset-sidebar",
        className
      )}
      style={{ width: size, height: size }}
    >
      {failedSrc !== src && (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  )
}
