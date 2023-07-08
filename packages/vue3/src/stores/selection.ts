/**
 * Store powering sitewide selection system.
 */

import backendApi from "@/utils/backend-api";
import { useQuery } from "@tanstack/vue-query";

interface SelectionState {
  selectedVideos: (VideoRef & Partial<Video>)[];
  selectionMode: boolean;
  context: {
    // contextual information donated by other pages.
    pageVideo?: VideoRef;
    pageChannel?: ShortChannel;
  };
}
export const useVideoSelection = defineStore("selection", {
  // convert to a function
  state: (): SelectionState => ({
    selectedVideos: [],
    selectionMode: false,
    context: {},
  }),
  getters: {
    contains(s) {
      const set = new Set(s.selectedVideos.map((x) => x.id));
      return (id: string) => set.has(id);
    },
  },
  share: {
    enable: false,
    initialize: false, // when initializing, fetch from another tab.
  },
  persistedState: {
    persist: false,
  },
});

const selectableVideosForMentions = ref<string[]>([]);

/**
 * Retrieves the up-to-date mentions for a given ID.
 *
 * @param {string} id - The identifier for the mentions.
 * @param {boolean} alwaysEnable - (optional) Determines if mentions are always enabled.
 * @return {ComputedRef<any>} - The computed reference to the up-to-date mentions.
 */
export function getUpToDateMentions(
  id: string,
  alwaysEnable = false,
): ComputedRef<ShortChannel[]> {
  onMounted(() => {
    selectableVideosForMentions.value.push(id);
  });
  onBeforeUnmount(() => {
    selectableVideosForMentions.value.splice(
      selectableVideosForMentions.value.indexOf(id),
      1,
    );
  });

  const selection = useVideoSelection();
  const enabled = computed(
    () => selection.selectionMode || alwaysEnable /* && other conditions */,
  );
  const uniqueIds = computed(() => {
    return [...new Set(selectableVideosForMentions.value)].sort();
  });
  const bulkMentionsResponse = useQuery(
    ["mentions_bulk", uniqueIds] as const,
    async (q) => {
      console.log(q);
      const ids = q.queryKey[1] as unknown as string[];
      return backendApi.v3BulkGetMentions({ ids });
    },
    { enabled, staleTime: 0, cacheTime: 0 },
  );

  return computed(() => bulkMentionsResponse.data.value?.data[id] ?? []);
}
