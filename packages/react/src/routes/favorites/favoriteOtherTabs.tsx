import { useFavoriteVideos } from "@/services/video.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { useAtomValue } from "jotai";
import { clipLanguageAtom } from "@/store/settings";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import { pastVideoFilterByAtom } from "@/components/settings/VideoListSettingsMenu";

export function FavoritesClipTab() {
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const clipLangs = useAtomValue(clipLanguageAtom);
  const toDate = useAtomValue(pastVideoFilterByAtom);

  const {
    data: clips,
    isLoading: clipLoading,
    fetchNextPage: fetchClips,
    hasNextPage: hasClipsNextPage,
    isFetchingNextPage: isFetchingClipsNextPage,
    refetch,
  } = useFavoriteVideos(
    {
      type: ["clip"],
      status: ["past"],
      include: ["mentions"],
      max_upcoming_hours: 1,
      limit: 32,
      lang: clipLangs,
      to: toDate?.toJSON(),
    },
    {
      refetchInterval: 1000 * 60 * 5,
    },
  );

  const filteredClips = useVideoFilter(
    clips?.pages?.flat() ?? [],
    "clip",
    "favorites",
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

export function FavoritesArchiveTab() {
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const toDate = useAtomValue(pastVideoFilterByAtom);
  const {
    data: archives,
    isLoading: archiveLoading,
    fetchNextPage: fetchArchives,
    hasNextPage: hasArchiveNextPage,
    isFetchingNextPage: isFetchingArchiveNextPage,
    refetch,
  } = useFavoriteVideos(
    {
      type: ["stream"],
      status: ["past", "missing"],
      include: ["clips", "mentions"],
      max_upcoming_hours: 1,
      limit: 32,
      to: toDate?.toJSON(),
    },
    {
      refetchInterval: 1000 * 60 * 5,
    },
  );

  const archiveFiltered = useVideoFilter(
    archives?.pages?.flat() ?? [],
    "archive",
    "favorites",
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
