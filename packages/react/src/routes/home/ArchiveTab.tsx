import { useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useVideosV3 } from "@/services/video.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import { pastVideoFilterByAtom } from "@/components/settings/VideoListSettingsMenu";

export function ArchiveTab() {
  const { org } = useParams();
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const toDate = useAtomValue(pastVideoFilterByAtom);
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
      // api currently does not support JSON date strings (i.e., JSON.stringify(Date))
      to: toDate?.toJSON(),
    },
    {
      refetchInterval: 1000 * 60 * 5,
    },
  );

  const archiveFiltered = useVideoFilter(
    archives?.pages?.flatMap((x) => x.items) ?? [],
    "archive",
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
