/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    id: null,
    channel: {},
    isLoading: true,
    hasError: false,
};

export const state = { ...initialState };

const getters = {};

const actions = {
    fetchChannel({ state, commit }) {
        if (!state.id) return commit("fetchError");

        commit("fetchStart");
        return api
            .channel(state.id)
            .then(({ data }) => {
                commit("setChannel", data);
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
        state.isLoading = false;
    },
    setId(state, id) {
        state.id = id;
    },
    setChannel(state, channel) {
        state.channel = channel;
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
