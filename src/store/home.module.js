/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    live: [],
    isLoading: true,
    hasError: false,
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
    fetchLive({ commit, rootState }, params) {
        commit("fetchStart");
        return api
            .live({
                org: rootState.currentOrg,
                ...params,
            })
            .then((res) => {
                commit("setLive", res);
                commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                commit("fetchError");
            });
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
