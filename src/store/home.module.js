/* eslint-disable no-shadow */
import api from "@/utils/backend-api";
import { videoTemporalComparator } from "@/utils/functions";

const initialState = {
    live: [],
    isLoading: true,
    hasError: false,
    lastLiveUpdate: 0,
};

export const state = {
    ...initialState,
};

const getters = {};

const actions = {
    fetchLive({ state, commit, rootState }, { force = false, minutes = 5 }) {
        if (rootState.visibilityState === "hidden" && !force) return null;
        if (
            state.hasError
            || force
            || !state.lastLiveUpdate
            || Date.now() - state.lastLiveUpdate > minutes * 60 * 1000
        ) {
            commit("fetchStart");
            return api
                .live({
                    org: rootState.currentOrg.name,
                })
                .then((res) => {
                    res.sort(videoTemporalComparator);

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
