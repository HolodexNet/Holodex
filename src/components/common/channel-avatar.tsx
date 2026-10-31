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
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-primary/10 text-[0.45em] font-semibold text-brand"
        style={{ fontSize: size * 0.32 }}
      >
        {channel.name.trim().slice(0, 2)}
      </span>
      {failedSrc !== src && (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="relative size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  )
}
