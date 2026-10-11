import { useId, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"

import { FeedFilters } from "@/components/common/feed-filters"
import { LoadMore } from "@/components/common/load-more"
import { SimpleSelect } from "@/components/common/simple-select"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  HeartIcon,
  SlidersHorizontalIcon,
  TelevisionSimpleIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoList, VideoListSkeleton } from "@/components/video/video-list"
import { ViewMenu } from "@/components/video/view-menu"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { ALL_VTUBERS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import {
  flattenPages,
  useFavorites,
  useFavoritesLive,
  useOrgLive,
  useVideoFeed,
} from "@/lib/queries"
import type { Video } from "@/lib/types"
import { createVideoFilter } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"

type HomeTab = "live" | "archive" | "clips"
type LiveSort = "latest" | "viewers"

const TAB_BY_HASH: Record<string, HomeTab> = {
  "#archive": "archive",
  "#clips": "clips",
}

function FilterPopover({
  tab,
  liveSort,
  onLiveSort,
  before,
  onBefore,
}: {
  tab: HomeTab
  liveSort: LiveSort
  onLiveSort: (sort: LiveSort) => void
  before: string
  onBefore: (date: string) => void
}) {
  const { t } = useT()
  const sortId = useId()
  const dateId = useId()
  const filterCount = useSettings(
    (s) =>
      s.ignoredTopics.length +
      Number(s.hideCollabStreams) +
      Number(s.hidePlaceholder) +
      Number(s.hideMissing)
  )
  const active = filterCount + (tab !== "live" && before ? 1 : 0)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={t("views.home.filters")}
          />
        }
      >
        <SlidersHorizontalIcon />
        {active > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] gap-3">
        {tab === "live" ? (
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={sortId} className="text-sm font-medium">
              {t("views.search.sortByLabel")}
            </label>
            <SimpleSelect<LiveSort>
              id={sortId}
              size="sm"
              value={liveSort}
              onChange={onLiveSort}
              options={[
                { value: "latest", label: t("views.home.sortStartTime") },
                { value: "viewers", label: t("views.home.sortViewers") },
              ]}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={dateId} className="text-sm font-medium">
              {t("views.home.uploadedBefore")}
            </label>
            <Input
              id={dateId}
              type="date"
              value={before}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => onBefore(event.target.value)}
              className="w-auto"
            />
          </div>
        )}
        <Separator />
        <FeedFilters />
      </PopoverContent>
    </Popover>
  )
}

/** Same-time ties put real streams ahead of placeholders. */
function sortUpcoming(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => {
    if (a.available_at !== b.available_at) return 0
    return (
      Number(a.type === "placeholder") - Number(b.type === "placeholder")
    )
  })
}

