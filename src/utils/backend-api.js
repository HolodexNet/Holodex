import axios from "axios";
import axiosRetry from "axios-retry";
import dayjs from "dayjs";
const querystring = require("querystring");

export default {
    channels(query) {
        const q = querystring.stringify(query);
        return axios_instance.get(`/channels?${q}`);
    },
    videos(query) {
        const q = querystring.stringify(query);
        // console.log(`/videos?${q}`);
        return axios_instance.get(`/videos?${q}`);
    },
    live() {
        return axios_instance.get(`/live`).then(res => {
            return (
                res.data.live
                    .concat(res.data.upcoming)
                    // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                    .filter(
                        live =>
                            !(
                                !live.live_start &&
                                dayjs().isAfter(
                                    dayjs(live.live_schedule).add(2, "h")
                                )
                            )
                    )
                    // get currently live and upcoming lives within the next 3 weeks
                    .filter(live => {
                        return dayjs(live.live_schedule).isBefore(
                            dayjs().add(3, "w")
                        );
                    })
            );
        });
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
    searchTags(query, limit = 10, offset = 0) {
        return axios_instance.get(
            `/tags/search?q=${query}&limit=${limit}&offset=${offset}`
        );
    },
    channel_stats(channel_id) {
        return axios_instance.get(`/channels/${channel_id}/stats`);
    },
};

export const axios_instance = axios.create({
    baseURL:
        process.env.NODE_ENV === "development"
            ? `http://mythra.local:2434/v1`
            //?  `https://holodex.net/api/v1`
            : `https://holodex.net/api/v1`,
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
