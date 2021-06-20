/* eslint-disable no-shadow */
import kvidb from "kv-idb";

const db = kvidb("watch-history");

const initialState = {
    lastCheck: Date.now(),
};

export const state = { ...initialState };

const getters = {
    hasWatched: (state) => {
        return (
            state.lastCheck &&
            (async (videoId) => {
                return new Promise((res, rej) =>
                    db.get(videoId, (e, x) => {
                        if (e) res(0);
                        if (x) res(x);
                        rej(new Error("weird"));
                    }),
                );
            })
        );
    },
};

const actions = {
    addWatchedVideo({ commit }, video) {
        db.put(video.id, 1, (e, x) => {
            if (x) commit("update");
        });
    },
    resetWatchHistory({ commit }) {
        db.clear((e, x) => {
            if (x) commit("update");
        });
    },
};

const mutations = {
    update(state) {
        state.lastCheck = Date.now();
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
