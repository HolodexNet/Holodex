import { useNavigate } from "react-router"
import { toast } from "sonner"

import {
  CalendarBlankIcon,
  DotsThreeVerticalIcon,
  EyeSlashIcon,
  LinkIcon,
  LogoYoutubeIcon,
  UserIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useT } from "@/lib/i18n"
import type { Video } from "@/lib/types"
import { videoTitle, watchPath, youtubeUrl } from "@/lib/video"
import { useSettings } from "@/stores/settings"

/** `YYYYMMDDTHHmmssZ`, the UTC timestamp format calendar links expect. */
const calendarStamp = (date: Date) =>
  date.toISOString().replace(/[-:]|\.\d{3}/g, "")

function googleCalendarUrl(video: Video, title: string): string {
  const start = new Date(video.start_scheduled ?? video.available_at ?? Date.now())
  const end = new Date(start.getTime() + (video.duration || 3600) * 1000)
  const link =
    video.type === "placeholder" ? (video.link ?? "") : youtubeUrl(video.id)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${calendarStamp(start)}/${calendarStamp(end)}`,
    details: link,
  })
  return `https://www.google.com/calendar/render?${params}`
}

export function VideoMenu({
  video,
  className,
}: {
  video: Video
  className?: string
}) {
  const { t } = useT()
  const navigate = useNavigate()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const isBlocked = useSettings((s) =>
    s.blockedChannels.some((c) => c.id === video.channel.id)
  )
  const toggleBlocked = useSettings((s) => s.toggleBlocked)
  const isPlaceholder = video.type === "placeholder"
  const title = videoTitle(video, preferEnglish)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${watchPath(video.id)}`
      )
      toast.success(t("component.videoCard.copiedToClipboard"))
    } catch {
      toast.error(t("component.videoCard.copyFailed"))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={className}
            aria-label={t("component.videoCard.moreActions")}
          />
        }
      >
        <DotsThreeVerticalIcon className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-56">
        {!isPlaceholder && (
          <DropdownMenuItem
            render={
              <a
                href={youtubeUrl(video.id)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <LogoYoutubeIcon />
            {t("views.settings.redirectModeLabel")}
          </DropdownMenuItem>
        )}
        {!isPlaceholder && (
          <DropdownMenuItem onClick={copyLink}>
            <LinkIcon />
            {t("component.videoCard.copyLink")}
          </DropdownMenuItem>
        )}
        {video.status === "upcoming" && (
          <DropdownMenuItem
            render={
              <a
                href={googleCalendarUrl(video, title)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <CalendarBlankIcon />
            {t("component.videoCard.googleCalendar")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => navigate(`/channel/${video.channel.id}`)}
        >
          <UserIcon />
          {t("component.videoCard.viewChannel")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={isBlocked ? "default" : "destructive"}
          onClick={() => toggleBlocked(video.channel)}
        >
          <EyeSlashIcon />
          {isBlocked
            ? t("component.channelSocials.unblock")
            : t("component.channelSocials.block")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
