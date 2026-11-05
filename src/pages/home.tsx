import { lazy, Suspense, useId, useMemo, useState } from "react"
import { Link, useLocation } from "react-router"

import { FeedFilters, SwitchRow } from "@/components/common/feed-filters"
import { LoadMore } from "@/components/common/load-more"
import { SimpleSelect } from "@/components/common/simple-select"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  HeartIcon,
  CalendarBlankIcon,
  SlidersHorizontalIcon,
  TelevisionSimpleIcon,
} from "@/components/icons"
import {
  HomeTabsLayout,
  MusicSearchLink,
  TAB_BY_HASH,
  type HomeTab,
} from "@/components/layout/home-tabs-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { VideoList, VideoListSkeleton } from "@/components/video/video-list"
import { ViewMenu } from "@/components/video/view-menu"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { ALL_VTUBERS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { isMusicTabHash } from "@/lib/music-route"
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

type LiveSort = "latest" | "viewers"

const MusicHomeTab = lazy(() =>
  import("@/pages/music/home").then((module) => ({
    default: module.MusicHomeTab,
  }))
)
const MusicFavoritesTab = lazy(() =>
  import("@/pages/music/home").then((module) => ({
    default: module.MusicFavoritesTab,
  }))
)
const MusicRadiosTab = lazy(() =>
  import("@/pages/music/home").then((module) => ({
    default: module.MusicRadiosTab,
  }))
)
const MusicLibraryTab = lazy(() =>
  import("@/pages/music/library").then((module) => ({
    default: module.MusicLibraryTab,
  }))
)

function LiveSortControl({
  value,
  onChange,
}: {
  value: LiveSort
  onChange: (sort: LiveSort) => void
}) {
  const { t } = useT()
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={id} className="shrink-0 text-xs text-muted-foreground">
        {t("views.search.sortByLabel")}
      </label>
      <SimpleSelect<LiveSort>
        id={id}
        size="sm"
        variant="text"
        className="text-xs"
        value={value}
        onChange={onChange}
        options={[
          { value: "latest", label: t("views.home.sortStartTime") },
          { value: "viewers", label: t("views.home.sortViewers") },
        ]}
      />
    </div>
  )
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
  const dateId = useId()
  const collateCollabs = useSettings((s) => s.collateCollabs)
  const set = useSettings((s) => s.set)
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
      <PopoverContent
        align="end"
        className="w-[min(22rem,calc(100vw-1.5rem))] gap-3"
      >
        {tab === "live" ? (
          <div className="xl:hidden">
            <LiveSortControl value={liveSort} onChange={onLiveSort} />
            <SwitchRow
              label={t("views.home.collateCollabs")}
              description={t("views.home.collateCollabsHint")}
              checked={collateCollabs}
              onChange={(value) => set("collateCollabs", value)}
            />
            <Separator className="mt-2" />
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
        {tab !== "live" && <Separator />}
        <FeedFilters />
      </PopoverContent>
    </Popover>
  )
}

/** Same-time ties put real streams ahead of placeholders. */
function sortUpcoming(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => {
    if (a.available_at !== b.available_at) return 0
    return Number(a.type === "placeholder") - Number(b.type === "placeholder")
  })
}

