import { lazy, Suspense } from "react"
import { Link, NavLink, useParams } from "react-router"
import { ChannelAvatar } from "@/components/common/channel-avatar"
import { ChannelActions } from "@/components/common/channel-actions"
import { ChannelBanner } from "@/components/common/channel-banner"
import { ChannelOverview } from "@/components/channel/channel-overview"
import { LoadMore } from "@/components/common/load-more"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import { ArrowLeftIcon, ProhibitIcon } from "@/components/icons"
import { ChannelMusicSkeleton } from "@/components/music/skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { underlineTabVariants } from "@/components/ui/tabs"
import { VideoList, VideoListSkeleton } from "@/components/video/video-list"
import { ViewMenu } from "@/components/video/view-menu"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { ApiError } from "@/lib/api"
import {
  useChannel,
  useChannelVideos,
  type ChannelTab,
} from "@/lib/channel-queries"
import { intlLocale, useT } from "@/lib/i18n"
import { flattenPages } from "@/lib/queries"
import type { Channel } from "@/lib/types"
import { formatCount } from "@/lib/time"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"

const ChannelMusic = lazy(() =>
  import("@/components/music/channel-music").then((module) => ({
    default: module.ChannelMusic,
  }))
)

function ChannelVideos({ id, tab }: { id: string; tab: ChannelTab }) {
  const { t } = useT()
  const query = useChannelVideos(id, tab)
  const mode = useSettings((s) => s.homeViewMode)
  const gridSize = useSettings((s) => s.gridSize)
  const scroll = useSettings((s) => s.scrollMode)
  const clips = useSettings((s) => s.clipLangs)
  const blocked = useSettings((s) => s.blockedChannels)
  const videos = flattenPages(
    query.data?.pages.map((items) => ({ items }))
  ).filter(
    (v) =>
      !blocked.some((c) => c.id === v.channel.id) &&
      (tab !== "clips" || !v.lang || !clips.length || clips.includes(v.lang))
  )
  return (
    <section
      aria-label={t(`views.channel.${tab === "videos" ? "video" : tab}`)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t(`views.channel.${tab === "videos" ? "video" : tab}`)}
        </h2>
        <ViewMenu />
      </div>
      {query.isPending ? (
        <VideoListSkeleton mode={mode} gridSize={gridSize} />
      ) : query.isError && !query.data ? (
        <ErrorMessage
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <>
          <VideoList
            videos={videos}
            mode={mode}
            gridSize={gridSize}
            scope={`channel-${id}-${tab}`}
          />
          {!videos.length && (
            <StateMessage
              title={t("views.home.noVideos")}
              description={t("channelPages.emptyTab")}
            />
          )}
        </>
      )}
      {query.isFetchNextPageError && (
        <ErrorMessage
          error={query.error}
          onRetry={() => void query.fetchNextPage()}
        />
      )}
      <LoadMore
        hasMore={!!query.hasNextPage && !query.isFetchNextPageError}
        loading={query.isFetchingNextPage}
        auto={scroll}
        onLoadMore={() => void query.fetchNextPage()}
      />
    </section>
  )
}

/** Only linkify explicit web URLs; descriptions remain text, never HTML. */
function Description({ text }: { text: string }) {
  return (
    <p className="text-sm leading-7 wrap-break-word whitespace-pre-wrap">
      {text.split(/(https?:\/\/[^\s<>]+)/g).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            className="text-brand underline underline-offset-4"
            href={part}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </p>
  )
}

export function ChannelAbout({ channel }: { channel: Channel }) {
  const { t, lang } = useT()
  const stats = [
    ["videoCount", channel.video_count],
    ["clipCount", channel.clip_count],
    ["totalViews", channel.view_count],
  ] as const
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="min-w-0 rounded-xl border bg-card p-5 md:p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {t("views.channel.about")}
        </h2>
        {channel.description ? (
          <Description text={channel.description} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("channelPages.noDescription")}
          </p>
        )}
      </section>
      <aside className="h-fit rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold">
          {t("component.channelInfo.stats")}
        </h2>
        <dl className="space-y-4">
          {stats.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">
                {t(`channelPages.${key}`)}
              </dt>
              <dd className="font-medium tabular-nums">
                {value == null || !Number.isFinite(Number(value))
                  ? "—"
                  : Number(value).toLocaleString(intlLocale(lang))}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  )
}

