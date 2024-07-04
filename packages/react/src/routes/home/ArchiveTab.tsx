import { useVideosV3 } from "@/services/video.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { useParams } from "react-router-dom";
import { useVideoCardSizes } from "@/store/video";

export function ArchiveTab() {
  const { org } = useParams();
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const {
    data: archives,
    isLoading: archiveLoading,
    fetchNextPage: fetchArchives,
    hasNextPage: hasArchiveNextPage,
    isFetchingNextPage: isFetchingArchiveNextPage,
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
  return (
    <MainVideoListing
      isLoading={archiveLoading}
      size={cardSize}
      videos={archives?.pages?.flatMap((x) => x.items) ?? []}
      fetchNextPage={fetchArchives}
      hasNextPage={hasArchiveNextPage}
      isFetchingNextPage={isFetchingArchiveNextPage}
    />
  );
}
