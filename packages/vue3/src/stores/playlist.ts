import type { Playlist } from "@/utils/types";

type CurrentPlaylistStore = {
  active: Playlist;
};
export const useCurrentPlaylist = defineStore("currentPlaylist", {
  // convert to a function
  state: (): CurrentPlaylistStore => {
    return {
      active: {
        id: undefined,
        user_id: "-1",
        name: "Unnamed Playlist",
        videos: [],
        _videoIdSet: new Set(),
      },
    };
  },
  getters: {
    // _videoIdSet(state): Set<string> | undefined {
    //   return state.active.videos
    //     ? new Set(state.active.videos.map((x) => x.id))
    //     : undefined;
    // },
    contains(state): (id: string) => boolean | undefined {
      return (id: string) => state.active._videoIdSet?.has(id);
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
