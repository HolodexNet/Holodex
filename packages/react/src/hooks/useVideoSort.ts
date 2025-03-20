import { useMemo } from "react";
import { useAtomValue } from "jotai";
import {
  liveStreamSortByAtom,
  LiveStreamSortOption,
} from "@/components/settings/VideoListSettingsMenu";

export function useVideoSort(
  videos: VideoBase[] | undefined,
  videoContext: "stream_schedule" | "archive" | "clip",
  overrides?: Partial<{
    liveStreamSortBy: LiveStreamSortOption;
  }>,
) {
  const liveStreamSortBy = useAtomValue(liveStreamSortByAtom);

  return useMemo(() => {
    if (!videos) return [];

    const sortedVideos = videos.slice();
    let compareFn;

    // Sort for stream schedule
    if (videoContext === "stream_schedule") {
      const liveStreamSortOption =
        overrides?.liveStreamSortBy ?? liveStreamSortBy;
      // We don't sort by "latest", since within the stream schedule context,
      // videos are already sorted by "latest" before this hook is called.
      if (liveStreamSortOption === "viewers") {
        compareFn = (a: VideoBase, b: VideoBase) => {
          return (b.live_viewers ?? 0) - (a.live_viewers ?? 0);
        };
      }
    }

    if (typeof compareFn === "function") {
      sortedVideos.sort(compareFn);
    }

    return sortedVideos;
  }, [videos, videoContext, overrides?.liveStreamSortBy, liveStreamSortBy]);
}
