import { Link } from "react-router"
import { cn } from "cn"
import {
  ArrowSquareOutIcon,
  CaretRightIcon,
  MusicNotesFillIcon,
  PlayIcon,
} from "@/components/icons"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoCard, VideoThumbnail } from "@/components/video/video-card"
import { useChannelVideos } from "@/lib/channel-queries"
import { intlLocale, useT } from "@/lib/i18n"
import { flattenPages, useOrgLive } from "@/lib/queries"
import type { Channel, Video } from "@/lib/types"
import { formatCount } from "@/lib/time"
import { channelName, videoTitle, watchPath } from "@/lib/video"
import { isVideoPlaceholder } from "@/lib/video-source"
import { useSettings } from "@/stores/settings"
import { cardVariants } from "@/components/ui/card"

function recent(videos: Video[]) {
  return videos
    .filter((v) => v.status === "past" && !isVideoPlaceholder(v))
    .sort(
      (a, b) =>
        new Date(b.available_at ?? b.published_at ?? 0).getTime() -
        new Date(a.available_at ?? a.published_at ?? 0).getTime()
    )
}

function Shelf({
  title,
  subtitle,
  videos,
  href,
}: {
  title: string
  subtitle: string
  videos: Video[]
  href: string
}) {
  const { t } = useT()
  if (!videos.length) return null
  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          to={href}
          className="flex shrink-0 items-center gap-1 rounded-md py-2 text-xs font-medium text-brand hover:underline"
        >
          {t("talentHome.viewAll")}
          <CaretRightIcon className="size-3" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {videos.slice(0, 3).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  )
}

