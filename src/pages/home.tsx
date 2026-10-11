import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LiveIcon,
  CalendarIcon,
  GridIcon,
  ListIcon,
  RefreshIcon,
  MusicIcon,
  HeartIcon,
  ChevronRightIcon,
  GlobeIcon,
} from "@/components/icons";
import {
  BrowseChannels,
  Choice,
  EmptyState,
  ErrorState,
  IconButton,
  languages,
  LoadingCards,
  PageHeading,
} from "@/components/common";
import { VideoCard, videoDate } from "@/components/video-card";
import { api } from "@/lib/api";
import { usePreferences } from "@/lib/preferences";
import type { Video } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "All streams" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "talk", label: "Chatting" },
  { value: "collab", label: "Collabs" },
];
const talkTopics = new Set([
  "talk",
  "morning",
  "Superchat_Reading",
  "english_only",
]);
const musicTopics = new Set([
  "singing",
  "Music_Cover",
  "Musical_Instrument",
  "3D_Stream",
  "Music_Original",
]);
function matchCategory(video: Video, category: string) {
  if (category === "all") return true;
  if (category === "music") return musicTopics.has(video.topic_id || "");
  if (category === "talk") return talkTopics.has(video.topic_id || "");
  if (category === "collab")
    return (
      (video.mentions?.filter((channel) => channel.id !== video.channel.id)
        .length || 0) > 0 || /collab|コラボ/i.test(video.title || "")
    );
  return (
    !!video.topic_id &&
    !musicTopics.has(video.topic_id) &&
    !talkTopics.has(video.topic_id) &&
    !["membersonly", "FreeChat", "announce", "shorts"].includes(video.topic_id)
  );
}
function VideoSection({
  title,
  videos,
  icon,
  list,
  note,
}: {
  title: string;
  videos: Video[];
  icon: React.ReactNode;
  list: boolean;
  note?: string;
}) {
  return (
    <section className="mt-7">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-primary-ink [&_svg]:size-4.5">{icon}</span>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="rounded-md bg-muted px-1.5 py-.5 text-[10px] font-medium text-muted-foreground">
          {videos.length}
        </span>
        {note && (
          <span className="ml-auto text-[11px] text-muted-foreground">
            {note}
          </span>
        )}
      </div>
      <div className={list ? "video-list" : "video-grid"}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} list={list} />
        ))}
      </div>
    </section>
  );
}
export function HomePage({
  favoritesOnly = false,
}: {
  favoritesOnly?: boolean;
}) {
  const { prefs, update, favorites } = usePreferences();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState("all");
  const [upcomingLimit, setUpcomingLimit] = useState(12);
  const tab = ["recent", "clips"].includes(params.get("tab") || "")
    ? params.get("tab")!
    : "live";
  const upcomingOnly = params.get("view") === "upcoming";
  const favoriteIds = favorites.map((channel) => channel.id).sort();
  const live = useQuery({
    queryKey: favoritesOnly
      ? ["favorite-live", favoriteIds]
      : ["live", prefs.org],
    queryFn: ({ signal }) =>
      favoritesOnly
        ? api.favoriteLive(favoriteIds, signal)
        : api.live(prefs.org, signal),
    enabled: !favoritesOnly || favorites.length > 0,
    staleTime: 120_000,
    refetchInterval: prefs.autoRefresh ? 120_000 : false,
    refetchIntervalInBackground: false,
  });
  const archive = useInfiniteQuery({
    queryKey: [
      "archive",
      favoritesOnly ? favoriteIds : prefs.org,
      tab,
      prefs.language,
    ],
    enabled: tab !== "live" && (!favoritesOnly || favorites.length > 0),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      favoritesOnly
        ? api.favoriteVideos(
            favoriteIds,
            tab === "clips" ? "clip" : "stream",
            prefs.language,
            pageParam,
            signal,
          )
        : api.videos(
            {
              org: prefs.org === "all" ? undefined : prefs.org,
              status: "past",
              type: tab === "clips" ? "clip" : "stream",
              lang: prefs.language,
              nextPage: pageParam,
              sort: "available_at",
              order: "desc",
            },
            signal,
          ),
    getNextPageParam: (last, pages) =>
      last.items.length &&
      last.nextPage &&
      !pages.slice(0, -1).some((p) => p.nextPage === last.nextPage)
        ? last.nextPage
        : undefined,
    staleTime: 180_000,
  });
  const source =
    tab === "live"
      ? live.data?.items
      : archive.data?.pages.flatMap((p) => p.items);
  const filtered = useMemo(() => {
    const seen = new Set<string>();
    return (source || []).filter((video) => {
      if (!video.channel || seen.has(video.id)) return false;
      seen.add(video.id);
      return (
        (!prefs.hideFreeChat || video.topic_id !== "FreeChat") &&
        (!prefs.hideMembers || video.topic_id !== "membersonly") &&
        (prefs.language === "all" ||
          !video.lang ||
          video.lang === prefs.language) &&
        matchCategory(video, category)
      );
    });
  }, [
    source,
    prefs.hideFreeChat,
    prefs.hideMembers,
    prefs.language,
    category,
    favoritesOnly,
    favorites,
  ]);
  const liveNow = filtered
    .filter((v) => v.status === "live")
    .sort((a, b) => Number(b.live_viewers || 0) - Number(a.live_viewers || 0));
  const scheduled = filtered
    .filter((v) => v.status === "upcoming")
    .sort(
      (a, b) => (videoDate(a)?.getTime() || 0) - (videoDate(b)?.getTime() || 0),
    );
  const overdue = scheduled.filter(
    (v) => (videoDate(v)?.getTime() || Infinity) < Date.now() - 86_400_000,
  );
  const upcoming = scheduled.filter((v) => !overdue.includes(v));
  const current = tab === "live" ? live : archive;
  const list = prefs.layout === "list";
  return (
    <>
      <PageHeading
        title={
          favoritesOnly
            ? "Your favorites"
            : upcomingOnly
              ? "Upcoming streams"
              : "Your VTuber home"
        }
        description={
          favoritesOnly
            ? "The channels you love, all in one place."
            : upcomingOnly
              ? "Make room for the moments ahead."
              : "Good streams. Great company. All in one place."
        }
      >
        <div className="flex items-center gap-1.5">
          <span className="mr-2 hidden text-[11px] text-muted-foreground sm:inline">
            {prefs.autoRefresh
              ? "Updates automatically"
              : "Auto-refresh paused"}
          </span>
          <IconButton
            label="Refresh streams"
            disabled={current.isFetching}
            onClick={() => void current.refetch()}
          >
            <RefreshIcon className={cn(current.isFetching && "animate-spin")} />
          </IconButton>
        </div>
      </PageHeading>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setCategory("all");
          setParams(value === "live" ? {} : { tab: String(value) });
        }}
        className="gap-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b">
          <TabsList
            variant="line"
            className="h-12 max-w-full gap-3 overflow-x-auto p-0 sm:gap-5"
          >
            <TabsTrigger value="live" className="page-tab px-0 text-xs">
              <LiveIcon />
              Live & upcoming
            </TabsTrigger>
            <TabsTrigger value="recent" className="page-tab px-0 text-xs">
              Recent streams
            </TabsTrigger>
            <TabsTrigger value="clips" className="page-tab px-0 text-xs">
              Clips
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            render={<Link to="/search" />}
            className="hidden text-xs text-muted-foreground sm:flex"
          >
            Explore more
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((c) => (
              <Button
                size="sm"
                variant={category === c.value ? "secondary" : "ghost"}
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "h-8 rounded-lg px-3 text-xs",
                  category === c.value &&
                    "bg-card text-foreground shadow-xs ring-1 ring-border",
                )}
              >
                {c.value === "music" && <MusicIcon />}
                {c.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <GlobeIcon className="size-3.5 text-muted-foreground" />
            <Choice
              label="Video language"
              value={prefs.language}
              onChange={(language) => update({ language })}
              options={languages}
              className="h-8 rounded-lg border-transparent bg-transparent px-1 text-xs"
            />
            <span className="mx-1 h-4 border-l" />
            <div className="flex rounded-lg border bg-card p-.5">
              <IconButton
                label="Grid view"
                size="icon-xs"
                className={cn("size-7 rounded-md", !list && "bg-muted")}
                onClick={() => update({ layout: "grid" })}
              >
                <GridIcon />
              </IconButton>
              <IconButton
                label="List view"
                size="icon-xs"
                className={cn("size-7 rounded-md", list && "bg-muted")}
                onClick={() => update({ layout: "list" })}
              >
                <ListIcon />
              </IconButton>
            </div>
          </div>
        </div>
        {["live", "recent", "clips"].map((value) => (
          <TabsContent key={value} value={value}>
            {favoritesOnly && !favorites.length ? (
              <div className="mt-7">
                <EmptyState
                  title="Make yourself at home"
                  description="Favorite a channel using the heart on any stream, or find your favorites in the channel directory."
                  icon={<HeartIcon />}
                >
                  <BrowseChannels />
                </EmptyState>
              </div>
            ) : (
              <>
                {current.error && (
                  <ErrorState
                    error={current.error}
                    retry={() => void current.refetch()}
                  />
                )}
                {current.isPending ? (
                  <div className="mt-7">
                    <LoadingCards />
                  </div>
                ) : (
                  !current.error && (
                    <>
                      {tab === "live" ? (
                        <>
                          {!upcomingOnly && liveNow.length > 0 && (
                            <VideoSection
                              title="Live now"
                              videos={liveNow}
                              icon={<LiveIcon />}
                              list={list}
                              note={`${liveNow.length} streams to drop into`}
                            />
                          )}
                          {upcoming.length > 0 && (
                            <VideoSection
                              title="Coming up"
                              videos={upcoming.slice(0, upcomingLimit)}
                              icon={<CalendarIcon />}
                              list={list}
                              note={Intl.DateTimeFormat()
                                .resolvedOptions()
                                .timeZone.replaceAll("_", " ")}
                            />
                          )}
                          {upcoming.length > upcomingLimit && (
                            <div className="mt-6 flex justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setUpcomingLimit((old) => old + 12)
                                }
                              >
                                Show more upcoming streams
                                <ChevronRightIcon />
                              </Button>
                            </div>
                          )}
                          {overdue.length > 0 && (
                            <details className="mt-7 rounded-xl border bg-card px-4 py-3">
                              <summary className="cursor-pointer text-xs text-muted-foreground">
                                {overdue.length} earlier schedules awaiting an
                                update
                              </summary>
                              <p className="my-3 text-xs leading-5 text-muted-foreground">
                                The backend still marks these events as
                                upcoming, although their scheduled dates have
                                passed.
                              </p>
                              <div className="video-grid py-3">
                                {overdue.map((video) => (
                                  <VideoCard key={video.id} video={video} />
                                ))}
                              </div>
                            </details>
                          )}
                          {!(upcomingOnly
                            ? upcoming.length
                            : filtered.length) && (
                            <div className="mt-7">
                              <EmptyState
                                title="It's a little quiet here"
                                description="There are no streams matching these filters. Try another organization, language, or category."
                              >
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setCategory("all");
                                    update({
                                      language: "all",
                                      org: "all",
                                      hideMembers: false,
                                    });
                                    setParams({});
                                  }}
                                >
                                  Show all streams
                                </Button>
                              </EmptyState>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="mt-6">
                            <div className={list ? "video-list" : "video-grid"}>
                              {filtered.map((video) => (
                                <VideoCard
                                  key={video.id}
                                  video={video}
                                  list={list}
                                />
                              ))}
                            </div>
                          </div>
                          {!filtered.length && (
                            <EmptyState
                              title="No videos match these filters"
                              description="Try another category or language, or explore more in search."
                            />
                          )}
                          {archive.hasNextPage && (
                            <div className="mt-7 flex justify-center">
                              <Button
                                variant="outline"
                                disabled={archive.isFetchingNextPage}
                                onClick={() => void archive.fetchNextPage()}
                              >
                                {archive.isFetchingNextPage
                                  ? "Loading…"
                                  : "Load more videos"}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
      <footer className="mt-12 flex items-center justify-between gap-4 border-t pt-5 text-[10px] text-muted-foreground">
        <span>Find your people. Find your next stream.</span>
        <span>Schedules are shown in your local time.</span>
      </footer>
    </>
  );
}
