import Vue from "vue";
import backendApi from "@/utils/backend-api";
import type { Playlist } from "@/utils/types";
import { useSiteStore } from "./site";

type PlaylistStore = {
  active: {
    id?: string;
    user_id?: string;
    name: string;
    videos: (VideoRef | VideoDetailed)[]; // kinda hard to say how much data is in each video.
    updated_at?: any; // not sure if this is relevant, not being used anywhere.
  };
  isSaved: boolean;
};
export const usePlaylistStore = defineStore("playlist", {
  // convert to a function
  state: (): PlaylistStore => {
    return {
      active: {
        id: undefined,
        user_id: undefined,
        name: "Unnamed Playlist",
        videos: [],
        updated_at: undefined,
      },
      isSaved: false,
    };
  },
  getters: {
    videoIds: (state) => new Set(state.active.videos.map((x) => x.id)),
    contains(): (id: string) => boolean {
      return (id: string) => this.videoIds.has(id);
    },
  },
  actions: {
    // Modification functions:
    // =============================

    setPlaylist(playlist: Playlist) {
      // Videos can be undefined, make sure it's at least []
      this.active = { videos: [], ...playlist } as any;
      this.isSaved = false;
    },
    addVideo<T extends VideoRef>(video: T) {
      if (this.active.videos.findIndex((x) => x.id === video.id) >= 0) return;
      this.active.videos.push(video);
      this.isSaved = false;
    },
    addVideos<T extends VideoRef>(videos: T[]) {
      const ids = this.videoIds;
      videos.forEach((video) => {
        if (ids.has(video.id)) return;
        ids.add(video.id);
        this.active.videos.push(video);
        this.isSaved = false;
      });
    },
    reorder({ from, to }: { from: number; to: number }) {
      // https://stackoverflow.com/a/39271175
      this.active.videos = this.active.videos.reduce(
        (prev: VideoRef[], current, idx, self) => {
          if (from === to) {
            prev.push(current);
          }
          if (idx === from) {
            return prev;
          }
          if (from < to) {
            prev.push(current);
          }
          if (idx === to) {
            prev.push(self[from]);
          }
          if (from > to) {
            prev.push(current);
          }
          return prev;
        },
        []
      );

      this.isSaved = false;
    },
    removeVideoByIndex(index: number) {
      this.active.videos = this.active.videos.filter((_, idx) => idx !== index);
      this.isSaved = false;
    },
    removeVideoByID(videoId: string) {
      this.active.videos = this.active.videos.filter((x) => x.id !== videoId);
      this.isSaved = false;
    },

    async saveActivePlaylist() {
      const site = useSiteStore();
      const currentUserId = site.userdata?.user.id;
      const currentUserJWT = site.userdata?.jwt;

      if (!currentUserJWT) {
        // you cannot save.

        // TODO generate error dialog here.
        return;
      }

      // save the playlist
      // remember the ID returned by the server inside active.id
      // optionally: refetch via ID just to make sure.
      const playlist = { ...this.active };
      if (!this.active.user_id || !this.active.id) {
        playlist.user_id = currentUserId;
      } else if (this.active.user_id !== currentUserId) {
        playlist.id = undefined;
        playlist.user_id = currentUserId;
      }

      this.active = playlist;

      if (!this.active.id) {
        const res = await backendApi.savePlaylist(
          {
            ...this.active,
            videos: [],
            video_ids: playlist.videos.map((x) => x.id),
          },
          currentUserJWT
        );
        const returnedId = res.data;
        if (returnedId) {
          this.active.id = returnedId;
          this.isSaved = true;
        }
      } else {
        const res = await backendApi.savePlaylist(
          {
            ...this.active,
            videos: [],
            video_ids: playlist.videos.map((x) => x.id),
          },
          currentUserJWT
        );
        if (res.data) {
          this.isSaved = true;
        }
      }
    },
    async setActivePlaylistByID(playlistId: number | string) {
      const res = await backendApi.getPlaylist(playlistId);
      const playlist = res.data;
      this.active = playlist as any;
      this.isSaved = true;
    },
    async deleteActivePlaylist() {
      const site = useSiteStore();
      const currentUserId = site.userdata?.user.id;
      const currentUserJWT = site.userdata?.jwt;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (
        this.active.id &&
        currentUserJWT &&
        +this.active.user_id! === +currentUserId!
      ) {
        // can only be done if the active playlist has an ID
        await backendApi.deletePlaylist(this.active.id, currentUserJWT);
      }
      this.active = {
        id: undefined,
        user_id: undefined,
        name: "Unnamed Playlist",
        videos: [],
        updated_at: undefined,
      };
      this.isSaved = false;
      // if not, just clear the current playlist.
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
