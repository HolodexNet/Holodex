/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    orgs: [],
};

export const state = { ...initialState };

const getters = {};

const actions = {
    async fetchOrgs({ commit }) {
        commit("setOrgs", [
            ...(this.hideAllVTubers ? [] : [{ name: "All Vtubers", short: "Vtuber", name_jp: null }]),
            ...(await api.orgs()).sort(
                (a, b) => a.name.toLowerCase().charCodeAt(0) - b.name.toLowerCase().charCodeAt(0),
            ),
        ]);
    },
};

const mutations = {
    setOrgs(state, orgs) {
        state.orgs = orgs;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
