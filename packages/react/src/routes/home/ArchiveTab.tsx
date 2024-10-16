import { useVideosV3 } from "@/services/video.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { useParams } from "react-router-dom";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";

export function ArchiveTab() {
  const { org } = useParams();
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const {
    data: archives,
    isLoading: archiveLoading,
    fetchNextPage: fetchArchives,
    hasNextPage: hasArchiveNextPage,
    isFetchingNextPage: isFetchingArchiveNextPage,
    refetch,
  } = useVideosV3(
    {
      org,
      type: ["stream"],
      status: ["past", "missing"],
      include: ["clips", "mentions"],
      max_upcoming_hours: 1,
      limit: 32,
    },
    {
      refetchInterval: 1000 * 60 * 5,
    },
  );

  const archiveFiltered = useVideoFilter(
    archives?.pages?.flatMap((x) => x.items) ?? [],
    "clip",
    "org",
  );

  return (
    <PullToRefresh onRefresh={refetch}>
      <MainVideoListing
        isLoading={archiveLoading}
        size={cardSize}
        videos={archiveFiltered}
        fetchNextPage={fetchArchives}
        hasNextPage={hasArchiveNextPage}
        isFetchingNextPage={isFetchingArchiveNextPage}
      />
    </PullToRefresh>
  );
}
