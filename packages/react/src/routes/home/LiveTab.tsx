import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLive } from "@/services/live.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { Separator } from "@/shadcn/ui/separator";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import { EmptyQuip } from "./EmptyQuip";
import { useVideoSort } from "@/hooks/useVideoSort";

export function LiveTab() {
  const { org } = useParams();
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const {
    data: live,
    isLoading: liveLoading,
    refetch,
  } = useLive(
    { org, type: ["placeholder", "stream"], include: ["mentions"] },
    { refetchInterval: 1000 * 60 * 5 },
  );

  const liveFiltered = useVideoFilter(
    live?.items as Video[],
    "stream_schedule",
    "org",
  );

  const nowLive = useMemo(
    () => liveFiltered?.filter(({ status }) => status === "live") ?? [],
    [liveFiltered],
  );
  const upcoming =
    liveFiltered?.filter(({ status }) => status !== "live") ?? [];

  // sort livestreams by video list settings
  const nowLiveSorted = useVideoSort(nowLive, "stream_schedule");

  return (
    <>
      <PullToRefresh onRefresh={refetch}>
        <MainVideoListing
          isLoading={liveLoading}
          size={cardSize}
          videos={nowLiveSorted}
        />
        {!liveLoading && nowLiveSorted.length == 0 && <EmptyQuip />}
        <Separator className="mb-4 mt-2 w-full border-base-3 lg:mb-6 lg:mt-4" />
        <MainVideoListing
          isLoading={liveLoading}
          size={cardSize}
          videos={upcoming}
        />
      </PullToRefresh>
    </>
  );
}
