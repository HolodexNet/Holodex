/**
 * Store powering sitewide selection system.
 */

interface SelectionState {
  selectedVideos: VideoRef[];
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
