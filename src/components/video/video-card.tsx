import { memo, useState, type MouseEvent, type ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import {
  BroadcastIcon,
  CalendarBlankIcon,
  ChatbubblesIcon,
  ClockCountdownIcon,
  LogoTwitchIcon,
  LogoTwitterIcon,
  LogoYoutubeIcon,
  MusicalNotesIcon,
} from "@/components/icons"
import { useNowMinutes, useNowSeconds } from "@/hooks/use-now"
import { useT } from "@/lib/i18n"
import {
  formatAbsolute,
  formatCount,
  formatDistance,
  formatDuration,
} from "@/lib/time"
import type { ChannelSummary, Video } from "@/lib/types"
import {
  channelName,
  channelPhoto,
  clipCount,
  videoThumbnail,
  videoTitle,
  watchPath,
  youtubeUrl,
} from "@/lib/video"
import { useSettings } from "@/stores/settings"
import { PlaceholderDialog } from "./placeholder-dialog"
import { VideoMenu } from "./video-menu"

export type VideoCardVariant = "grid" | "list" | "dense"

interface VideoCardProps {
  video: Video
  variant?: VideoCardVariant
  /** Smaller type for the compact grid sizes. */
  compact?: boolean
  discovery?: boolean
  /** Parent card surface: flush thumbnail, inset details, single-line title. */
  embedded?: boolean
  /** Extra content under the card, e.g. matching comments in search. */
  children?: ReactNode
}

const overlayChip =
  "rounded-md bg-black/75 px-1.5 py-0.5 text-xs leading-4 font-medium text-white"

/** Elapsed time of a running stream; the only part that ticks every second. */
function LiveTimer({ start }: { start: string | number }) {
  const now = useNowSeconds()
  return <>{formatDuration(now - new Date(start).getTime())}</>
}

/** Shared with preloads so they warm the same srcset candidate. */
export const THUMBNAIL_SIZES = "(min-width: 640px) 320px, 100vw"

export function VideoThumbnail({ video }: { video: Video }) {
  const { src, srcSet } = videoThumbnail(video)
  const [failed, setFailed] = useState<string | null>(null)

  // No usable thumbnail (private, deleted, never uploaded): stand in with a
  // soft wash of the channel's avatar rather than YouTube's grey placeholder.
  if (failed === src) {
    return (
      <img
        src={channelPhoto(video.channel, 176)}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 size-full scale-150 object-cover opacity-50 blur-2xl"
      />
    )
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? THUMBNAIL_SIZES : undefined}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(src)}
      onLoad={(event) => {
        // YouTube answers for a missing thumbnail with a 120x90 stub image.
        const img = event.currentTarget
        if (srcSet && img.naturalWidth === 120 && img.naturalHeight === 90) {
          setFailed(src)
        }
      }}
      className={cn(
        "absolute inset-0 size-full object-cover",
        video.placeholderType === "scheduled-yt-stream" &&
          "opacity-60 transition-opacity group-hover/card:opacity-100"
      )}
    />
  )
}

function PlaceholderIcon({ video }: { video: Video }) {
  if (video.link?.includes("twitch.tv")) return <LogoTwitchIcon />
  if (video.link?.includes("/i/spaces/")) return <LogoTwitterIcon />
  if (video.placeholderType === "event") return <CalendarBlankIcon />
  if (video.placeholderType === "scheduled-yt-stream")
    return <LogoYoutubeIcon />
  return <BroadcastIcon />
}

/** Talents featured in the video, so collabs and clips read at a glance. */
function Mentions({
  mentions,
  preferEnglish,
}: {
  mentions: ChannelSummary[]
  preferEnglish: boolean
}) {
  const shown = mentions.slice(0, 4)
  const rest = mentions.length - shown.length
  return (
    <div
      className="flex items-center -space-x-1.5"
      title={mentions.map((m) => channelName(m, preferEnglish)).join("\n")}
    >
      {shown.map((m) => (
        <ChannelAvatar
          key={m.id}
          channel={m}
          size={22}
          className="ring-2 ring-black/60"
        />
      ))}
      {rest > 0 && (
        <span className="relative ml-2! rounded-full bg-black/75 px-1.5 text-[11px] leading-[22px] font-medium text-white">
          +{rest}
        </span>
      )}
    </div>
  )
}

