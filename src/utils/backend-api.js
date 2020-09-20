import axios from "axios";
import axiosRetry from "axios-retry";

const querystring = require("querystring");

export default {
    channels(limit = 25, offset = 0, type = "vtuber") {
        return axios_instance.get(
            `/channels?type=${type}&limit=${limit}&offset=${offset}&sort=subscriber_count&order=desc`
        );
    },
    videos(query) {
        const q = querystring.stringify(query);
        console.log(`/videos?${q}`);
        return axios_instance.get(`/videos?${q}`);
    },
    live() {
        return axios_instance.get(`/live`);
    },
    channel(channel_id) {
        return axios_instance.get(`/channels/${channel_id}`);
    },
    video(id) {
        return axios_instance.get(`/videos/${id}`);
    },
    clips(query) {
        const q = querystring.stringify(query);
        return axios_instance.get(`/clips?${q}`);
    },
    mentions(query) {
        const channel_id = query.channel_id;
        delete query["channel_id"];
        const q = querystring.stringify(query);
        // return axios_instance.get(`/mentions/channel/${channel_id}?${q}`);
        return axios_instance.get(
            `/videos?mentioned_channel_id=${channel_id}&${q}`
        );
    },
    searchTags(query, limit = 10, offset = 0) {
        return axios_instance.get(
            `/tags/search?q=${query}&limit=${limit}&offset=${offset}`
        );
    },
};

export const axios_instance = axios.create({
    baseURL:
        process.env.NODE_ENV === "development"
            ? `http://mythra.local:2434/v1`
            : `/api/v1`,
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: error => {
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            error.code === "ECONNABORTED"
        );
    },
    shouldResetTimeout: true,
});
