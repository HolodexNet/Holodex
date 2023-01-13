import { useSettingsStore } from "@/stores/settings";
import { Ref } from "vue";
import { useFavoritesIDSet } from "./favorites";

export function useVideoFilter(
  videoList: Ref<{ items: Video[] } | undefined>,
  q: Ref<VideoListLookup>
) {
  const settings = useSettingsStore();
  const favesList = useFavoritesIDSet();

  return computed(() => {
    const shouldHideCollabStreams =
      (q.value.type === "stream_schedule" || q.value.type === "archive") && // must be archive or stream schedule tab
      settings.hideCollabStreams && // must be configured to hide collab streams.
      ((q.value.flavor as FavLookup)?.favorites
        ? true // favorites then yes.
        : q.value.flavor?.org !== "All Vtubers"); // don't hide collabs on all vtubers since every vtuber is in the org yes?

    const hasBlockedChannels = settings.blockedChannels.length > 0;

    return (
      videoList.value?.items.filter((x) => {
        let keep = true;

        if (hasBlockedChannels) {
          keep &&= !settings.blockedSet.has(x.channel.id);
        }

        if (shouldHideCollabStreams) {
          keep &&= !!(
            x.channel.org == q.value.flavor?.org ||
            favesList.value?.has(x.channel.id)
          );
        }

        // if (hideIgnoredTopics) {
        keep &&= !settings.ignoredTopics.includes(x.topic_id ?? "");
        // }

        return keep;
      }) || []
    );
  });
}
