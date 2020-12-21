import axios from "axios";
import axiosRetry from "axios-retry";
import dayjs from "dayjs";
import querystring from "querystring";

export const axiosInstance = axios.create({
    baseURL:
        process.env.NODE_ENV === "development" ? "https://staging.holodex.net/api/v1" : "https://holodex.net/api/v1",
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
            res.data.live
                .concat(res.data.upcoming)
                // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                .filter((live) => !(!live.live_start && dayjs().isAfter(dayjs(live.live_schedule).add(2, "h"))))
                // get currently live and upcoming lives within the next 3 weeks
                .filter((live) => dayjs(live.live_schedule).isBefore(dayjs().add(3, "w"))),
        );
    },
    channel(channelId) {
        return axiosInstance.get(`/channels/${channelId}`);
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
    channelStats(channelId) {
        return axiosInstance.get(`/channels/${channelId}/stats`);
    },
};
