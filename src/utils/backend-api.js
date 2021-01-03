import axios from "axios";
import axiosRetry from "axios-retry";
import { dayjs } from "@/utils/time";
import querystring from "querystring";

export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "http://localhost:2434/v2" : "https://holodex.net/api/v1",
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED",
    shouldResetTimeout: true,
});

export const axiosV2 = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "http://localhost:2434/v2/" : "http://holodex.net/api/v2/",
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED",
    shouldResetTimeout: true,
});

export default {
    channels(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/channels?${q}`);
    },
    videos(query) {
        const q = querystring.stringify(query);
        // console.log(`/videos?${q}`);
        return axiosInstance.get(`/videos?${q}`);
    },
    live() {
        return axiosInstance.get("/live").then((res) =>
            res.data.videos
                // .concat(res.data.upcoming)
                // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                .filter((live) => !(!live.live_start && dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h"))))
                // get currently live and upcoming lives within the next 3 weeks
                .filter((live) => dayjs(live.start_scheduled).isBefore(dayjs().add(3, "w"))),
        );
    },
    channel(id) {
        return axiosInstance.get(`/channels/${id}`);
    },
    video(id) {
        return axiosInstance.get(`/videos/${id}`);
    },
    // eslint-disable-next-line camelcase
    videoLiveChat(id, type, time_start) {
        const q = querystring.stringify({ type, time_start });
        return axiosInstance.get(`/videos/${id}/live_chat?${q}`);
    },
    videoLiveChatSummary(id) {
        return axiosInstance.get(`/videos/${id}/live_chat/summary`);
    },
    clips(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/clips?${q}`);
    },
    searchTags(query, limit = 10, offset = 0) {
        return axiosInstance.get(`/tags/search?q=${query}&limit=${limit}&offset=${offset}`);
    },
    channelVideos(channelId, { type = "videos", query }) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/channels/${channelId}/${type}?${q}`);
    },
    login(jwt, authToken, service) {
        return axiosV2.post(
            "/user/login",
            { token: authToken, service },
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
    },
};
