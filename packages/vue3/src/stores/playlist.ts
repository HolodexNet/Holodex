// import type { Playlist } from "@/utils/types";

import {
  EditablePlaylist,
  usePlaylist,
  usePlaylistPatcher,
} from "@/services/playlist";
import { CURRENT_PLAYLIST_PROVIDE_KEY, VIDEO_TYPES } from "@/utils/consts";
import { Playlist } from "@/utils/types";
import { UseQueryReturnType } from "@tanstack/vue-query";
import { createGlobalState } from "@vueuse/core";

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

export const useTogglePlaylistVideo = createGlobalState(() => {
  const idSet = usePlaylistVideoIDSet();

  const playlist = inject(CURRENT_PLAYLIST_PROVIDE_KEY) as UseQueryReturnType<
    Playlist,
    unknown
  >;
  const patcher = usePlaylistPatcher();
  function toggleSaved(video: VideoRef) {
    if (video.type === VIDEO_TYPES.PLACEHOLDER) return; // huh.
    // UseQueryReturnType<Playlist | undefined, unknown, QueryObserverResult<Playlist | undefined, unknown>>
    console.log("changing: ", playlist.data.value);
    const changed = new EditablePlaylist(playlist.data.value as any);
    if (idSet.value?.has(video.id)) changed.removeId(video.id);
    else changed.addId(video);

    patcher.mutate(changed.valueOf());
  }
  return { idSet, toggleSaved };
});

export const usePlaylistVideoIDSet = createGlobalState(() => {
  const list = usePlaylist();
  const set = computed(() => {
    console.log("computed playlist video id set");
    const ids = list.data?.value?.videos?.map((x) => x.id);
    return ids !== undefined ? new Set(ids) : undefined;
  });
  return set;
});
