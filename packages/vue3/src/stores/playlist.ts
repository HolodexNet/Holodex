// import type { Playlist } from "@/utils/types";

import { EditablePlaylist, usePlaylistPatcher } from "@/services/playlist";
import { VIDEO_TYPES } from "@/utils/consts";

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

export const useTogglePlaylistVideo = (video: VideoRef) => {
  const playlistCache = usePlaylistVideoIDCache();

  const playlist = inject("currentPlaylist") as any;
  const patcher = usePlaylistPatcher();
  const hasSaved = computed(() => playlistCache.setOfIds.has(video.id));
  function toggleSaved() {
    if (video.type === VIDEO_TYPES.PLACEHOLDER) return; // huh.
    // UseQueryReturnType<Playlist | undefined, unknown, QueryObserverResult<Playlist | undefined, unknown>>
    console.log("changing: ", playlist.data.value);
    const changed = new EditablePlaylist(playlist.data.value as any);
    if (hasSaved.value) changed.removeId(video.id);
    else changed.addId(video);

    patcher.mutate(changed.valueOf());
  }
  return { hasSaved, toggleSaved };
};