export function ChannelOverview({ channel }: { channel: Channel }) {
  const { t, lang } = useT()
  const english = useSettings((s) => s.useEnglishName)
  const clipLangs = useSettings((s) => s.clipLangs)
  const blocked = useSettings((s) => s.blockedChannels)
  const hideMissing = useSettings((s) => s.hideMissing)
  const hidePlaceholder = useSettings((s) => s.hidePlaceholder)
  const hideThumbnail = useSettings((s) => s.hideThumbnail)
  const uploads = useChannelVideos(channel.id, "videos")
  const clips = useChannelVideos(channel.id, "clips")
  const collabs = useChannelVideos(channel.id, "collabs")
  const schedule = useOrgLive(channel.org ?? "All Vtubers")
  const visible = (video: Video) =>
    !blocked.some((c) => c.id === video.channel.id) &&
    !(hideMissing && video.status === "missing")
  const items = (pages: Video[][] | undefined) =>
    flattenPages(pages?.map((items) => ({ items }))).filter(visible)
  const latest = recent(items(uploads.data?.pages))
  const recentClips = recent(items(clips.data?.pages)).filter(
    (v) => !v.lang || !clipLangs.length || clipLangs.includes(v.lang)
  )
  const recentCollabs = recent(items(collabs.data?.pages))
  const music = latest.filter(
    (v) =>
      Number(v.songcount) > 0 ||
      /^(music|singing|karaoke|original_song|cover)$/.test(v.topic_id ?? "")
  )
  const streams = (schedule.data ?? []).filter(
    (v) =>
      v.channel.id === channel.id &&
      visible(v) &&
      (!hidePlaceholder || !isVideoPlaceholder(v)) &&
      (v.status === "live" || v.status === "upcoming")
  )
  const onAir = streams.find((v) => v.status === "live")
  const next = streams
    .filter((v) => v.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.start_scheduled ?? a.available_at ?? 0).getTime() -
        new Date(b.start_scheduled ?? b.available_at ?? 0).getTime()
    )[0]
  // Placeholders retain the shared card's source-aware event/dialog behavior.
  const spotlight =
    onAir ?? next ?? latest[0] ?? recentClips[0] ?? recentCollabs[0]
  const label =
    spotlight?.status === "live"
      ? "liveNow"
      : spotlight?.status === "upcoming"
        ? "upNext"
        : latest[0]
          ? "latestUpload"
          : recentClips[0]
            ? "recentClip"
            : "recentCollab"
  const base = `/channel/${encodeURIComponent(channel.id)}`
  const name = channelName(channel, english)
  const time = spotlight?.start_scheduled ?? spotlight?.available_at
  const date =
    time && Number.isFinite(new Date(time).getTime())
      ? new Intl.DateTimeFormat(intlLocale(lang), {
          dateStyle: "medium",
          timeStyle: spotlight?.status === "upcoming" ? "short" : undefined,
        }).format(new Date(time))
      : null
  const pending =
    uploads.isPending ||
    schedule.isPending ||
    clips.isPending ||
    collabs.isPending
  const failures = [uploads, clips, collabs, schedule].filter((q) => q.isError)
  const hasShelves = !!(
    latest.length ||
    recentClips.length ||
    recentCollabs.length ||
    pending
  )
  return (
    <div className="space-y-9">
      <section
        aria-labelledby="talent-start"
        className={cn(cardVariants({ radius: "2xl" }), "overflow-hidden")}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4 md:px-6">
          <h2
            id="talent-start"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-brand">
              <PlayIcon className="size-3" />
            </span>
            {t("talentHome.startWatching")}
          </h2>
        </div>
        {spotlight ? (
          isVideoPlaceholder(spotlight) ? (
            <div className="p-5">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                {t(`talentHome.${label}`)}
              </p>
              <VideoCard video={spotlight} />
            </div>
          ) : (
            <div
              className={cn(
                "grid",
                !hideThumbnail && "md:grid-cols-[1.15fr_1fr]"
              )}
            >
              {!hideThumbnail && (
                <Link
                  to={watchPath(spotlight.id)}
                  className="group relative block aspect-video overflow-hidden bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={videoTitle(spotlight, english)}
                >
                  <VideoThumbnail
                    video={spotlight}
                    sizes="(min-width: 768px) 720px, 100vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
                  <span className="absolute bottom-4 left-4 flex size-11 items-center justify-center rounded-full bg-background/95 text-foreground shadow-lg transition-transform group-hover:scale-110">
                    <PlayIcon className="size-5" />
                  </span>
                </Link>
              )}
              <div className="flex flex-col justify-center p-4 md:p-7 lg:p-8">
                <p
                  className={cn(
                    "mb-3 flex items-center gap-2 text-xs font-medium",
                    onAir ? "text-live" : "text-muted-foreground"
                  )}
                >
                  {onAir && <span className="size-2 rounded-full bg-live" />}
                  {t(`talentHome.${label}`)}
                </p>
                <Link
                  to={watchPath(spotlight.id)}
                  className="line-clamp-2 text-lg leading-snug font-semibold tracking-tight hover:text-brand md:line-clamp-3 md:text-xl lg:text-2xl"
                >
                  {videoTitle(spotlight, english)}
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  {[spotlight.topic_id?.replace(/_/g, " "), date]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <Link
                  to={watchPath(spotlight.id)}
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 md:mt-6"
                >
                  <PlayIcon className="size-4" />
                  {t(
                    onAir
                      ? "talentHome.joinStream"
                      : next
                        ? "talentHome.openStream"
                        : "talentHome.watchVideo"
                  )}
                  <CaretRightIcon className="size-3" />
                </Link>
              </div>
            </div>
          )
        ) : pending ? (
          <Skeleton className="h-64 w-full rounded-none" />
        ) : (
          <StateMessage
            title={t("talentHome.noVideos")}
            description={t("talentHome.noVideosHint")}
          >
            <a
              href={`https://www.youtube.com/channel/${channel.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {t("talentHome.officialChannel")}
              <ArrowSquareOutIcon className="size-3" />
            </a>
          </StateMessage>
        )}
      </section>
      {failures.length > 0 && (
        <ErrorMessage
          error={failures[0].error}
          onRetry={() => {
            failures.forEach((q) => void q.refetch())
          }}
        />
      )}
      <div
        className={cn(
          "grid items-start gap-8 xl:gap-10",
          hasShelves && "lg:grid-cols-[minmax(0,1fr)_17rem]"
        )}
      >
        {hasShelves && (
          <div className="min-w-0 space-y-9">
            <Shelf
              title={t("talentHome.recentUploads")}
              subtitle={t("talentHome.uploadsHint")}
              videos={latest}
              href={`${base}/videos`}
            />
            <Shelf
              title={t("talentHome.clipsTitle")}
              subtitle={t("talentHome.clipsHint")}
              videos={recentClips}
              href={`${base}/clips`}
            />
            <Shelf
              title={t("talentHome.collabsTitle")}
              subtitle={t("talentHome.collabsHint")}
              videos={recentCollabs}
              href={`${base}/collabs`}
            />
            {pending && !spotlight && (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            )}
          </div>
        )}
        <aside
          className={cn(
            hasShelves ? "space-y-5" : "grid items-start gap-5 md:grid-cols-2"
          )}
        >
          <section className={cn(cardVariants({ radius: "2xl" }), "p-5")}>
            <h2 className="mb-3 text-lg font-semibold">{name}</h2>
            {channel.description ? (
              <p className="line-clamp-5 text-sm leading-6 wrap-break-word whitespace-pre-line text-muted-foreground">
                {channel.description}
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                {t("talentHome.exploreHint")}
              </p>
            )}
            <Link
              to={`${base}/about`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              {t("talentHome.fullProfile")}
              <CaretRightIcon className="size-3" />
            </Link>
            {!!channel.top_topics?.length && (
              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                {channel.top_topics.slice(0, 8).map((topic) => (
                  <Link
                    key={topic}
                    to={`/search?${new URLSearchParams({ ch: channel.id, topic })}`}
                    className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground capitalize hover:bg-accent"
                  >
                    {topic.replace(/_/g, " ")}
                  </Link>
                ))}
              </div>
            )}
            {(channel.video_count != null || channel.clip_count != null) && (
              <dl className="mt-5 flex gap-7 border-t pt-4">
                {(
                  [
                    ["videoCount", channel.video_count],
                    ["clipCount", channel.clip_count],
                  ] as const
                )
                  .filter(
                    ([, value]) =>
                      value != null && Number.isFinite(Number(value))
                  )
                  .map(([key, value]) => (
                    <div key={key}>
                      <dd className="text-lg font-semibold tabular-nums">
                        {formatCount(Number(value), lang)}
                      </dd>
                      <dt className="text-[11px] text-muted-foreground">
                        {t(`channelPages.${key}`)}
                      </dt>
                    </div>
                  ))}
              </dl>
            )}
          </section>
          <section className="overflow-hidden rounded-2xl border bg-linear-to-br from-primary/10 via-card to-complement/10 p-5">
            <MusicNotesFillIcon className="mb-5 size-7 text-brand" />
            <h2 className="font-semibold">{t("talentHome.musicTitle")}</h2>
            {music[0] && (
              <div className="">
                <p className="mb-2 text-xs text-muted-foreground">
                  {t("talentHome.recentMusic")}
                </p>
                <VideoCard video={music[0]} compact />
              </div>
            )}
            <Link
              to={`/channel/${encodeURIComponent(channel.id)}/music`}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand hover:underline"
            >
              {t("talentHome.openMusicdex")}
              <CaretRightIcon className="size-3" />
            </Link>
          </section>
          {!onAir && !next && !schedule.isPending && !schedule.isError && (
            <p className="px-2 text-xs leading-5 text-muted-foreground">
              {t("talentHome.noSchedule")}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
