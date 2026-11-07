import { memo, useMemo, useState, type DragEvent, type WheelEvent } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { ArrowClockwiseIcon, LogoTwitchIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useNowMinutes } from "@/hooks/use-now"
import { useT } from "@/lib/i18n"
import { activeVideos } from "@/lib/multiview/cells"
import { selectTrayVideos, toMultiviewVideo } from "@/lib/multiview/stream"
import type { MultiviewVideo } from "@/lib/multiview/types"
import { formatShortDistance } from "@/lib/time"
import type { Video } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { videoSource } from "@/lib/video-source"
import { useAuth } from "@/stores/auth"
import { useMultiview } from "@/stores/multiview"
import { useSettings } from "@/stores/settings"
import { SourcePicker } from "./source-picker"
import { ToolbarTip } from "./toolbar-tip"
import { UrlField } from "./url-field"
import { useMultiviewCommands } from "./use-commands"
import {
  useDefaultSource,
  useSourceVideos,
  type VideoSourceChoice,
} from "./use-source-videos"

/** How far one notch of the wheel scrolls the row: one avatar and its gap. */
const WHEEL_STEP = 53

export function setDragVideo(event: DragEvent, video: Video) {
  event.dataTransfer.setData(
    "text/plain",
    `https://holodex.net/watch/${video.id}`
  )
  event.dataTransfer.setData("application/json", JSON.stringify(video))
  event.dataTransfer.effectAllowed = "copy"
}

/** Who is on right now, one click or one drag away from being on screen. */
export function VideoTray({ className }: { className?: string }) {
  const { t } = useT()
  const fallback = useDefaultSource()
  const [choice, setChoice] = useState<VideoSourceChoice | null>(null)
  const source = choice ?? fallback
  const { addVideo } = useMultiviewCommands()
  const loggedIn = useAuth((s) => !!s.jwt)

  const showsFeed = source.kind === "favorites" || source.kind === "org"
  const { videos, isFetching, refetch } = useSourceVideos(source, showsFeed)
  const cells = useMultiview((s) => s.cells)
  const activeIds = useMemo(
    () => new Set(activeVideos(cells).map((video) => video.id)),
    [cells]
  )
  const now = useNowMinutes()
  const tray = useMemo(
    () => selectTrayVideos(videos, activeIds, now),
    [videos, activeIds, now]
  )

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.currentTarget.scrollLeft += Math.max(
      -WHEEL_STEP,
      Math.min(WHEEL_STEP, event.deltaY)
    )
  }

  return (
    <div
      className={cn(
        "min-w-0 flex-1 items-center gap-1.5 overflow-hidden",
        className
      )}
    >
      <SourcePicker value={source} onChange={setChoice} />
      {showsFeed && (
        <ToolbarTip
          label={t("views.multiview.refresh")}
          detail={t("views.multiview.tips.refresh")}
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={() => void refetch()}
            />
          }
        >
          <ArrowClockwiseIcon className={cn(isFetching && "animate-spin")} />
        </ToolbarTip>
      )}
      {source.kind === "url" ? (
        <UrlField
          key={source.provider}
          provider={source.provider}
          compact
          onVideo={addVideo}
        />
      ) : source.kind === "favorites" && !loggedIn ? (
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate">{t("views.app.loginCallToAction")}</span>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to="/login" />}
          >
            {t("component.mainNav.login")}
          </Button>
        </div>
      ) : (
        <div
          className="flex min-w-0 flex-1 scrollbar-thin gap-1 overflow-x-auto overflow-y-hidden py-0.5"
          onWheel={onWheel}
        >
          {tray.map((video) => {
            const stream = toMultiviewVideo(video)
            return (
              stream && (
                <TrayItem
                  key={video.id}
                  video={video}
                  stream={stream}
                  now={now}
                  onAdd={addVideo}
                />
              )
            )
          })}
        </div>
      )}
    </div>
  )
}

const TrayItem = memo(function TrayItem({
  video,
  stream,
  now,
  onAdd,
}: {
  video: Video
  stream: MultiviewVideo
  now: number
  onAdd: (video: MultiviewVideo) => void
}) {
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const name = channelName(video.channel, preferEnglish)
  const isTwitch = videoSource(video).provider === "twitch"
  const time = video.start_actual ?? video.start_scheduled

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            draggable
            aria-label={name}
            className="relative size-10 shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onDragStart={(event) => setDragVideo(event, video)}
            onClick={() => onAdd(stream)}
          />
        }
      >
        <ChannelAvatar
          channel={video.channel}
          size={40}
          className="pointer-events-none"
        />
        {isTwitch && (
          <span className="pointer-events-none absolute -top-0.5 -left-0.5 flex size-4 items-center justify-center rounded-full bg-[#9146ff] text-white">
            <LogoTwitchIcon className="size-2.5" />
          </span>
        )}
        {time && (
          <span
            className={cn(
              "pointer-events-none absolute right-0 bottom-0 rounded-sm px-0.5 text-[10px] leading-3.5 font-medium text-white tabular-nums",
              video.status === "live" ? "bg-live" : "bg-zinc-600"
            )}
          >
            {formatShortDistance(time, now)}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-64">
        <span className="font-medium">{name}</span>
        <br />
        {videoTitle(video, preferEnglish)}
      </TooltipContent>
    </Tooltip>
  )
})
