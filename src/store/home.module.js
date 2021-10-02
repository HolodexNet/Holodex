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
        if (rootState.visibilityState === "hidden" && !force) {
            console.log("[X] Fetch of Home Live declined: window is hidden and not being forced.");
            return null;
        }
        if (
            state.hasError
            || force
            || !state.lastLiveUpdate
            || Date.now() - state.lastLiveUpdate > minutes * 60 * 1000
        ) {
            console.log("[OK] Fetch of Home Live executing");
            commit("fetchStart");
            return api
                .live({
                    type: "ghost",
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
        console.log(`[X] Fetch of Home Live declined: error + not forced + hasn't been ${minutes} minutes yet.`);
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
