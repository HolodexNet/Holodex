import { dayjs } from "@/utils/time";
import axios, { AxiosResponse } from "axios";
import querystring from "querystring";
import { CHANNEL_URL_REGEX, VIDEO_URL_REGEX } from "./consts";
import type { Playlist, PlaylistList } from "./types";

// Need full domain for socket.io to work!!
export const API_BASE_URL = `${window.location.origin}/api`;
export const SITE_BASE_URL = `${window.location.origin}`;

export const axiosInstance = (() => {
    const instance = axios.create({ baseURL: `${API_BASE_URL}/v2` });
    return instance;
})();

export default {
    orgs() {
        // Use fetch api to take advantage of pre-fetch
        return fetch(`${SITE_BASE_URL}/orgs.json`).then((r) => r.json());
    },
    stats() {
        return axiosInstance({ url: "stats.json", baseURL: SITE_BASE_URL });
    },
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
        return axiosInstance.get(`/live?${q}`).then((res) => res.data
            // .concat(res.data.upcoming)
            // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
            .filter(
                (live) => !(
                    !live.start_actual
                    && dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h"))
                ),
            ));
    },
    channel(id) {
        return axiosInstance.get(`/channels/${id}`);
    },
    /**
   * Fetches a video
   * @param id the ID of the video
   * @param lang the acceptable subtitle languages
   * @param c whether to also provide comments, 1 to activate
   * @returns
   */
    video(id: string, lang?: string, c?: Number) {
        const q = querystring.stringify({ lang, c });
        return axiosInstance.get(`/videos/${id}?${q}`);
    },
    comments(videoId) {
        return axiosInstance.get(`/videos/${videoId}/comments`);
    },
    clips(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/clips?${q}`);
    },
    searchAutocomplete(query) {
        const channelId = query.match(CHANNEL_URL_REGEX);
        const videoId = query.match(VIDEO_URL_REGEX);

        if (channelId && !channelId[0].includes("/c/")) {
            return axiosInstance.get(`/search/autocomplete?q=${channelId[1]}`);
        }

        if (videoId) {
            return { data: [{ type: "video url", value: `${videoId[5]}` }] };
        }

        return axiosInstance.get(`/search/autocomplete?q=${query}`);
    },
    searchVideo(queryObject) {
        return axiosInstance.post("/search/videoSearch", queryObject);
    },
    searchComments(queryObject) {
        return axiosInstance.post("/search/commentSearch", queryObject);
    },
    searchChannel(queryObject) {
        return axiosInstance.post("/search/channelSearch", queryObject);
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
    loginIsValid(jwt): Promise<false | AxiosResponse<any>> {
        return axiosInstance
            .get("/user/check", {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            })
            .catch(() => false);
        // 301 Cache bust
        // fetch("https://holodex.net/api/v2/user/check", { method: "post" }).then(() => {});
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
    favoritesLive({ includePlaceholder = false }, jwt) {
        // const q = querystring.stringify(query);
        return axiosInstance
            .get(`/users/live?includePlaceholder=${includePlaceholder}`, {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            })
            .then((res) => res.data
                // .concat(res.data.upcoming)
                // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                .filter(
                    (live) => !(
                        !live.start_actual
                        && dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h"))
                    ),
                )
                // get currently live and upcoming lives within the next 3 weeks
                .filter((live) => dayjs(live.start_scheduled).isBefore(dayjs().add(3, "w"))));
    },
    patchFavorites(jwt, operations) {
        return axiosInstance.patch("/users/favorites", operations, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    getVideoTopic(videoId) {
        return axiosInstance.get(`/videos/${videoId}/topic`);
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
        return axiosInstance.post(`/songs/latest?c=${dt}`, {
            channel_id: channelId,
            video_id: videoId,
            limit: 999,
        });
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
    chatHistory(videoId, query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`videos/${videoId}/chats?${q}`);
    },
    getMentions(videoId) {
        return axiosInstance.get(`videos/${videoId}/mentions`);
    },
    deleteMentions(videoId, channelIds, jwt) {
        return axiosInstance.delete(`videos/${videoId}/mentions`, {
            data: {
                channel_ids: channelIds,
            },

            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    addMention(videoId, channelId, jwt) {
        return axiosInstance.post(
            `videos/${videoId}/mentions`,
            {
                channel_id: channelId,
            },
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
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
    trackSongPlay(channelId, videoId, name, jwt) {
        const urlsafe = querystring.stringify({ n: name });
        return axiosInstance.get(
            `/songs/record/${channelId}/${videoId}?${urlsafe}`,
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
    },
    trackSong(id: Number | string, jwt: string | undefined) {
        return axiosInstance.get(`/songs/record/${id}`, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    /**
   * Grabs top 20 songs from API.
   * @param {string?} org = org name
   * @param {string?} channelId = channel ID. only org name OR channel ID should be supplied, never both.
   */
    hot(org, channelId) {
        const q = querystring.stringify(
            org ? { org } : { channel_id: channelId },
        );
        return axiosInstance.get(`/songs/hot?${q}`);
    },
    getPlaylistList(jwt: string) {
        if (!jwt) throw new Error("Not authorized");
        return axiosInstance.get<PlaylistList>("/users/playlists", {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    getPlaylist(id: string | number) {
        if (!id) throw new Error("Arg bad");
        return axiosInstance.get<Playlist>(`/playlist/${id}`);
    },
    savePlaylist(obj: Playlist, jwt: string) {
        return axiosInstance.post("/playlist/", obj, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    deletePlaylist(id: string | number, jwt: string) {
        if (!id || !jwt) throw new Error("Arg bad");
        return axiosInstance.delete(`/playlist/${id}`, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    reportVideo(id: string, body: Array<Object>, jwt: string) {
        if (!id) throw new Error("Arg bad");
        return axiosInstance.post(`/reports/video/${id}`, body, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    trackMultiviewLink(link) {
        return axiosInstance.get(`/multiview/record/${link}`);
    },
    discordServerInfo(inviteLink) {
        return axiosInstance.get(`https://discord.com/api/v8/invites/${inviteLink}`);
    },
    addPlaceholderStream(body, jwt, token) {
        return axiosInstance.post(
            `videos/placeholder${token ? `?token=${token}` : ""}`,
            body,
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
    },
    getPlaylistState(videoId, jwt) {
        return axiosInstance.get<{ id: number; name: string; contains: boolean }[]>(`/video-playlist/${videoId}`,
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            });
    },
    addVideoToPlaylist(videoId, playlistId, jwt) {
        return axiosInstance.put(`/video-playlist/${playlistId}/${videoId}`, null,
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            });
    },
    deleteVideoFromPlaylist(videoId, playlistId, jwt) {
        return axiosInstance.delete(`/video-playlist/${playlistId}/${videoId}`,
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            });
    },

};
