/* eslint-disable no-shadow */
import Vue from "vue";
import backendApi from "@/utils/backend-api";
import { Playlist } from "@/utils/types";

const initialState = {
    active: {
        id: undefined,
        user_id: undefined,
        name: "Unnamed Playlist",
        videos: [],
        updated_at: undefined,
    },
    isSaved: false,
};

export const state = { ...initialState };

const getters = {
    videoIds: (state) => new Set(state.active.videos.map((x) => x.id)),
    contains: (state, getters) => (id) => getters.videoIds.has(id),
};

const mutations = {
    saved(state) {
        // after you save the playlist
        state.isSaved = true;
    },
    modified(state) {
        // after each modification of the playlist.
        state.isSaved = false;
    },
    setPlaylist(state, playlist: Playlist) {
        // Videos can be undefined, make sure it's at least []
        Vue.set(state, "active", { videos: [], ...playlist });
        state.isSaved = false;
    },
    addVideo(state, video) {
        if (state.active.videos.findIndex((x) => x.id === video.id) >= 0) return;
        state.active.videos.unshift(video);
        state.isSaved = false;
    },
    addVideos(state, videos) {
        const ids = new Set(state.active.videos.map((x) => x.id));
        videos.forEach((video) => {
            if (ids.has(video.id)) return;
            ids.add(video.id);
            state.active.videos.unshift(video);
            state.isSaved = false;
        });
    },
    reorder(state, { from, to }: { from: number; to: number }) {
        // https://stackoverflow.com/a/39271175
        Vue.set(
            state.active,
            "videos",
            state.active.videos.reduce((prev, current, idx, self) => {
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
            }, []),
        );
        state.isSaved = false;
    },
    removeVideoByIndex(state, index: number) {
        Vue.set(
            state.active,
            "videos",
            state.active.videos.filter((_, idx) => idx !== index),
        );
    },
    removeVideoByID(state, videoId: string) {
        Vue.set(
            state.active,
            "videos",
            state.active.videos.filter((x) => x.id !== videoId),
        );
        state.isSaved = false;
    },
    /**
     * resets the playlist to a clean slate.
     */
    resetPlaylist(state) {
        Vue.set(state, "active", {
            id: undefined,
            user_id: undefined,
            name: "Unnamed Playlist",
            videos: [],
        });
    },
    resetState(state) {
        Object.assign(state, initialState);
    },
};

const actions = {
    async saveActivePlaylist({ state, rootState, commit }) {
        // save the playlist
        // remember the ID returned by the server inside active.id
        // optionally: refetch via ID just to make sure.
        const playlist = { ...state.active };
        if (!state.active.user_id || !state.active.id) {
            playlist.user_id = rootState.userdata.user.id;
        } else if (state.active.user_id !== rootState.userdata.user.id) {
            delete playlist.id;
            playlist.user_id = rootState.userdata.user.id;
        }
        commit("setPlaylist", playlist);

        if (!state.active.id) {
            const res = await backendApi.savePlaylist(
                { ...state.active, videos: [], video_ids: playlist.videos.map((x) => x.id) },
                rootState.userdata.jwt,
            );
            const returnedId = res.data;
            if (returnedId) {
                commit("setPlaylist", { ...playlist, id: returnedId });
                commit("saved");
            }
        } else {
            const res = await backendApi.savePlaylist(
                { ...state.active, videos: [], video_ids: playlist.videos.map((x) => x.id) },
                rootState.userdata.jwt,
            );
            if (res.data) {
                commit("saved");
            }
        }
    },
    async setActivePlaylistByID({ state, commit }, playlistId: number | string) {
        const res = await backendApi.getPlaylist(playlistId);
        const playlist = res.data;
        commit("setPlaylist", playlist);
        commit("saved");
    },
    async deleteActivePlaylist({ state, rootState, commit }) {
        if (state.active.id && rootState.userdata.jwt && +state.active.user_id === +rootState.userdata.user.id) {
            // can only be done if the active playlist has an ID
            await backendApi.deletePlaylist(state.active.id, rootState.userdata.jwt);
        }
        commit("resetPlaylist");
        // if not, just clear the current playlist.
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
