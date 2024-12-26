import { useAtomValue } from "jotai";
import { useMemo } from "react";
import dayjs from "dayjs";
import { settingsAtom, blockedSetAtom } from "@/store/settings";
import { mostRecentOrgAtom } from "@/store/org";
import { useFavorites } from "@/services/user.service";

function filterDeadStreams(video: VideoBase, now: dayjs.Dayjs) {
  return !(
    !video.start_actual &&
    video.start_scheduled &&
    now.isAfter(dayjs(video.start_scheduled).add(2, "h"))
  );
}

function filterLongVideos(video: VideoBase) {
  if (video.status === "live") {
    return (
      Math.abs(dayjs(video.available_at).diff(dayjs())) < 24 * 60 * 60 * 1000
    );
  } else {
    return video.duration <= 24 * 60 * 60;
  }
}

type PageContext = "org" | "favorites" | "search" | "watch" | "channel";

export function useVideoFilter(
  videos: VideoBase[] | undefined,
  videoContext: "stream_schedule" | "archive" | "clip",
  pageContext: PageContext,
  overrides?: Partial<{
    hideCollabStreams: boolean;
    filterDeadStreams: boolean;
    filterLongVideos: boolean;
    ignoredTopics: string[];
  }>,
) {
  const settings = useAtomValue(settingsAtom);
  const blockedSet = useAtomValue(blockedSetAtom);
  const defaultOrg = useAtomValue(mostRecentOrgAtom);
  const { data: favorites } = useFavorites();

  const favoritesSet = useMemo(
    () => new Set(favorites?.map((fav) => fav.id) ?? []),
    [favorites],
  );

  return useMemo(() => {
    if (!videos) return [];

    const isStreamScheduleOrArchive =
      videoContext === "stream_schedule" || videoContext === "archive";
    const isHideCollabStreamsConfigured =
      overrides?.hideCollabStreams ?? settings.hideCollabStreams;
    const shouldHideCollabStreams =
      isStreamScheduleOrArchive && isHideCollabStreamsConfigured;
    const shouldFilterDeadStreams =
      videoContext === "stream_schedule" &&
      (overrides?.filterDeadStreams ?? settings.filterDeadStreams);
    const shouldFilterLongVideos =
      overrides?.filterLongVideos ?? settings.filterLongStreams;
    const now = shouldFilterDeadStreams ? dayjs() : null;

    const filteredVideos = videos.filter((video) => {
      let keep = true;

      // Filter blocked channels
      keep = keep && !blockedSet.has(video.channel.id);

      // Filter collab streams
      if (shouldHideCollabStreams) {
        switch (pageContext) {
          case "org":
            keep = keep && video.channel.org === defaultOrg;
            break;
          case "favorites":
            keep = keep && favoritesSet.has(video.channel.id);
            break;
          case "channel":
            // Assuming we're on a specific channel page, don't filter out collabs
            break;
          case "watch":
            // Assuming we're watching a specific video, don't filter out collabs
            break;
          // 'search' case is handled by not applying collab filtering at all
        }
      }

      // Filter dead streams
      if (shouldFilterDeadStreams && now) {
        keep = keep && filterDeadStreams(video, now);
      }

      // Filter long videos
      if (shouldFilterLongVideos) {
        keep = keep && filterLongVideos(video);
      }

      // Filter ignored topics
      const ignoredTopics = overrides?.ignoredTopics ?? settings.ignoredTopics;
      if (ignoredTopics.length > 0) {
        keep = keep && !ignoredTopics.includes(video.topic_id ?? "_N_A");
      }

      // filter clips whose channels and uploaders are all irrelevant to current context
      const videoMentions = (video as Partial<Video>).mentions;
      if (videoContext === "clip" && videoMentions) {
        keep =
          keep && // don't keep if every video is invalid
          ![...videoMentions, video.channel].every((mention) => {
            // thunk => true if video invalid for page context:
            const mentionBlocked = blockedSet.has(mention.id); // it has to be blocked
            switch (pageContext) {
              case "org":
                return mentionBlocked || mention.org !== defaultOrg; // and it has to be relevant to the org
              case "favorites":
                return mentionBlocked || !favoritesSet.has(mention.id); // or not your favorites list.
              case "channel":
              case "watch":
              case "search":
                return !mentionBlocked; // or just be blocked.
            }
          });
      }

      return keep;
    });

    // Sort for stream schedule
    if (videoContext === "stream_schedule") {
      filteredVideos.sort((a, b) => {
        if (a.available_at === b.available_at) return 0;
        return (a.available_at ?? "1990-01-01") >
          (b.available_at ?? "1990-01-01")
          ? 1
          : -1;
      });
    }

    return filteredVideos;
  }, [
    videos,
    videoContext,
    pageContext,
    settings,
    blockedSet,
    defaultOrg,
    favoritesSet,
    overrides,
  ]);
}
