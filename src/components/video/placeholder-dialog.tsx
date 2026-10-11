import { ChannelAvatar } from "@/components/common/channel-avatar"
import { ArrowSquareOutIcon, LogoYoutubeIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useT } from "@/lib/i18n"
import { formatAbsolute } from "@/lib/time"
import type { Video } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { useSettings } from "@/stores/settings"

interface Credits {
  discord?: { user?: string; link?: string }
  datasource?: { name?: string; link?: string }
  bot?: { name?: string; user?: string; link?: string }
  editor?: { name?: string }
}

/**
 * Details of a placeholder: a stream that is announced or happening somewhere
 * Holodex cannot embed (an event, another platform, a not-yet-public frame).
 */
export function PlaceholderDialog({
  video,
  open,
  onOpenChange,
}: {
  video: Video
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, lang } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const credits = (video as Video & { credits?: Credits }).credits
  const scheduled = video.placeholderType === "scheduled-yt-stream"

  const creditLines = [
    credits?.discord?.user &&
      t("component.placeholderVideo.discordCredit", [credits.discord.user, "Discord"]),
    credits?.datasource?.name &&
      t("component.placeholderVideo.datasourceCredit", [credits.datasource.name]),
    credits?.bot?.name &&
      t("component.placeholderVideo.botCredit", [
        credits.bot.name,
        credits.bot.user ?? "",
      ]),
    credits?.editor?.name &&
      t("component.placeholderVideo.editorCredit", [credits.editor.name]),
  ].filter((line): line is string => !!line)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-8 leading-snug">
            {videoTitle(video, preferEnglish)}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            {formatAbsolute(video.start_scheduled ?? video.available_at, lang)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <ChannelAvatar channel={video.channel} size={40} />
          <div className="min-w-0">
            <div className="truncate font-medium">
              {channelName(video.channel, preferEnglish)}
            </div>
            {video.channel.org && (
              <div className="truncate text-muted-foreground">
                {video.channel.org}
              </div>
            )}
          </div>
        </div>

        {video.certainty !== "certain" && (
          <p className="text-muted-foreground">
            {t("component.videoCard.uncertainPlaceholder")}
          </p>
        )}

        {creditLines.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <div>{t("component.placeholderVideo.creditTitleText")}</div>
            {creditLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        )}

        {video.link && (
          <DialogFooter>
            <Button
              nativeButton={false}
              render={<a href={video.link} target="_blank" rel="noopener noreferrer" />
              }
            >
              {scheduled ? (
                <LogoYoutubeIcon data-icon="inline-start" />
              ) : (
                <ArrowSquareOutIcon data-icon="inline-start" />
              )}
              {scheduled
                ? t("component.placeholderVideo.scheduledEvent")
                : video.placeholderType === "external-stream"
                  ? t("component.placeholderVideo.streamPageBtn")
                  : t("component.placeholderVideo.eventPageBtn")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
