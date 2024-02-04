import { SkeletonVideoCard } from "@/components/video/SkeletonVideoCard";
import { VideoCard } from "@/components/video/VideoCard";
import { cn } from "@/lib/utils";
import { useLive } from "@/services/live.service";
import { useVideos } from "@/services/video.service";
import { Button } from "@/shadcn/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { orgAtom } from "@/store/org";
import { useVideoCardSizes, videoCardSizeAtom } from "@/store/video";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";
import { clipLangAtom } from "@/store/i18n";
import { LanguageSelector } from "@/components/language/LanguagePicker";
import { Helmet } from "react-helmet-async";

export function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { org } = useParams();
  const {
    size: cardSize,
    setSize,
    nextSize,
    setNextSize,
  } = useVideoCardSizes(["sm", "md", "lg"]);
  const currentOrg = useAtomValue(orgAtom);
  const [tab, setTab] = useState(searchParams.get("tab") ?? "live");
  const { data: live, isLoading: liveLoading } = useLive(
    { org, type: ["placeholder", "stream"], include: ["mentions"] },
    { refetchInterval: 1000 * 60 * 5, enabled: tab === "live" },
  );
  const clipLang = useAtomValue(clipLangAtom);

  const {
    data: archives,
    isLoading: archiveLoading,
    fetchNextPage: fetchArchives,
  } = useVideos(
    {
      org,
      type: ["stream"],
      status: ["past", "missing"],
      include: ["clips", "mentions"],
      max_upcoming_hours: 1,
      paginated: true,
      limit: 32,
    },
    {
      refetchInterval: 1000 * 60 * 5,
      enabled: tab === "archive",
    },
  );

  const {
    data: clips,
    isLoading: clipLoading,
    fetchNextPage: fetchClips,
  } = useVideos(
    {
      org,
      type: ["clip"],
      status: ["past"],
      include: ["mentions"],
      max_upcoming_hours: 1,
      paginated: true,
      limit: 32,
      lang: [`${clipLang.value}`],
    },
    {
      refetchInterval: 1000 * 60 * 5,
      enabled: tab === "clips",
    },
  );

  const listCN = useMemo(
    () =>
      cn("px-4 py-2 md:px-8", {
        "@container grid grid-cols-1 grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-x-4 gap-y-4":
          cardSize === "lg",
        "@container grid grid-cols-2 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-2 gap-y-2":
          cardSize === "md",
        "@container flex flex-col max-w-screen mx-auto": cardSize === "sm",
      }),
    [cardSize],
  );

  useEffect(() => {
    navigate(`/org/${currentOrg}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg]);

  useEffect(() => {
    console.log(`tab changed ${tab}`);
    searchParams.set("tab", tab);
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tab]);

  if (!org) return <Navigate to="/org404" />;

  return (
    <>
      <Helmet>
        <title>{currentOrg} - Holodex</title>
      </Helmet>
      <Tabs defaultValue={tab} onValueChange={setTab}>
        <TabsList className="sticky top-0 z-20 flex h-fit max-w-full justify-start overflow-x-auto bg-base-2 md:px-8">
          <TabsTrigger value="live" className="px-2">
            <Trans
              i18nKey="views.home.liveOrUpcomingHeading"
              components={{
                liveCount: live ? (
                  <span className="mx-1 rounded-sm bg-secondary-5 p-1 text-sm">
                    {live.filter(({ status }) => status === "live").length ||
                      "0"}
                  </span>
                ) : (
                  <span className="w-1" />
                ),
                upcomingCount: live ? (
                  <span className="-mr-1 ml-1 rounded-sm bg-secondary-5 p-1 text-sm">
                    {live.filter(({ status }) => status === "upcoming")
                      .length || "0"}
                  </span>
                ) : (
                  <span className="w-1" />
                ),
              }}
            />
          </TabsTrigger>
          <TabsTrigger value="archive">
            {t("views.home.recentVideoToggles.official")}
          </TabsTrigger>
          <TabsTrigger value="clips">
            {t("views.home.recentVideoToggles.subber")}
          </TabsTrigger>
          <div className="flex grow" />
          <Button
            className="shrink-0"
            size="icon-lg"
            variant="ghost"
            onClick={() => {
              setNextSize();
              console.log("new card size", nextSize);
            }}
          >
            <div
              className={cn(
                {
                  md: "i-lucide:grid-3x3",
                  lg: "i-lucide:layout-grid",
                  sm: "i-lucide:list",
                  xs: "", // not used
                }[nextSize],
              )}
            />
          </Button>
          <LanguageSelector />
        </TabsList>
        <TabsContent value="live">
          <div className={listCN}>
            {liveLoading
              ? Array.from({ length: 24 }).map((_, index) => (
                  <SkeletonVideoCard key={`placeholder-${index}`} />
                ))
              : live?.map((stream) => (
                  <VideoCard key={stream.id} size={cardSize} {...stream} />
                ))}
          </div>
        </TabsContent>
        <TabsContent value="archive">
          {archiveLoading ? (
            <div className={listCN}>
              {Array.from({ length: 24 }).map((_, index) => (
                <SkeletonVideoCard key={`placeholder-${index}`} />
              ))}
            </div>
          ) : (
            <VirtuosoGrid
              useWindowScroll
              listClassName={listCN}
              data={archives?.pages?.flat() ?? []}
              itemContent={(_, stream) => (
                <VideoCard key={stream.id} size={cardSize} {...stream} />
              )}
              endReached={async () => {
                await fetchArchives();
              }}
            />
          )}
        </TabsContent>
        <TabsContent value="clips">
          {clipLoading ? (
            <div className={listCN}>
              {Array.from({ length: 24 }).map((_, index) => (
                <SkeletonVideoCard key={`placeholder-${index}`} />
              ))}
            </div>
          ) : (
            <VirtuosoGrid
              useWindowScroll
              listClassName={listCN}
              data={clips?.pages?.flat() ?? []}
              itemContent={(_, stream) => (
                <VideoCard key={stream.id} size={cardSize} {...stream} />
              )}
              endReached={async () => {
                await fetchClips();
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
