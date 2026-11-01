import { useEffect, useRef, useState } from "react"
import { cn } from "cn"
import { ChannelCurtain } from "@/components/common/channel-curtain"
import { useChannel } from "@/lib/channel-queries"
import type { Channel } from "@/lib/types"

export function ChannelBanner({
  channel,
  className,
  curved = false,
  resolveBanner = false,
  curtain = false,
}: {
  channel: Channel
  className?: string
  curved?: boolean
  resolveBanner?: boolean
  curtain?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  // Directory payloads omit banners. Fetch detail only near the viewport and
  // share the profile query cache instead of requesting every channel at once.
  const needsDetail = resolveBanner && channel.banner === undefined
  useEffect(() => {
    if (!needsDetail || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "120px" }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [needsDetail])
  const detail = useChannel(channel.id, needsDetail && visible)
  const rawBanner = channel.banner ?? detail.data?.banner
  const banner = rawBanner
    ? `/statics/channelImg/${encodeURIComponent(channel.id)}/banner/1.jpeg`
    : null
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate overflow-hidden bg-gradient-to-br from-primary/25 via-muted to-complement/25",
        curved && "bg-card bg-none",
        className
      )}
    >
      <div className="absolute -top-24 -right-12 size-80 rounded-full border-[40px] border-primary/10" />
      <div className="absolute -bottom-40 left-[15%] size-96 rounded-full border border-complement/20" />
      {curved && (
        <div className="absolute inset-0 bg-primary/50 [clip-path:ellipse(90%_103%_at_30%_0%)]" />
      )}
      {!curtain && banner && failed !== banner && (
        <img
          src={banner}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={cn(
            "absolute inset-0 size-full object-cover",
            curved && "[clip-path:ellipse(90%_100%_at_30%_0%)]"
          )}
          onError={() => setFailed(banner)}
        />
      )}
      {curtain && (
        <div
          className={cn(
            "absolute inset-0",
            curved && "[clip-path:ellipse(90%_100%_at_30%_0%)]"
          )}
        >
          <ChannelCurtain channel={channel} banner={banner} />
        </div>
      )}
    </div>
  )
}