function ThumbnailOverlay({
  video,
  preferEnglish,
}: {
  video: Video
  preferEnglish: boolean
}) {
  const { t } = useT()
  const liveTlLang = useSettings((s) => s.liveTlLang)
  const isPlaceholder = video.type === "placeholder"
  const isLive = video.status === "live"

  const archivedTls =
    video.status === "past" ? video.live_tl_count?.[liveTlLang] : undefined
  const hasTls = !!archivedTls || !!video.recent_live_tls?.includes(liveTlLang)

  let duration: ReactNode = null
  if (isLive && video.start_actual) {
    duration = <LiveTimer start={video.start_actual} />
  } else if (video.status === "upcoming" && video.duration) {
    duration = t("component.videoCard.premiere")
  } else if (video.duration && video.duration > 0) {
    duration = formatDuration(video.duration * 1000)
  }

  const placeholderLabel =
    video.placeholderType === "scheduled-yt-stream"
      ? t("component.videoCard.typeScheduledYT")
      : video.placeholderType === "external-stream"
        ? t("component.videoCard.typeExternalStream")
        : video.placeholderType === "event"
          ? t("component.videoCard.typeEventPlaceholder")
          : null

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-1.5">
      <div className="flex items-start">
        {video.topic_id && (
          <span className={cn(overlayChip, "max-w-[70%] truncate capitalize")}>
            {video.topic_id.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        {video.mentions?.length ? (
          <Mentions mentions={video.mentions} preferEnglish={preferEnglish} />
        ) : (
          <span />
        )}

        <div className="flex flex-col items-end gap-1">
          {!isPlaceholder && !!video.songcount && (
            <span
              className={cn(overlayChip, "flex items-center gap-1")}
              title={t("component.videoCard.totalSongs")}
            >
              {video.songcount > 1 && video.songcount}
              <MusicalNotesIcon className="size-3.5" />
            </span>
          )}
          {!isPlaceholder && hasTls && (
            <span
              className={cn(overlayChip, "flex items-center gap-1")}
              title={
                video.status === "past"
                  ? t("component.videoCard.totalTLs")
                  : t("component.videoCard.tlPresence")
              }
            >
              {archivedTls}
              <ChatbubblesIcon className="size-3.5" />
            </span>
          )}
          {isPlaceholder ? (
            <span className={cn(overlayChip, "flex items-center gap-1")}>
              {placeholderLabel && (
                <span className="hidden group-hover/card:inline">
                  {placeholderLabel}
                </span>
              )}
              <span className="[&>svg]:size-4">
                <PlaceholderIcon video={video} />
              </span>
            </span>
          ) : (
            duration && (
              <span
                className={cn(
                  overlayChip,
                  "tabular-nums",
                  isLive && "bg-live text-white"
                )}
              >
                {duration}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function VideoCardImpl({
  video,
  variant = "grid",
  compact = false,
  discovery = false,
  embedded = false,
  children,
}: VideoCardProps) {
  const translator = useT()
  const { t, tc, lang } = translator
  const now = useNowMinutes()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const redirectMode = useSettings((s) => s.redirectMode)
  const hideThumbnail = useSettings((s) => s.hideThumbnail)
  const [placeholderOpen, setPlaceholderOpen] = useState(false)

  const isPlaceholder = video.type === "placeholder"
  const isLive = video.status === "live"
  const title = videoTitle(video, preferEnglish)
  const name = channelName(video.channel, preferEnglish)
  const channelHref = `/channel/${video.channel.id}`
  const watchHref = watchPath(video.id)
  const uncertain = isPlaceholder && video.certainty !== "certain"

  const openPlaceholder = (event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    setPlaceholderOpen(true)
  }

  // Thumbnails honour "open on YouTube"; titles always stay on Holodex.
  const externalStream =
    isPlaceholder && video.placeholderType === "external-stream" && video.link
  const thumbnailProps = externalStream
    ? { href: video.link!, target: "_blank", rel: "noopener noreferrer" }
    : isPlaceholder
      ? { href: watchHref, onClick: openPlaceholder }
      : redirectMode
        ? {
            href: youtubeUrl(video.id),
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : null

  const time =
    video.status === "upcoming"
      ? formatDistance(
          video.start_scheduled ?? video.available_at,
          translator,
          now,
          { future: true }
        )
      : isLive
        ? t("component.videoCard.liveNow")
        : formatDistance(video.available_at, translator, now)

  const clips = clipCount(video)
  const viewers = video.live_viewers ?? 0
  let detail: ReactNode = null
  if (!isPlaceholder && clips > 0) {
    detail = (
      <span className="text-brand">
        {tc("component.videoCard.clips", clips)}
      </span>
    )
  } else if (isLive && viewers > 0) {
    detail = t("component.videoCard.watching", [formatCount(viewers, lang)])
  }

  const thumbnail = !hideThumbnail && variant !== "dense" && (
    <div
      className={cn(
        "relative aspect-video shrink-0 overflow-hidden bg-muted",
        discovery ? "rounded-md" : "rounded-xl",
        variant === "list" ? "w-40 sm:w-48" : "w-full"
      )}
    >
      {thumbnailProps ? (
        <a {...thumbnailProps} tabIndex={-1} aria-hidden="true">
          <VideoThumbnail video={video} />
        </a>
      ) : (
        <Link to={watchHref} tabIndex={-1} aria-hidden="true">
          <VideoThumbnail video={video} />
        </Link>
      )}
      <ThumbnailOverlay video={video} preferEnglish={preferEnglish} />
    </div>
  )

  const titleClass = cn(
    "font-medium text-foreground outline-none hover:text-brand focus-visible:underline",
    embedded ? "block truncate" : "line-clamp-2 wrap-anywhere",
    compact ? "text-[13px] leading-[1.3]" : "text-sm leading-snug"
  )
  const titleContent = (
    <>
      {uncertain && (
        <ClockCountdownIcon
          className="mr-1 inline size-4 align-[-3px] text-amber-500"
          aria-label={t("component.videoCard.uncertainPlaceholder")}
        />
      )}
      {title}
    </>
  )
  const titleLink = isPlaceholder ? (
    <a
      href={watchHref}
      onClick={openPlaceholder}
      className={titleClass}
      title={title}
    >
      {titleContent}
    </a>
  ) : (
    <Link to={watchHref} className={titleClass} title={title}>
      {titleContent}
    </Link>
  )

  const channelLink = (
    <Link
      to={channelHref}
      title={[
        video.channel.name,
        video.channel.english_name && `EN: ${video.channel.english_name}`,
        video.channel.org,
      ]
        .filter(Boolean)
        .join("\n")}
      className={cn(
        "truncate outline-none hover:text-foreground focus-visible:underline",
        video.type === "stream" || video.channel.type === "vtuber"
          ? "text-complement"
          : "text-muted-foreground"
      )}
    >
      {name}
    </Link>
  )

  const timeLine = (
    <span className="truncate">
      <time
        dateTime={
          video.available_at
            ? new Date(video.available_at).toISOString()
            : undefined
        }
        title={formatAbsolute(video.available_at, lang)}
        className={cn(isLive && "font-medium text-live")}
      >
        {time}
      </time>
      {detail && <> • {detail}</>}
    </span>
  )

  const menu = (
    <VideoMenu
      video={video}
      className={cn(
        "-mr-1.5 shrink-0 text-muted-foreground",
        "pointer-fine:opacity-0 pointer-fine:group-focus-within/card:opacity-100 pointer-fine:group-hover/card:opacity-100 pointer-fine:aria-expanded:opacity-100"
      )}
    />
  )

  const placeholderDialog = isPlaceholder && placeholderOpen && (
    <PlaceholderDialog video={video} open onOpenChange={setPlaceholderOpen} />
  )

  if (variant === "dense") {
    return (
      <article
        className={cn(
          "group/card flex items-center gap-3 border-b py-1.5 text-[13px] row-offscreen last:border-b-0",
          embedded && "px-2"
        )}
      >
        <Link
          to={channelHref}
          tabIndex={-1}
          aria-hidden="true"
          className="flex"
        >
          <ChannelAvatar channel={video.channel} size={28} />
        </Link>
        <div className="grid min-w-0 flex-1 gap-x-4 md:grid-cols-[minmax(0,1fr)_12rem_13rem] md:items-center">
          <div className="min-w-0">{titleLink}</div>
          <div className="flex min-w-0">{channelLink}</div>
          <div className="flex min-w-0 text-muted-foreground">{timeLine}</div>
        </div>
        {menu}
        {placeholderDialog}
      </article>
    )
  }

  return (
    <article
      className={cn(
        "group/card relative flex min-w-0 card-offscreen",
        variant === "list" ? "flex-row gap-3" : "flex-col gap-2.5"
      )}
    >
      {thumbnail}
      {discovery && (
        <div
          className={cn(
            "flex min-w-0 text-xs text-muted-foreground",
            embedded && "px-2"
          )}
        >
          {timeLine}
        </div>
      )}
      <div
        className={cn("flex min-w-0 flex-1 gap-2.5", embedded && "px-2 pb-2")}
      >
        {variant === "grid" && !compact && (
          <Link
            to={channelHref}
            tabIndex={-1}
            aria-hidden="true"
            className="mt-0.5 flex self-start"
          >
            <ChannelAvatar channel={video.channel} size={36} />
          </Link>
        )}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-0.5",
            compact ? "text-xs" : "text-[13px]"
          )}
        >
          {titleLink}
          <div className="flex min-w-0">{channelLink}</div>
          {!discovery && (
            <div className="flex min-w-0 text-muted-foreground">{timeLine}</div>
          )}
          {children}
        </div>
        {menu}
      </div>
      {placeholderDialog}
    </article>
  )
}

export const VideoCard = memo(VideoCardImpl)