export function HomePage({ favorites = false }: { favorites?: boolean }) {
  const { t } = useT()
  const location = useLocation()
  const navigate = useNavigate()

  const tab = TAB_BY_HASH[location.hash] ?? "live"
  const [liveSort, setLiveSort] = useState<LiveSort>("latest")
  const [before, setBefore] = useState("")

  const loggedIn = useAuth((s) => !!s.jwt)
  const orgName = useOrgStore((s) => s.currentOrg.name)
  const settings = useSettings()
  const { homeViewMode: mode, gridSize, scrollMode } = settings

  const { favorites: favoriteChannels, isPending: favoritesPending } =
    useFavorites()
  const hasFavorites = favoriteChannels.length > 0
  // The favorites feed is unfiltered when the list is empty, so never ask.
  const feedEnabled = !favorites || (loggedIn && hasFavorites)

  useDocumentTitle(favorites ? t("component.mainNav.favorites") : null)

  const orgLive = useOrgLive(orgName, !favorites)
  const favoritesLive = useFavoritesLive(favorites && hasFavorites)
  const live = favorites ? favoritesLive : orgLive

  const {
    blockedChannels,
    ignoredTopics,
    hiddenGroups,
    hidePlaceholder,
    hideMissing,
    hideCollabStreams,
  } = settings
  const filter = useMemo(
    () =>
      createVideoFilter({
        settings: {
          blockedChannels,
          ignoredTopics,
          hiddenGroups,
          hidePlaceholder,
          hideMissing,
        },
        favoriteIds: new Set(favoriteChannels.map((f) => f.id)),
        org: favorites ? null : orgName,
        // Clips are always about someone else; the collab filter is for streams.
        hideCollabs:
          tab !== "clips" &&
          hideCollabStreams &&
          (favorites || orgName !== ALL_VTUBERS),
      }),
    [
      blockedChannels,
      ignoredTopics,
      hiddenGroups,
      hidePlaceholder,
      hideMissing,
      hideCollabStreams,
      favoriteChannels,
      favorites,
      orgName,
      tab,
    ]
  )

  const liveVideos = useMemo(() => {
    const visible = (live.data ?? []).filter(filter)
    const sorted =
      liveSort === "viewers"
        ? [...visible].sort(
            (a, b) => (b.live_viewers ?? 0) - (a.live_viewers ?? 0)
          )
        : visible
    return {
      all: sorted,
      live: sorted.filter((v) => v.status === "live"),
      upcoming: sortUpcoming(sorted.filter((v) => v.status === "upcoming")),
    }
  }, [live.data, filter, liveSort])

  const feed = useVideoFeed(
    {
      org: favorites ? undefined : orgName,
      type: tab === "clips" ? "clip" : "stream",
      status: tab === "clips" ? "past" : "past,missing",
      include: tab === "clips" ? "mentions" : "mentions,clips",
      // Only clips carry a language.
      lang: tab === "clips" ? settings.clipLangs.join(",") : undefined,
      to: before ? nextDayIso(before) : undefined,
      // Keeps far-future "missing" frames out of the archive.
      max_upcoming_hours: 1,
    },
    { favorites, enabled: tab !== "live" && feedEnabled }
  )
  const feedVideos = useMemo(
    () => flattenPages(feed.data?.pages).filter(filter),
    [feed.data, filter]
  )

  const setTab = (next: HomeTab) => {
    window.scrollTo({ top: 0 })
    void navigate(
      { search: location.search, hash: next === "live" ? "" : next },
      { replace: true }
    )
  }

  // "Live / Upcoming" is one translated string; split it to place the counts.
  const [, liveLabel, upcomingLabel] =
    /^(.+?)\s*([/／・].+)$/.exec(t("views.home.liveOrUpcomingHeading")) ?? []

  const toolbar = (
    <div className="sticky top-[calc(var(--header-height)+env(safe-area-inset-top,0px))] z-30 -mx-3 flex items-center border-b bg-background/85 px-3 backdrop-blur-md md:-mx-6 md:px-6">
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as HomeTab)}
        className="min-w-0 flex-1"
      >
        <TabsList variant="line" className="h-11! w-full justify-start gap-2 overflow-x-auto sm:w-fit sm:gap-3">
          <TabsTrigger value="live" className="flex-none px-1">
            {liveLabel ?? t("views.home.liveOrUpcomingHeading")}
            <CountBadge value={liveVideos.live.length} live />
            {upcomingLabel}
            {upcomingLabel && <CountBadge value={liveVideos.upcoming.length} />}
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex-none px-1">
            {t("views.home.recentVideoToggles.official")}
          </TabsTrigger>
          <TabsTrigger value="clips" className="flex-none px-1">
            {t("views.home.recentVideoToggles.subber")}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <FilterPopover
        tab={tab}
        liveSort={liveSort}
        onLiveSort={setLiveSort}
        before={before}
        onBefore={setBefore}
      />
      <ViewMenu />
    </div>
  )

  let content: React.ReactNode
  if (favorites && !loggedIn) {
    content = (
      <StateMessage
        icon={<HeartIcon />}
        title={t("component.mainNav.favorites")}
        description={t("views.favorites.promptForAction")}
      >
        <Button nativeButton={false} render={<Link to="/login" />}>
          {t("component.mainNav.login")}
        </Button>
      </StateMessage>
    )
  } else if (favorites && favoritesPending) {
    content = <VideoListSkeleton mode={mode} gridSize={gridSize} />
  } else if (favorites && !hasFavorites) {
    content = (
      <StateMessage
        icon={<HeartIcon />}
        title={t("views.channels.favoritesAreEmpty")}
        description={t("views.favorites.promptForAction")}
      >
        <Button nativeButton={false} render={<Link to="/channel" />}>
          {t("views.favorites.manageFavorites")}
        </Button>
      </StateMessage>
    )
  } else if (tab === "live") {
    if (live.isPending) {
      content = <VideoListSkeleton mode={mode} gridSize={gridSize} />
    } else if (live.isError && !live.data) {
      content = <ErrorMessage error={live.error} onRetry={() => live.refetch()} />
    } else if (liveVideos.all.length === 0) {
      content = (
        <StateMessage
          icon={<TelevisionSimpleIcon />}
          title={t("views.home.noStreams")}
        />
      )
    } else if (mode !== "grid") {
      content = <VideoList videos={liveVideos.all} mode={mode} />
    } else {
      // The grid keeps what is on air apart from what is scheduled.
      content = (
        <>
          {liveVideos.live.length > 0 && (
            <VideoList videos={liveVideos.live} gridSize={gridSize} />
          )}
          {liveVideos.live.length > 0 && liveVideos.upcoming.length > 0 && (
            <Separator className="my-6" />
          )}
          <VideoList videos={liveVideos.upcoming} gridSize={gridSize} />
        </>
      )
    }
  } else if (feed.isPending) {
    content = <VideoListSkeleton mode={mode} gridSize={gridSize} count={24} />
  } else if (feed.isError && !feed.data) {
    content = <ErrorMessage error={feed.error} onRetry={() => feed.refetch()} />
  } else {
    content = (
      <>
        {feedVideos.length === 0 && !feed.hasNextPage ? (
          <StateMessage
            icon={<TelevisionSimpleIcon />}
            title={t("views.home.noVideos")}
          />
        ) : (
          <VideoList videos={feedVideos} mode={mode} gridSize={gridSize} />
        )}
        <LoadMore
          hasMore={!!feed.hasNextPage}
          loading={feed.isFetchingNextPage}
          onLoadMore={() => void feed.fetchNextPage()}
          auto={scrollMode}
        />
      </>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-3 pb-8 md:px-6">
      {toolbar}
      <div className="flex flex-1 flex-col pt-4">{content}</div>
    </div>
  )
}

function CountBadge({ value, live = false }: { value: number; live?: boolean }) {
  return (
    <span
      className={
        live && value > 0
          ? "min-w-5 rounded-md bg-live px-1 text-center text-xs leading-5 font-medium text-white tabular-nums"
          : "min-w-5 rounded-md bg-muted px-1 text-center text-xs leading-5 font-medium text-muted-foreground tabular-nums"
      }
    >
      {value}
    </span>
  )
}

/** Start of the day after a `YYYY-MM-DD` date: an exclusive upper bound. */
function nextDayIso(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d + 1).toISOString()
}
