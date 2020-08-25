import axios from "axios";

export default {
    vtuberChannels(limit = 100, offset = 0) {
        return axios_instance.get(
            `/channels?type=vtuber&limit=${limit}&offset=${offset}&sort=subscriber_count&order=desc`
        );
    },
    subberChannels(limit = 100, offset = 0) {
        return axios_instance.get(
            `/channels?type=subber&limit=${limit}&offset=${offset}&sort=subscriber_count&order=desc`
        );
    },
    videos(channel_id) {
        return axios_instance.get(`/videos?channel_id=${channel_id}`);
    },
    live(channel_id = null) {
        return axios_instance.get(`/live` + (channel_id ? `?channel_id=${channel_id}` : ''));
    },
    channel(channel_id) {
        return axios_instance.get(`/channels/${channel_id}`);
    },
    video(id) {
        return axios_instance.get(`/videos/${id}`);
    },
};

export const axios_instance = axios.create({
    baseURL: `http://mythra.local:2434/v1`,
    timeout: 50000,
});
