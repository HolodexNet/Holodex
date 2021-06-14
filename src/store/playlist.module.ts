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
    },
    reorder(state, oldIndex: number, newIndex: number) {},
    removeVideoByIndex(state, index: number) {},
    removeVideoByID(state, videoId: string) {},
    /**
     * resets the playlist to a clean slate.
     */
    resetPlaylist(state) {},
};

const actions = {
    saveActivePlaylist({ state, commit }) {
        // save the playlist
        // remember the ID returned by the server inside active.id
        // optionally: refetch via ID just to make sure.
    },
    async setActivePlaylistByID({ state, commit }, playlistId: number | string) {
        const res = await backendApi.getPlaylist(playlistId);
        const playlist = res.data;
        commit("setPlaylist", playlist);
        commit("saved");
    },
    async deleteActivePlaylist({ state, rootState, commit }) {
        if (state.active.id && rootState.userdata.jwt && +state.active.user_id === +rootState.userdata.user.id) {
            await backendApi.deletePlaylist(state.active.id, rootState.userdata.jwt);
        }
        // can only be done if the active playlist has an ID
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
