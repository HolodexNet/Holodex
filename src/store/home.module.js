/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    live: [],
    isLoading: true,
    hasError: false,
    lastLiveUpdate: 0,
};

const persistState = {
    recentVideoFilter: "all",
};

export const state = {
    ...initialState,
    ...persistState,
};

const getters = {};

const actions = {
    fetchLive({ commit, rootState }, { force = false, minutes = 3 }) {
        if (rootState.visibilityState === "hidden" && !force) return null;
        if (
            state.hasError ||
            force ||
            !state.lastLiveUpdate ||
            Date.now() - state.lastLiveUpdate > minutes * 60 * 1000
        ) {
            commit("fetchStart");
            return api
                .live({
                    org: rootState.currentOrg,
                    include: "mentions",
                })
                .then((res) => {
                    commit("setLive", res);
                    commit("fetchEnd");
                })
                .catch((e) => {
                    console.error(e);
                    commit("fetchError");
                });
        }
        return null;
    },
};

const mutations = {
    fetchStart(state) {
        state.isLoading = true;
    },
    fetchEnd(state) {
        state.isLoading = false;
    },
    fetchError(state) {
        state.hasError = true;
    },
    setLive(state, live) {
        state.live = live;
        state.lastLiveUpdate = Date.now();
    },
    setRecentVideoFilter(state, filter) {
        state.recentVideoFilter = filter;
    },
    resetState(state) {
        Object.assign(state, initialState);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
