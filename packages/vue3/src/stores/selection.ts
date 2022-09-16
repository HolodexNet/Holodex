/**
 * Store powering sitewide selection system.
 */

interface SelectionState {
  selectedVideos: VideoRef[];
  selectionMode: boolean;
}
export const useVideoSelection = defineStore("selection", {
  // convert to a function
  state: (): SelectionState => ({
    selectedVideos: [],
    selectionMode: false,
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
