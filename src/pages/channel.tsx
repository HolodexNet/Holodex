import { useState } from "react"
import { Link, NavLink, useParams } from "react-router"
import { cn } from "cn"
import { ChannelAvatar } from "@/components/common/channel-avatar"
import { ChannelActions } from "@/components/common/channel-actions"
import { LoadMore } from "@/components/common/load-more"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import { ArrowLeftIcon, ArrowSquareOutIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoList, VideoListSkeleton } from "@/components/video/video-list"
import { ViewMenu } from "@/components/video/view-menu"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { ApiError } from "@/lib/api"
import {
  useChannel,
  useChannelVideos,
  type ChannelTab,
} from "@/lib/channel-queries"
import { musicdexURL } from "@/lib/consts"
import { intlLocale, useT } from "@/lib/i18n"
import { formatCount } from "@/lib/time"
import { flattenPages } from "@/lib/queries"
import type { Channel } from "@/lib/types"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"

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
    <p className="text-sm leading-7 break-words whitespace-pre-wrap">
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

export function ChannelPage() {
  const { id = "", tab: routeTab } = useParams()
  const query = useChannel(id)
  const { t, lang } = useT()
  const english = useSettings((s) => s.useEnglishName)
  const [failedBanner, setFailedBanner] = useState<string | null>(null)
  const channel = query.data
  const name = channel ? channelName(channel, english) : undefined
  const tab = routeTab ?? "videos"
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
  const banner =
    channel.banner && /^https?:\/\//.test(channel.banner)
      ? /^https:\/\/(yt3\.googleusercontent\.com|yt3\.ggpht\.com)\//.test(
          channel.banner
        )
        ? `${channel.banner.split("=")[0]}=w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`
        : channel.banner
      : null
  const tabs = [
    { id: "videos", label: t("views.channel.video") },
    { id: "clips", label: t("views.channel.clips") },
    { id: "collabs", label: t("views.channel.collabs") },
    { id: "about", label: t("views.channel.about") },
  ]
  return (
    <main className="mx-auto w-full max-w-[1600px]">
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 via-muted to-complement/20 sm:h-48 lg:h-60">
        {banner && failedBanner !== banner && (
          <img
            src={banner}
            alt=""
            referrerPolicy="no-referrer"
            className="size-full object-cover"
            onError={() => setFailedBanner(banner)}
          />
        )}
        <Link
          to={`/channel?${new URLSearchParams({ org: channel.org ?? "All Vtubers" })}`}
          className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm hover:bg-background"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("component.mainNav.channels")}
        </Link>
      </div>
      <header className="border-b bg-background px-4 pt-5 md:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-5">
          <div className="flex w-full min-w-0 items-center gap-4 sm:w-auto">
            <ChannelAvatar
              channel={channel}
              size={88}
              className="ring-4 ring-background"
            />
            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {[channel.org, channel.group].filter(Boolean).join(" / ")}
              </p>
              <h1 className="text-xl font-bold break-words sm:text-2xl">
                {name}
              </h1>
              {channel.english_name && name !== channel.english_name && (
                <p className="text-sm text-muted-foreground">
                  {channel.english_name}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {channel.subscriber_count != null
                  ? t("component.channelInfo.subscriberCount", {
                      n: formatCount(channel.subscriber_count, lang),
                    })
                  : t("component.channelInfo.subscriberNA")}
              </p>
            </div>
          </div>
          <ChannelActions channel={channel} />
        </div>
        {channel.inactive && (
          <p className="mb-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {t("component.channelInfo.inactiveChannel")}
          </p>
        )}
        {!!channel.top_topics?.length && (
          <div className="mb-4 flex flex-wrap gap-2">
            {channel.top_topics.map((topic) => (
              <Link
                key={topic}
                to={`/search?${new URLSearchParams({ ch: channel.id, topic })}`}
                className="rounded-full border bg-muted/40 px-3 py-1 text-xs capitalize hover:bg-accent"
              >
                {topic.replace(/_/g, " ")}
              </Link>
            ))}
          </div>
        )}
        <nav
          aria-label={t("channelPages.navigation")}
          className="flex items-center gap-1 overflow-x-auto"
        >
          {tabs.map((item) => (
            <NavLink
              key={item.id}
              end
              to={item.id === "videos" ? base : `${base}/${item.id}`}
              aria-current={tab === item.id ? "page" : undefined}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab === item.id
                  ? "border-primary text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href={`${musicdexURL}/channel/${channel.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            {t("views.channel.music")}
            <ArrowSquareOutIcon className="size-3" />
          </a>
        </nav>
      </header>
      <div className="p-4 md:p-8">
        {tab === "about" ? (
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
