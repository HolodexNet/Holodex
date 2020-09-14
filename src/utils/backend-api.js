import axios from "axios";
const querystring = require('querystring');

export default {
    vtuberChannels(limit = 25, offset = 0) {
        return axios_instance.get(
            `/channels?type=vtuber&limit=${limit}&offset=${offset}&sort=subscriber_count&order=desc`
        );
    },
    subberChannels(limit = 25, offset = 0) {
        return axios_instance.get(
            `/channels?type=subber&limit=${limit}&offset=${offset}&sort=subscriber_count&order=desc`
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
        return axios_instance.get(`/mentions/channel/${channel_id}?${q}`);
    },
};

export const axios_instance = axios.create({
    baseURL:
        process.env.NODE_ENV === "development"
            ? `http://mythra.local:2434/v1`
            : `/api/v1`,
    timeout: 50000,
});
