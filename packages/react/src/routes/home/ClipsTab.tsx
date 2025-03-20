import { useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useVideosV3 } from "@/services/video.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { clipLanguageAtom } from "@/store/settings";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import { ClipLanguageSelector } from "@/components/language/ClipLanguageSelector";
import { pastVideoFilterByAtom } from "@/components/settings/VideoListSettingsMenu";

export function ClipsTab() {
  const { org } = useParams();
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
  } = useVideosV3(
    {
      org,
      type: ["clip"],
      status: ["past"],
      include: ["mentions"],
      max_upcoming_hours: 1,
      limit: 32,
      lang: clipLangs,
      // api currently does not support JSON date strings (i.e., JSON.stringify(Date))
      to: toDate?.toJSON(),
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

  if (clipLangs.length === 0)
    return (
      <div className="gap-4 px-4 py-2 @container md:px-8">
        <div>No language selected</div>

        <ClipLanguageSelector />
      </div>
    );

  if (!filteredClips.length && !clipLoading)
    return (
      <div className="gap-4 px-4 py-2 @container md:px-8">
        <div>No clips for languages: {clipLangs.join(", ")}</div>
      </div>
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
