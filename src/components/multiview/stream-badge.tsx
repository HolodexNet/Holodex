import { ChannelAvatar } from "@/components/common/channel-avatar"
import { LogoTwitchIcon, LogoYoutubeIcon } from "@/components/icons"
import type { MultiviewVideo } from "@/lib/multiview/types"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"

export function useStreamName(video: MultiviewVideo | null | undefined) {
  const preferEnglish = useSettings((s) => s.useEnglishName)
  return video ? channelName(video.channel, preferEnglish) : ""
}

/** The channel's picture, or the site's logo when the channel is unknown. */
export function StreamAvatar({
  video,
  size = 24,
  className,
}: {
  video: MultiviewVideo
  size?: number
  className?: string
}) {
  const { id, name, photo } = video.channel
  if (id || photo) {
    return (
      <ChannelAvatar
        channel={{ id: id ?? "", name, photo }}
        size={size}
        className={className}
      />
    )
  }
  const Logo =
    video.source.provider === "twitch" ? LogoTwitchIcon : LogoYoutubeIcon
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
      style={{ width: size, height: size }}
    >
      <Logo style={{ width: size * 0.6, height: size * 0.6 }} />
    </span>
  )
}
