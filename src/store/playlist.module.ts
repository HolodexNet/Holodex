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
    },
    isSaved: false,
};

export const state = { ...initialState };

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
        Vue.set(state, "active", playlist);
        state.isSaved = false;
    },
    addVideo(state, video) {
        state.active.videos.unshift(video);
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
    removeVideoByIndex(state, index: number) {},
    removeVideoByID(state, videoId: string) {},
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
        commit("setPlaylist", playlist[0]);
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
    // getters,
    actions,
    mutations,
};
