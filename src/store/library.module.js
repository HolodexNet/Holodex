/* eslint-disable no-shadow */
import Vue from "vue";
import { dayjs } from "@/utils/time";

function getMinVideoObj(video) {
    // eslint-disable-next-line camelcase
    const { id, title, available_at, duration_secs } = video;
    return {
        id,
        title,
        channel: {
            id: video.channel.id,
            name: video.channel.name,
            english_name: video.channel.name_en,
            type: video.channel.type,
        },
        available_at,
        duration_secs,
        added_at: dayjs().format(),
    };
}

const initialState = {
    savedVideos: {},
    watchedVideos: {},
};

export const state = { ...initialState };

const getters = {
    hasWatched: (state) => (videoId) => Object.prototype.hasOwnProperty.call(state.watchedVideos, videoId),
    hasSaved: (state) => (videoId) => Object.prototype.hasOwnProperty.call(state.savedVideos, videoId),
};

const actions = {};

const mutations = {
    addWatchedVideo(state, video) {
        Vue.set(state.watchedVideos, video.id, getMinVideoObj(video));
    },
    addSavedVideo(state, video) {
        Vue.set(state.savedVideos, video.id, getMinVideoObj(video));
    },
    removeSavedVideo(state, videoId) {
        Vue.delete(state.savedVideos, videoId);
    },
    resetChannels(state) {
        state.currentOffset = 0;
        state.channels = [];
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
