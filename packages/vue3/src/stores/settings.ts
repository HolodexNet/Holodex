/**
 * Persistent (and X-Tab Shared) Long Term Storage for Site-wide State
 */
interface SettingStatePersistentShared {
  redirectMode: boolean;
  autoplayVideo: boolean;
  scrollMode: boolean;
  hideThumbnail: boolean;
  hidePlaceholder: boolean;
  hideCollabStreams: boolean;
  ignoredTopics: string[];
  blockedChannels: [];
  homeViewMode: "grid" | "list" | "denseList";
  gridDensity: number;
  defaultOpen: string;
}

export const useSettingsStore = defineStore("settings", {
  // convert to a function
  state: (): SettingStatePersistentShared => ({
    redirectMode: false,
    autoplayVideo: false,
    scrollMode: false,
    hideThumbnail: false,
    hidePlaceholder: false,
    hideCollabStreams: false,
    ignoredTopics: [],
    blockedChannels: [],
    homeViewMode: "grid",
    gridDensity: 0,
    defaultOpen: "Home",
  }),
  share: {
    enable: true,
    initialize: true, // when initializing, fetch from another tab.
  },
  persistedState: {
    persist: true,
  },
});
