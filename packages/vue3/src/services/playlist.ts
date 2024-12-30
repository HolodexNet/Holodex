import { useSiteStore } from "@/stores/site";
import backendApi from "@/utils/backend-api";
import { Playlist } from "@/utils/types";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/vue-query";
import { queryClient } from "@/setup/setupQueryPlugin";
import type { MaybeRef } from "@vueuse/core";
import { usePlaylistState } from "@/stores/playlist";
import { debounce } from "@/utils/functions";
import clone from "clone";

type QueryConfig<TReturn> = Omit<
  UseQueryOptions<TReturn, unknown, TReturn, any>,
  "queryKey" | "queryFn"
> & {
  enabled?: MaybeRef<boolean>;
};

export function usePlaylistList() {
  const user = useSiteStore();

  return useQuery(
    ["playlists", user.jwtToken] as const,
    async (q) => {
      if (!q.queryKey[1]) throw new Error("not logged in");
      return (await backendApi.getPlaylistList(q.queryKey[1])).data;
    },
    {
      enabled: true,
      staleTime: 10 * 60 * 1000,
      cacheTime: 24 * 60 * 60 * 1000,
    },
  );
}

export function usePlaylist(
  id?: MaybeRef<string | number | undefined>,
  confs?: QueryConfig<Playlist>,
) {
  if (!id) {
    id = storeToRefs(usePlaylistState()).currentPlaylistId;
  }
  const user = useSiteStore();

  return useQuery(
    ["playlist", id] as const,
    async (q) => {
      if (!q.queryKey[1])
        return { name: "Undefined Playlist", user_id: -1, videos: [] };
      const playlist = (await backendApi.getPlaylist(q.queryKey[1])).data;
      // playlist._videoIdSet = new Set(playlist.videos?.map((x) => x.id));
      return playlist;
    },
    {
      enabled: true,
      staleTime: 40 * 60 * 1000,
      cacheTime: 24 * 60 * 60 * 1000,
      ...confs,
    },
  );
}

// export function usePlaylistContains(videoId: MaybeRef<string>) {
//   const playlist = usePlaylist();
//   return computed(() => playlist.data.value?._videoIdSet?.has(unref(videoId)));
// }

const _debounced_invalidatePlaylist = debounce((id: any) => {
  console.log("evicting playlist,", id);
  queryClient.invalidateQueries(["playlist", id]);
}, 10000);

export function usePlaylistPatcher() {
  const user = useSiteStore();

  return useMutation(
    async (playlist: Playlist) => {
      if (!user.jwtToken)
        throw new Error("Can't save playlist when not logged in");
      if (user.user?.id != playlist.user_id) {
        console.log(user.user?.id, playlist);

        throw new Error("Can't save playlist when you don't own it!");
      }
      const returnedId: string = (
        await backendApi.savePlaylist(
          {
            ...playlist,
            videos: [],
            video_ids: playlist.videos?.map((x) => x.id) || [],
          },
          user.jwtToken,
        )
      ).data;

      return returnedId;
    },
    {
      onSettled(data, err, variables, ctx) {
        if (variables.id) {
          queryClient.setQueryData(["playlist", variables.id], variables);
          _debounced_invalidatePlaylist(variables.id);
        } else {
          queryClient.invalidateQueries(["playlist", data]);
        }
      },
    },
  );
}

export function usePlaylistDeleter() {
  const user = useSiteStore();

  return useMutation(async (playlist: Playlist) => {
    if (!user.jwtToken)
      throw new Error("Can't delete playlist when not logged in");
    if (user.user?.id != playlist.user_id) {
      console.log(user.user?.id, playlist.user_id);
      throw new Error("Can't delete playlist when you don't own it!");
    }
    if (!playlist.id)
      throw new Error("Can't delete playlist when ID doesn't exist!");

    return await backendApi.deletePlaylist(playlist.id, user.jwtToken);
  });
}

/**
 * Bootstraps functions to modify the Playlist object, purely a helper, do not persist in memory or expect reactivity.
 *
 * Use Vue-Query `usePlaylistPatcher` and `usePlaylist` for correct reactivity..
 */
export class EditablePlaylist {
  current: Playlist;
  _videoIdSet: Set<string>;

  constructor(playlist: Playlist) {
    this.current = clone(playlist);
    this._videoIdSet = new Set(playlist.videos?.map((x) => x.id));
  }

  addId(video: VideoRef) {
    if (this._videoIdSet.has(video.id)) return; // early return coz already has it.
    const nl = this.current.videos || [];
    nl.push(video);
    this.current.videos = nl;
    this._videoIdSet.add(video.id);

    return this;
  }

  removeId(id: string) {
    if (this._videoIdSet.has(id)) {
      this.current.videos = this.current.videos?.filter((x) => x.id !== id);
      this._videoIdSet.delete(id);
    }

    return this;
  }

  reorder(videoId: string, dir: "up" | "down") {
    if (!this._videoIdSet.has(videoId) || !this.current.videos) return this; // early return coz no such video.

    const from = this.current.videos.findIndex(({ id }) => id === videoId);
    const a = this.current.videos[from];
    const to = dir === "down" ? from + 1 : from - 1;
    this.current.videos[from] = this.current.videos[to];
    this.current.videos[to] = a;

    return this;
  }

  rename(newName: string) {
    this.current.name = newName;

    return this;
  }

  valueOf() {
    return this.current;
  }
}
