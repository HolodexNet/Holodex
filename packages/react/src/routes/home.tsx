import { SkeletonVideoCard } from "@/components/video/SkeletonVideoCard";
import { VideoCard } from "@/components/video/VideoCard";
import { cn } from "@/lib/utils";
import { useLive } from "@/services/live.service";
import { useVideos } from "@/services/video.service";
import { Button } from "@/shadcn/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { orgAtom } from "@/store/org";
import { videoCardSizeAtom } from "@/store/video";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

export function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { org } = useParams();
  const [cardSize, setCardSize] = useAtom(videoCardSizeAtom);
  const currentOrg = useAtomValue(orgAtom);
  const [tab, setTab] = useState(searchParams.get("tab") ?? "live");
  const { data: live, isLoading: liveLoading } = useLive(
    { org, type: ["placeholder", "stream"], include: ["mentions"] },
    { refetchInterval: 1000 * 60 * 5, enabled: tab === "live" },
  );
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
    },
    {
      refetchInterval: 1000 * 60 * 5,
      enabled: tab === "clips",
    },
  );

  const listCN = useMemo(
    () =>
      cn({
        "grid grid-cols-1 grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-x-4 gap-y-6":
          cardSize === "lg",
        "grid grid-cols-2 grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-x-2 gap-y-4":
          cardSize === "md",
        "flex flex-col max-w-screen-lg mx-auto": cardSize === "sm",
      }),
    [cardSize],
  );

  useEffect(() => {
    navigate(`/org/${currentOrg}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg]);

  useEffect(() => {
    console.log(`tab changed ${tab}`);
    searchParams.set("tab", tab);
    setSearchParams(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tab]);

  if (!org) return <Navigate to="/org404" />;

  return (
    <Tabs
      className="w-full p-4 md:px-8"
      defaultValue={tab}
      onValueChange={setTab}
    >
      <TabsList className="z-20 flex w-full justify-start overflow-x-auto overflow-y-hidden rounded-none bg-base-2">
        <TabsTrigger className="text-lg" value="live">
          {t("Live")}
          {live && (
            <span className="mx-1 rounded-sm bg-secondary-5 p-1 text-sm">
              {live?.filter(({ status }) => status === "live").length}
            </span>
          )}
          / {t("Upcoming")}
          {live && (
            <span className="ml-1 rounded-sm bg-secondary-5 p-1 text-sm">
              {live?.filter(({ status }) => status === "upcoming").length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger className="text-lg" value="archive">
          {t("Archive")}
        </TabsTrigger>
        <TabsTrigger className="text-lg" value="clips">
          {t("Clips")}
        </TabsTrigger>
        <div className="flex grow" />
        <Button
          className="shrink-0"
          size="icon-lg"
          variant="ghost"
          onClick={() => {
            setCardSize(
              // lg -> md -> sm
              cardSize === "sm" ? "lg" : cardSize === "md" ? "sm" : "md",
            );
          }}
        >
          <div
            className={cn({
              "i-lucide:layout-grid": cardSize === "sm",
              "i-lucide:list": cardSize === "md",
              "i-lucide:grid": cardSize === "lg",
            })}
          />
        </Button>
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
  );
}
