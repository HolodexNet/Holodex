import { SkeletonVideoCard } from "@/components/video/SkeletonVideoCard";
import { VideoCard } from "@/components/video/VideoCard";
import { useLive } from "@/services/live.service";
import { useVideos } from "@/services/video.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { videoCardSizeAtom } from "@/store/video";
import { useAtom } from "jotai";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

export function Home() {
  const { org } = useParams();
  const [tab, setTab] = useState("live");
  const { data: live, isLoading: liveLoading } = useLive(
    { org, type: ["placeholder", "stream"], include: ["mentions"] },
    { enabled: tab === "live" },
  );
  const { data: archives, fetchNextPage: fetchArchives } = useVideos(
    {
      org,
      type: ["stream"],
      status: ["past", "missing"],
      include: ["clips", "mentions"],
      max_upcoming_hours: 1,
      paginated: true,
      limit: 24,
    },
    {
      enabled: tab === "archive",
    },
  );
  const { data: clips, fetchNextPage: fetchClips } = useVideos(
    {
      org,
      type: ["clip"],
      status: ["past"],
      include: ["mentions"],
      max_upcoming_hours: 1,
      paginated: true,
      limit: 24,
    },
    {
      enabled: tab === "clips",
    },
  );
  const [cardSize, setCardSize] = useAtom(videoCardSizeAtom);

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
            <span className="mx-1 p-1 pb-0 bg-blue-6 rounded-sm text-sm">
              {live?.filter(({ status }) => status === "live").length}
            </span>
          )}
          / Upcoming
          {live && (
            <span className="mx-1 p-1 pb-0 bg-blue-6 rounded-sm text-sm">
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
      </TabsList>
      <TabsContent value="live">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
          {liveLoading
            ? Array.from({ length: 24 }).map(() => <SkeletonVideoCard />)
            : live?.map((stream) => <VideoCard size={cardSize} {...stream} />)}
        </div>
      </TabsContent>
      <TabsContent value="archive">
        <VirtuosoGrid
          useWindowScroll
          listClassName="w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6"
          data={archives?.pages?.flat() ?? []}
          itemContent={(_, stream) => (
            <VideoCard key={stream.id} size={cardSize} {...stream} />
          )}
          endReached={async () => {
            await fetchArchives();
          }}
        />
      </TabsContent>
      <TabsContent value="clips">
        <VirtuosoGrid
          useWindowScroll
          listClassName="w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6"
          data={clips?.pages?.flat() ?? []}
          itemContent={(_, stream) => (
            <VideoCard key={stream.id} size={cardSize} {...stream} />
          )}
          endReached={async () => {
            await fetchClips();
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
