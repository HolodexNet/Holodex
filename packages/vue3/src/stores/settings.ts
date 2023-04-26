/**
 * Persistent (and X-Tab Shared) Long Term Storage for Site-wide State
 */
export interface VideoListFilters {
  hideCollabStreams: boolean;
  ignoredTopics: string[];
  blockedChannels: ShortChannel[];
  filterDeadStreams: boolean;
}
interface SettingStatePersistentShared {
  redirectMode: boolean;
  // autoplayVideo: boolean; // auto play video should always be off.
  // scrollMode: boolean; // scroll mode is deprecated - kinda complicated until we have a good virtual scroller
  hideThumbnail: boolean;
  hidePlaceholder: boolean;
  homeViewMode: "grid" | "list" | "denseList";
  gridDensity: number;
  defaultOpen: string;
}

export const useSettingsStore = defineStore("settings", {
  // convert to a function
  state: (): SettingStatePersistentShared & VideoListFilters => ({
    redirectMode: false,
    // autoplayVideo: false,
    // scrollMode: false,
    hideThumbnail: false,
    hidePlaceholder: false,
    hideCollabStreams: false,
    filterDeadStreams: true,
    ignoredTopics: [],
    blockedChannels: [],
    homeViewMode: "grid",
    gridDensity: 0,
    defaultOpen: "Home",
  }),
  getters: {
    blockedSet(s) {
      return new Set(s.blockedChannels.map((x) => x.id));
    },
  },
  share: {
    enable: true,
    initialize: true, // when initializing, fetch from another tab.
  },
  persistedState: {
    persist: true,
  },
});