export function HomePage({ favorites = false }: { favorites?: boolean }) {
  const { t } = useT()
  const location = useLocation()

  const tab = TAB_BY_HASH[location.hash] ?? "live"
  const musicTab = isMusicTabHash(location.hash)
  const [liveSort, setLiveSort] = useState<LiveSort>("latest")
  const [before, setBefore] = useState("")
  const upcomingHeadingId = useId()

  const loggedIn = useAuth((s) => !!s.jwt)
  const orgName = useOrgStore((s) => s.currentOrg.name)
  const settings = useSettings()
  const { homeViewMode: mode, gridSize, scrollMode } = settings

  const { favorites: favoriteChannels, isPending: favoritesPending } =
    useFavorites()
  const hasFavorites = favoriteChannels.length > 0
  // The favorites feed is unfiltered when the list is empty, so never ask.
  const feedEnabled = !favorites || (loggedIn && hasFavorites)

  useDocumentTitle(
    tab === "radio"
      ? "Music Radios"
      : tab === "playlists"
        ? "Musicdex Playlists"
        : favorites
          ? t("component.mainNav.favorites")
          : null
  )

  const orgLive = useOrgLive(orgName, !favorites && !musicTab)
  const favoritesLive = useFavoritesLive(favorites && hasFavorites && !musicTab)
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
    {
      favorites,
      enabled: (tab === "archive" || tab === "clips") && feedEnabled,
    }
  )
  const feedVideos = useMemo(
    () => flattenPages(feed.data?.pages).filter(filter),
    [feed.data, filter]
  )

  const controls = musicTab ? (
    <MusicSearchLink />
  ) : (
    <>
      {tab === "live" && (
        <div className="mr-3 hidden shrink-0 items-center gap-4 xl:flex">
          <LiveSortControl value={liveSort} onChange={setLiveSort} />
          <label
            className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
            title={t("views.home.collateCollabsHint")}
          >
            <Switch
              size="sm"
              checked={settings.collateCollabs}
              onCheckedChange={(value) => settings.set("collateCollabs", value)}
            />
            {t("views.home.collateCollabs")}
          </label>
        </div>
      )}
      <FilterPopover
        tab={tab}
        liveSort={liveSort}
        onLiveSort={setLiveSort}
        before={before}
        onBefore={setBefore}
      />
      <ViewMenu />
    </>
  )

  let content: React.ReactNode
  if (musicTab) {
    content = (
      <Suspense
        fallback={<VideoListSkeleton mode={mode} gridSize={gridSize} />}
      >
        {tab === "radio" ? (
          <MusicRadiosTab favorites={favorites} />
        ) : tab === "playlists" ? (
          <MusicLibraryTab />
        ) : favorites ? (
          <MusicFavoritesTab />
        ) : (
          <MusicHomeTab />
        )}
      </Suspense>
    )
  } else if (favorites && !loggedIn) {
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
      content = (
        <ErrorMessage error={live.error} onRetry={() => live.refetch()} />
      )
    } else if (liveVideos.all.length === 0) {
      content = (
        <StateMessage
          icon={<TelevisionSimpleIcon />}
          title={t("views.home.noStreams")}
        />
      )
    } else if (mode !== "grid") {
      content = (
        <VideoList
          scope={`${favorites ? "favorites" : "home"}:live`}
          videos={liveVideos.all}
          mode={mode}
          collateCollabs={settings.collateCollabs}
        />
      )
    } else {
      // The grid keeps what is on air apart from what is scheduled.
      content = (
        <>
          {liveVideos.live.length > 0 && (
            <VideoList
              scope={`${favorites ? "favorites" : "home"}:live`}
              discovery={!favorites}
              videos={liveVideos.live}
              collateCollabs={settings.collateCollabs}
              gridSize={gridSize}
            />
          )}
          {liveVideos.live.length > 0 && liveVideos.upcoming.length > 0 && (
            <Separator className="my-6" />
          )}
          {liveVideos.upcoming.length > 0 && (
            <section
              aria-labelledby={!favorites ? upcomingHeadingId : undefined}
              className={
                !favorites && liveVideos.live.length > 0 ? "mt-9" : undefined
              }
            >
              {!favorites && (
                <div className="mb-4 flex min-h-8 items-center gap-2.5">
                  <CalendarBlankIcon className="size-5 text-brand" />
                  <h2
                    id={upcomingHeadingId}
                    className="text-sm font-semibold tracking-wide"
                  >
                    {t("views.home.upcomingStreams")}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {liveVideos.upcoming.length}
                  </span>
                </div>
              )}
              <VideoList
                scope={`${favorites ? "favorites" : "home"}:upcoming`}
                discovery={!favorites}
                videos={liveVideos.upcoming}
                collateCollabs={settings.collateCollabs}
                gridSize={gridSize}
              />
            </section>
          )}
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
          <VideoList
            scope={`${favorites ? "favorites" : "home"}:${tab}`}
            videos={feedVideos}
            mode={mode}
            gridSize={gridSize}
          />
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
    <HomeTabsLayout
      tab={tab}
      liveCount={live.data ? liveVideos.live.length : undefined}
      upcomingCount={live.data ? liveVideos.upcoming.length : undefined}
      controls={controls}
    >
      {content}
    </HomeTabsLayout>
  )
}

/** Start of the day after a `YYYY-MM-DD` date: an exclusive upper bound. */
function nextDayIso(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d + 1).toISOString()
}
