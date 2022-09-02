// import type { Playlist } from "@/utils/types";

type CurrentPlaylistStore = {
  setOfIds: Set<string>;
};
export const usePlaylistVideoIDCache = defineStore("currentPlaylist", {
  // convert to a function
  state: (): CurrentPlaylistStore => {
    return {
      setOfIds: new Set(),
    };
  },
  getters: {
    contains(state): (id: string) => boolean | undefined {
      return (id: string) => state.setOfIds.has(id);
    },
  },
  // getters: {},
  // actions: {},
  share: {
    enable: false,
    initialize: false, // when initializing, fetch from another tab.
  },
  persistedState: {
    persist: false,
  },
});

// persisted remembering which playlist we're counting as 'current'
export const usePlaylistState = defineStore("currentPlaylistStore", {
  // convert to a function
  state: (): { currentPlaylistId?: string | number } => {
    return {
      currentPlaylistId: undefined,
    };
  },
  share: {
    enable: false,
    initialize: true, // when initializing, fetch from another tab.
  },
  persistedState: {
    persist: true,
  },
});
