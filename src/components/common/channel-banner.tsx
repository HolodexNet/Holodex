import { useState } from "react"
import { cn } from "cn"
import type { Channel } from "@/lib/types"

/** The same quiet identity treatment on the directory and the talent home. */
export function ChannelBanner({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  const [failed, setFailed] = useState<string | null>(null)
  const banner =
    channel.banner && /^https?:\/\//.test(channel.banner)
      ? /^https:\/\/(yt3\.googleusercontent\.com|yt3\.ggpht\.com)\//.test(
          channel.banner
        )
        ? `${channel.banner.split("=")[0]}=w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`
        : channel.banner
      : null
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-gradient-to-br from-primary/25 via-muted to-complement/25",
        className
      )}
    >
      <div className="absolute -top-24 -right-12 size-80 rounded-full border-[40px] border-primary/10" />
      <div className="absolute -bottom-40 left-[15%] size-96 rounded-full border border-complement/20" />
      {banner && failed !== banner && (
        <img
          src={banner}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailed(banner)}
        />
      )}
    </div>
  )
}
