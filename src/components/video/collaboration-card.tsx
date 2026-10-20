import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { UsersThreeIcon } from "@/components/icons"
import { useT } from "@/lib/i18n"
import { formatCount } from "@/lib/time"
import type { Video } from "@/lib/types"
import { channelName, videoThumbnail, videoTitle, watchPath } from "@/lib/video"
import { useSettings } from "@/stores/settings"
import { THUMBNAIL_SIZES, VideoCard, type VideoCardVariant } from "./video-card"

/**
 * Hover previews only while the list sits beside the preview. Stacked below
 * it, a preview of a different height moves the rows under a still pointer,
 * which re-targets the hover and makes the selection oscillate.
 */
function isBesidePreview(row: HTMLElement) {
  const panel = row.closest(".collaboration-perspectives")
  const preview = panel?.previousElementSibling
  if (!panel || !preview) return false
  return (
    panel.getBoundingClientRect().top < preview.getBoundingClientRect().bottom
  )
}

/** One card, with a selectable preview and a direct watch link for every POV. */
export function CollaborationCard({
  videos,
  variant,
  compact,
  discovery,
  renderExtra,
}: {
  videos: Video[]
  variant: VideoCardVariant
  compact: boolean
  discovery: boolean
  renderExtra?: (video: Video) => ReactNode
}) {
  const { t, tc, lang } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const hideThumbnail = useSettings((s) => s.hideThumbnail)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const primary = videos.find((video) => video.id === selectedId) ?? videos[0]
  const viewers = videos.reduce(
    (sum, video) => sum + (video.live_viewers ?? 0),
    0
  )

  // Warm the same thumbnail candidates used by VideoCard for instant previews.
  useEffect(() => {
    if (hideThumbnail || variant === "dense") return
    for (const video of videos) {
      const { src, srcSet } = videoThumbnail(video)
      const thumbnail = new Image()
      thumbnail.referrerPolicy = "no-referrer"
      thumbnail.sizes = THUMBNAIL_SIZES
      if (srcSet) thumbnail.srcset = srcSet
      thumbnail.src = src
    }
  }, [videos, hideThumbnail, variant])

  return (
    <div
      className="collaboration-card grid min-w-0 items-start gap-3"
      data-collaboration-size={videos.length}
      data-variant={variant}
    >
      <VideoCard
        video={primary}
        variant={variant}
        compact={compact}
        discovery={discovery}
      >
        {renderExtra?.(primary)}
      </VideoCard>
      <div
        className="collaboration-perspectives relative min-h-0 overflow-hidden rounded-lg border border-brand/20 bg-primary/5"
        role="group"
        aria-label={tc("views.home.collabPerspectives", videos.length)}
      >
        <div className="absolute inset-0 flex min-h-0 flex-col">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-brand/10 px-3 py-2.5 text-[11px]">
            <span className="flex items-center gap-1 font-medium text-brand">
              <UsersThreeIcon className="size-3.5" />
              {tc("views.home.collabPerspectives", videos.length)}
            </span>
            {primary.status === "live" && viewers > 0 && (
              <span className="text-muted-foreground">
                {t("views.home.collabViewers", [formatCount(viewers, lang)])}
              </span>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-1">
            {videos.map((video) => {
              const name = channelName(video.channel, preferEnglish)
              return (
                <div
                  key={video.id}
                  // Move, not enter: scrolling under a still pointer is no intent.
                  onPointerMove={(event) => {
                    if (
                      event.pointerType !== "touch" &&
                      primary.id !== video.id &&
                      isBesidePreview(event.currentTarget)
                    )
                      setSelectedId(video.id)
                  }}
                  onFocusCapture={() => setSelectedId(video.id)}
                  className={cn(
                    "flex min-w-0 shrink-0 items-center gap-2 rounded-md p-1 focus-within:bg-primary/10 hover:bg-primary/10",
                    primary.id === video.id && "bg-primary/10"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(video.id)}
                    aria-pressed={primary.id === video.id}
                    aria-label={t("views.home.previewPerspective", [name])}
                    title={t("views.home.previewPerspective", [name])}
                    className="group/preview inline-flex size-9 shrink-0 items-center justify-center rounded-full outline-none hover:bg-muted"
                  >
                    <ChannelAvatar
                      channel={video.channel}
                      size={28}
                      className="group-focus-visible/preview:ring-2 group-focus-visible/preview:ring-ring"
                    />
                  </button>
                  <Link
                    to={watchPath(video.id)}
                    aria-label={t("views.home.watchPerspective", [name])}
                    title={videoTitle(video, preferEnglish)}
                    className="min-w-0 flex-1 py-1 text-xs leading-snug outline-none hover:text-brand focus-visible:underline"
                  >
                    <span className="line-clamp-2 wrap-anywhere">{name}</span>
                    {video.status === "live" && video.live_viewers != null && (
                      <span className="block text-[10px] text-muted-foreground tabular-nums">
                        {formatCount(video.live_viewers, lang)}
                      </span>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
