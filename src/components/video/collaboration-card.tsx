import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { EyeIcon, VideoCameraIcon } from "@/components/icons"
import { useT } from "@/lib/i18n"
import { formatCount } from "@/lib/time"
import type { Video } from "@/lib/types"
import { channelName, videoThumbnail, videoTitle, watchPath } from "@/lib/video"
import { useSettings } from "@/stores/settings"
import {
  THUMBNAIL_SIZES,
  VideoCard,
  VideoThumbnail,
  type VideoCardVariant,
} from "./video-card"

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
      className="collaboration-card grid min-w-0 items-start overflow-hidden rounded-xl border border-brand/20 bg-card"
      data-collaboration-size={videos.length}
      data-variant={variant}
    >
      <div className="min-w-0">
        <VideoCard
          video={primary}
          variant={variant}
          compact={compact}
          discovery={discovery}
          embedded
        >
          {renderExtra?.(primary)}
        </VideoCard>
      </div>
      <div
        className="collaboration-perspectives @container/perspectives relative min-h-0 min-w-0 overflow-hidden bg-primary/3"
        role="group"
        aria-label={tc("views.home.collabPerspectives", videos.length)}
      >
        <div className="collaboration-perspectives-content inset-0 flex min-h-0 flex-col">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 pt-3 pb-2 text-[11px]">
            <span
              className="flex shrink-0 items-center gap-1.5 font-semibold whitespace-nowrap text-brand"
              title={tc("views.home.collabPerspectives", videos.length)}
            >
              <VideoCameraIcon className="size-4 shrink-0" aria-hidden="true" />
              {/* Labels appear as the panel widens: perspectives first, then viewers. */}
              <span
                aria-hidden="true"
                className="@min-[12rem]/perspectives:hidden"
              >
                {videos.length}
              </span>
              <span className="sr-only @min-[12rem]/perspectives:not-sr-only">
                {tc("views.home.collabPerspectives", videos.length)}
              </span>
            </span>
            {primary.status === "live" && viewers > 0 && (
              <span className="whitespace-nowrap text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="inline-flex items-center gap-1 @min-[17rem]/perspectives:hidden"
                >
                  <EyeIcon className="size-3.5 shrink-0" />
                  {formatCount(viewers, lang)}
                </span>
                <span className="sr-only @min-[17rem]/perspectives:not-sr-only">
                  {t("views.home.collabViewers", [formatCount(viewers, lang)])}
                </span>
              </span>
            )}
          </div>
          <div className="collaboration-perspectives-list flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain px-2 pb-2">
            {videos.map((video) => {
              const name = channelName(video.channel, preferEnglish)
              const selected = primary.id === video.id
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
                    "relative flex min-w-0 shrink-0 items-center gap-2 rounded-lg border transition-colors motion-reduce:transition-none",
                    variant === "dense" ? "px-1 py-0.5" : "p-1",
                    selected
                      ? "border-brand/30 bg-brand/10"
                      : "border-transparent focus-within:bg-primary/5 hover:bg-primary/5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(video.id)}
                    aria-pressed={selected}
                    aria-label={t("views.home.previewPerspective", [name])}
                    title={t("views.home.previewPerspective", [name])}
                    className={cn(
                      "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      variant === "dense"
                        ? "size-7 rounded-full"
                        : hideThumbnail
                          ? "size-9 rounded-full"
                          : "aspect-video w-[clamp(2.75rem,30cqi,5rem)] rounded-md"
                    )}
                  >
                    {hideThumbnail || variant === "dense" ? (
                      <ChannelAvatar
                        channel={video.channel}
                        size={variant === "dense" ? 28 : 36}
                      />
                    ) : (
                      <VideoThumbnail video={video} />
                    )}
                  </button>
                  <Link
                    to={watchPath(video.id)}
                    aria-label={t("views.home.watchPerspective", [name])}
                    title={videoTitle(video, preferEnglish)}
                    className="min-w-0 flex-1 text-xs leading-snug outline-none hover:text-brand focus-visible:underline"
                  >
                    <span
                      className={cn(
                        "block truncate font-medium",
                        selected && "text-brand"
                      )}
                    >
                      {name}
                    </span>
                    {variant !== "dense" && (
                      <span className="mt-0.5 hidden text-[11px] leading-snug text-muted-foreground @min-[12rem]/perspectives:line-clamp-2">
                        {videoTitle(video, preferEnglish)}
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
