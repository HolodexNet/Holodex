import axios from "axios";
import axiosRetry from "axios-retry";
import { dayjs } from "@/utils/time";
import querystring from "querystring";
import { CHANNEL_URL_REGEX, VIDEO_URL_REGEX } from "./consts";

export const API_BASE_URL =
    process.env.NODE_ENV === "development" ? "http://localhost:2434" : `${window.location.origin}/api`;
// export const API_BASE_URL = "http://holodex.net/api";

export const axiosInstance = axios.create({
    // baseURL: process.env.NODE_ENV === "development" ? "https://staging.holodex.net/api/v2" : "/api/v2",
    baseURL: `${API_BASE_URL}/v2`,
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
    live(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/live?${q}`).then((res) =>
            res.data
                // .concat(res.data.upcoming)
                // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                .filter((live) => !(!live.start_actual && dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h")))),
        );
    },
    channel(id) {
        return axiosInstance.get(`/channels/${id}`);
    },
    video(id) {
        return axiosInstance.get(`/videos/${id}`);
    },
    comments(videoId) {
        return axiosInstance.get(`/videos/${videoId}/comments`);
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
    searchAutocomplete(query) {
        const channelId = query.match(CHANNEL_URL_REGEX);
        const videoId = query.match(VIDEO_URL_REGEX);

        if (channelId && !channelId[0].includes("/c/"))
            return axiosInstance.get(`/search/autocomplete?q=${channelId[1]}`);

        if (videoId) return { data: [{ type: "video url", value: `${videoId[1]}` }] };

        return axiosInstance.get(`/search/autocomplete?q=${query}`);
    },
    searchVideo(queryObject) {
        return axiosInstance.post("/search/videoSearch", queryObject);
    },
    searchComments(queryObject) {
        return axiosInstance.post("/search/commentSearch", queryObject);
    },

    channelVideos(channelId, { type = "videos", query }) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/channels/${channelId}/${type}?${q}`);
    },
    login(jwt, authToken, service) {
        return axiosInstance.post(
            "/user/login",
            { token: authToken, service },
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
    },
    loginIsValid(jwt) {
        return axiosInstance
            .get("/user/check", {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            })
            .catch(() => false);
    },
    resetAPIKey(jwt) {
        return (
            axiosInstance
                .get("/user/createKey", {
                    headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
                })
                // eslint-disable-next-line no-alert
                .catch(() => alert("something went wrong creating your key..."))
        );
    },

    favorites(jwt) {
        return axiosInstance.get("/users/favorites", {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    favoritesVideos(jwt, query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/users/videos?${q}`, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    favoritesLive(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/users/live?${q}`).then((res) =>
            res.data
                // .concat(res.data.upcoming)
                // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                .filter((live) => !(!live.start_actual && dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h"))))
                // get currently live and upcoming lives within the next 3 weeks
                .filter((live) => dayjs(live.start_scheduled).isBefore(dayjs().add(3, "w"))),
        );
    },
    patchFavorites(jwt, operations) {
        return axiosInstance.patch("/users/favorites", operations, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    topics() {
        // gets topics from backend
        return axiosInstance.get("/topics");
    },
    topicSet(topicId, videoId, jwt) {
        return axiosInstance.post(
            "/topics/video",
            { videoId, topicId },
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
    },
    rotation() {
        return axiosInstance.get("/rotation");
    },
    songListByVideo(channelId, videoId, allowCache) {
        const dt = allowCache ? "_" : Date.now();
        return axiosInstance.post(`/songs/latest?c=${dt}`, { channel_id: channelId, video_id: videoId });
    },
    tryCreateSong(songObj, jwt) {
        return axiosInstance.put("/songs", songObj, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    deleteSong(songObj, jwt) {
        return axiosInstance.delete("/songs", {
            data: { ...songObj },

            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    chatHistory(id) {
        return axiosInstance.get(`/chat/${id}/history`);
    },
    /**
     * Fetches song lists up to LIMIT count with offset. Always ordered by available_at date.
     * @param {{org?, channel_id?, video_id?, q?}} condition one of the conditions
     * @param {number} offset
     * @param {number} limit
     */
    songListByCondition(condition, offset, limit) {
        return axiosInstance.post("/songs/latest", { ...condition, offset, limit });
    },
    trackSongPlay(channelId, videoId, name) {
        return axiosInstance.get(`/songs/record/${channelId}/${videoId}/${name}`);
    },
};
