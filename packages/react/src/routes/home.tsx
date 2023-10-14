import { SkeletonVideoCard } from "@/components/video/SkeletonVideoCard";
import { VideoCard } from "@/components/video/VideoCard";
import { cn } from "@/lib/utils";
import { useLive } from "@/services/live.service";
import { useVideos } from "@/services/video.service";
import { Button } from "@/shadcn/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { videoCardSizeAtom } from "@/store/video";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

export function Home() {
  const { org } = useParams();
  const [tab, setTab] = useState("live");
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
  const [cardSize, setCardSize] = useAtom(videoCardSizeAtom);

  const listCN = useMemo(
    () =>
      cn({
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-6":
          cardSize === "lg",
        "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-4":
          cardSize === "md",
        "flex flex-col max-w-screen-lg mx-auto": cardSize === "sm",
      }),
    [cardSize],
  );

  if (!org) return <Navigate to="/org404" />;

  return (
    <Tabs
      className="w-full p-4 md:p-8"
      defaultValue={tab}
      onValueChange={setTab}
    >
      <TabsList className="flex w-full bg-base-2 rounded-none justify-start overflow-x-auto overflow-y-hidden z-20">
        <TabsTrigger className="text-lg" value="live">
          Live
          {live && (
            <span className="mx-1 p-1 bg-secondary-5 rounded-sm text-sm">
              {live?.filter(({ status }) => status === "live").length}
            </span>
          )}
          / Upcoming
          {live && (
            <span className="ml-1 p-1 bg-secondary-5 rounded-sm text-sm">
              {live?.filter(({ status }) => status === "upcoming").length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger className="text-lg" value="archive">
          Archive
        </TabsTrigger>
        <TabsTrigger className="text-lg" value="clips">
          Clips
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
