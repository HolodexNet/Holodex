import { useVideosV3 } from "@/services/video.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { useAtomValue } from "jotai";
import { clipLanguageAtom } from "@/store/settings";
import { useParams } from "react-router-dom";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";

export function ClipsTab() {
  const { org } = useParams();
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const clipLangs = useAtomValue(clipLanguageAtom);

  const {
    data: clips,
    isLoading: clipLoading,
    fetchNextPage: fetchClips,
    hasNextPage: hasClipsNextPage,
    isFetchingNextPage: isFetchingClipsNextPage,
    refetch,
  } = useVideosV3(
    {
      org,
      type: ["clip"],
      status: ["past"],
      include: ["mentions"],
      max_upcoming_hours: 1,
      limit: 32,
      lang: clipLangs,
    },
    {
      refetchInterval: 1000 * 60 * 5,
    },
  );

  const filteredClips = useVideoFilter(
    clips?.pages?.flatMap((x) => x.items) ?? [],
    "clip",
    "org",
  );

  return (
    <PullToRefresh onRefresh={refetch}>
      <MainVideoListing
        isLoading={clipLoading}
        size={cardSize}
        videos={filteredClips}
        fetchNextPage={fetchClips}
        hasNextPage={hasClipsNextPage}
        isFetchingNextPage={isFetchingClipsNextPage}
      />
    </PullToRefresh>
  );
}
