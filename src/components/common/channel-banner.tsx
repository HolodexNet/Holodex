import { useState } from "react"
import { cn } from "cn"
import { ChannelCurtain } from "@/components/common/channel-curtain"
import type { Channel } from "@/lib/types"

/** Wide banner codes, with the widths the static route serves them at. */
const WIDE_BANNER_WIDTHS = [
  { code: 2, width: 1280 },
  { code: 3, width: 2276 },
  { code: 4, width: 2560 },
]

export function ChannelBanner({
  channel,
  className,
  curved = false,
  resolveBanner = false,
  curtain = false,
  sizes,
}: {
  channel: Channel
  className?: string
  curved?: boolean
  resolveBanner?: boolean
  curtain?: boolean
  /** Layout width of the banner. Set it on wide layouts to load larger codes. */
  sizes?: string
}) {
  const [failed, setFailed] = useState<string | null>(null)
  // Directory payloads omit banners, so try the banner image itself. The static
  // route answers 400 when a channel has none, and onError falls back to the gradient.
  const hasBanner =
    channel.banner === undefined ? resolveBanner : !!channel.banner
  const bannerUrl = (code: number) =>
    `/statics/channelImg/${encodeURIComponent(channel.id)}/banner/${code}.jpeg`
  const banner = hasBanner ? bannerUrl(1) : null
  const srcSet =
    hasBanner && sizes
      ? WIDE_BANNER_WIDTHS.map(
          ({ code, width }) => `${bannerUrl(code)} ${width}w`
        ).join(", ")
      : undefined
  return (
    <div
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
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
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
