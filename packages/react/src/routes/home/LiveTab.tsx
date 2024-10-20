import { useLive } from "@/services/live.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { Separator } from "@/shadcn/ui/separator";
import { useParams } from "react-router-dom";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import { EmptyQuip } from "./EmptyQuip";

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
    live as Video[],
    "stream_schedule",
    "org",
  );

  const nowLive = liveFiltered?.filter(({ status }) => status === "live") ?? [];
  const upcoming =
    liveFiltered?.filter(({ status }) => status !== "live") ?? [];

  return (
    <>
      <PullToRefresh onRefresh={refetch}>
        <MainVideoListing
          isLoading={liveLoading}
          size={cardSize}
          videos={nowLive}
        />
        {!liveLoading && nowLive.length == 0 && <EmptyQuip />}
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