/** Explains why this channel's own tabs look empty, with the way out beside it. */
function BlockedNotice({ channel }: { channel: Channel }) {
  const { t } = useT()
  const blocked = useSettings((s) =>
    s.blockedChannels.some((c) => c.id === channel.id)
  )
  const toggleBlocked = useSettings((s) => s.toggleBlocked)
  if (!blocked) return null
  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <ProhibitIcon className="size-4 shrink-0" />
      <p className="min-w-0 flex-1">
        {t("component.channelSocials.blockedNotice")}
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => toggleBlocked(channel)}
      >
        {t("component.channelSocials.unblock")}
      </Button>
    </div>
  )
}

export function ChannelPage() {
  const { id = "", tab: routeTab } = useParams()
  const query = useChannel(id)
  const { t, lang } = useT()
  const english = useSettings((s) => s.useEnglishName)
  const channel = query.data
  const name = channel ? channelName(channel, english) : undefined
  const tab = routeTab ?? "overview"
  useDocumentTitle(name)
  if (query.isPending)
    return (
      <main className="p-4 md:p-8">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="my-6 flex items-center gap-4">
          <Skeleton className="size-24 rounded-full" />
          <Skeleton className="h-12 w-64" />
        </div>
        <VideoListSkeleton />
      </main>
    )
  if (query.isError || !channel)
    return (
      <main className="p-4 md:p-8">
        {query.error instanceof ApiError && query.error.status === 404 ? (
          <StateMessage title={t("channelPages.notFound")}>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link to="/channel" />}
            >
              {t("component.mainNav.channels")}
            </Button>
          </StateMessage>
        ) : (
          <ErrorMessage
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        )}
      </main>
    )
  const base = `/channel/${encodeURIComponent(channel.id)}`
  const tabs = [
    { id: "overview", label: t("talentHome.overview") },
    { id: "videos", label: t("views.channel.video") },
    { id: "clips", label: t("views.channel.clips") },
    { id: "collabs", label: t("views.channel.collabs") },
    { id: "music", label: t("views.channel.music") },
    { id: "about", label: t("views.channel.about") },
  ]
  return (
    <main className="mx-auto w-full max-w-[1600px]">
      <div className="relative">
        <ChannelBanner
          channel={channel}
          className="h-28 rounded-b-lg sm:h-52 lg:h-64"
          sizes="(max-width: 1600px) 100vw, 1600px"
        />
        <Link
          to={`/channel?${new URLSearchParams({ org: channel.org ?? "All Vtubers" })}`}
          className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm hover:bg-background"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("component.mainNav.channels")}
        </Link>
      </div>
      <header className="relative border-b bg-background px-4 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5 pt-5 md:pt-6">
          <div className="flex min-w-0 basis-full items-start gap-4 sm:flex-1 sm:basis-auto sm:gap-5">
            <div className="-mt-12 rounded-full ring-[6px] ring-background sm:-mt-14">
              <ChannelAvatar
                channel={channel}
                size={104}
                className="shadow-lg"
              />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {[channel.org, channel.group].filter(Boolean).join(" / ")}
              </p>
              <h1 className="text-2xl font-bold tracking-tight wrap-break-word sm:text-3xl">
                {name}
              </h1>
              {channel.english_name && name !== channel.english_name && (
                <p className="text-sm text-muted-foreground">
                  {channel.english_name}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {channel.subscriber_count != null &&
                Number.isFinite(Number(channel.subscriber_count))
                  ? t("component.channelInfo.subscriberCount", {
                      n: formatCount(channel.subscriber_count, lang),
                    })
                  : t("component.channelInfo.subscriberNA")}
              </p>
            </div>
          </div>
          <ChannelActions channel={channel} />
        </div>
        <BlockedNotice channel={channel} />
        {channel.inactive && (
          <p className="mb-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {t("component.channelInfo.inactiveChannel")}
          </p>
        )}
        <nav
          aria-label={t("channelPages.navigation")}
          className="flex items-center gap-1 overflow-x-auto"
        >
          {tabs.map((item) => (
            <NavLink
              key={item.id}
              end
              to={item.id === "overview" ? base : `${base}/${item.id}`}
              aria-current={tab === item.id ? "page" : undefined}
              className={underlineTabVariants({ active: tab === item.id })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="p-4 md:p-8">
        {tab === "overview" ? (
          <ChannelOverview key={channel.id} channel={channel} />
        ) : tab === "music" ? (
          <Suspense fallback={<ChannelMusicSkeleton />}>
            <ChannelMusic key={channel.id} channel={channel} />
          </Suspense>
        ) : tab === "about" ? (
          <ChannelAbout channel={channel} />
        ) : ["videos", "clips", "collabs"].includes(tab) ? (
          <ChannelVideos
            key={`${channel.id}-${tab}`}
            id={channel.id}
            tab={tab as ChannelTab}
          />
        ) : (
          <StateMessage title={t("channelPages.notFound")} />
        )}
      </div>
    </main>
  )
}
