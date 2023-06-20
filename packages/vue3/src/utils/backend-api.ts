import type {
  AC_Response,
  VideoQueryContainer,
} from "@/components/nav/search/types";
import { dayjs } from "@/utils/time";
import axios, { AxiosResponse } from "axios";
import { CHANNEL_URL_REGEX, VIDEO_URL_REGEX } from "./consts";
import type { Playlist, PlaylistList } from "./types";
import { stringifyQuery } from "./functions";
import { SearchResponse } from "@/components/nav/search/responseTypes";

// Need full domain for socket.io to work!!
export const API_BASE_URL = `${window.location.origin}/api`;
export const SITE_BASE_URL = `${window.location.origin}`;

export const axiosInstance_v2 = (() => {
  const instance = axios.create({ baseURL: `${API_BASE_URL}/v2` });
  return instance;
})();

export const axiosInstance_v3 = (() => {
  const instance = axios.create({ baseURL: `${API_BASE_URL}/v3` });
  return instance;
})();

export default {
  orgs() {
    // Use fetch api to take advantage of pre-fetch
    return fetch(`${SITE_BASE_URL}/statics/orgs.json`).then((r) => r.json());
  },
  channelStub(id: string) {
    return fetch(
      `${SITE_BASE_URL}/statics/channel/${id}.json`
    ).then<ShortChannel>((r) => r.json());
  },
  stats() {
    return axiosInstance_v2({
      url: "/statics/stats.json",
      baseURL: SITE_BASE_URL,
    });
  },
  channels(query: Record<any, unknown> | undefined) {
    const q = stringifyQuery(query);
    return axiosInstance_v2.get<FullChannel[]>(`/channels?${q}`);
  },
  videos(query: Record<any, unknown> | undefined) {
    const q = stringifyQuery(query);
    // console.log(`/videos?${q}`);
    return axiosInstance_v2.get(`/videos?${q}`);
  },
  live(query: Record<any, unknown> | undefined) {
    const q = stringifyQuery(query);
    return axiosInstance_v2.get(`/live?${q}`).then((res) =>
      res.data
        // .concat(res.data.upcoming)
        // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
        .filter(
          (live: {
            start_actual: any;
            start_scheduled:
              | string
              | number
              | Date
              | dayjs.Dayjs
              | null
              | undefined;
          }) =>
            !(
              !live.start_actual &&
              dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h"))
            )
        )
    );
  },
  channel(id: any) {
    return axiosInstance_v2.get(`/channels/${id}`);
  },
  /**
   * Fetches a video
   * @param id the ID of the video
   * @param lang the acceptable subtitle languages
   * @param c whether to also provide comments, 1 to activate
   * @returns
   */
  video(id: string, lang?: string, c?: number) {
    const q = stringifyQuery({ lang, c });
    return axiosInstance_v2.get(`/videos/${id}?${q}`);
  },
  comments(videoId: any) {
    return axiosInstance_v2.get(`/videos/${videoId}/comments`);
  },
  clips(query: Record<any, unknown> | undefined) {
    const q = stringifyQuery(query);
    return axiosInstance_v2.get(`/clips?${q}`);
  },
  searchAutocomplete(query: string) {
    const channelMatch = query.match(CHANNEL_URL_REGEX);
    const videoMatch = query.match(VIDEO_URL_REGEX);

    if (channelMatch) {
      const q = stringifyQuery({ q: channelMatch.groups.id });
      return axiosInstance_v2.get(`/search/autocomplete?${q}`);
    }

    if (videoMatch) {
      return { data: [{ type: "video url", value: videoMatch.groups.id }] };
    }

    const q = stringifyQuery({ q: query });
    return axiosInstance_v2.get(`/search/autocomplete?${q}`);
  },
  /**
   *
   * @param partial partial string to autocomplete
   * @param t if defined, will only provide one category. Vtuber or Topic.
   * @param n number of items to return back. 5 by default.
   */
  searchV3Autocomplete(
    partial: string,
    t?: "vtuber" | "topic" | "any_channel",
    n?: number
  ) {
    if (partial.length == 0) return { data: { vtuber: [], topic: [] } };
    const q = stringifyQuery({
      q: partial,
      ...(t && { t }),
      ...(n && { n }),
    });
    return axiosInstance_v3.get<AC_Response>(`/search/autocomplete?${q}`);
  },
  searchV3(queryObject: VideoQueryContainer) {
    return axiosInstance_v3.post<SearchResponse>(
      "/search/videoSearch",
      queryObject
    );
  },
  searchVideo(queryObject: any) {
    return axiosInstance_v2.post("/search/videoSearch", queryObject);
  },
  searchComments(queryObject: any) {
    return axiosInstance_v2.post("/search/commentSearch", queryObject);
  },
  searchChannel(queryObject: any, jwt: string) {
    return axiosInstance_v2.post("/search/channelSearch", queryObject, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  channelVideos(channelId: any, { type = "videos", query }: any) {
    const q = stringifyQuery(query);
    return axiosInstance_v2.get(`/channels/${channelId}/${type}?${q}`);
  },
  login(jwt: any, authToken: any, service: any) {
    return axiosInstance_v2.post(
      "/user/login",
      { token: authToken, service },
      {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      }
    );
  },
  loginIsValid(jwt: any): Promise<false | AxiosResponse<any>> {
    return axiosInstance_v2
      .get("/user/check", {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      })
      .catch(() => false);
    // 301 Cache bust
    // fetch("https://holodex.net/api/v2/user/check", { method: "post" }).then(() => {});
  },
  favorites(jwt: any) {
    return axiosInstance_v2.get<FullChannel[]>("/users/favorites", {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  favoritesVideos(jwt: any, query: Record<any, unknown> | undefined) {
    const q = stringifyQuery(query);
    return axiosInstance_v2.get(`/users/videos?${q}`, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  favoritesLive({ includePlaceholder = false }: any, jwt: any) {
    // const q = stringifyQuery(query);
    return axiosInstance_v2
      .get(`/users/live?includePlaceholder=${includePlaceholder}`, {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      })
      .then((res) =>
        res.data
          // .concat(res.data.upcoming)
          // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
          .filter(
            (live: {
              start_actual: any;
              start_scheduled:
                | string
                | number
                | Date
                | dayjs.Dayjs
                | null
                | undefined;
            }) =>
              !(
                !live.start_actual &&
                dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h"))
              )
          )
          // get currently live and upcoming lives within the next 3 weeks
          .filter(
            (live: {
              start_scheduled:
                | string
                | number
                | Date
                | dayjs.Dayjs
                | null
                | undefined;
            }) => dayjs(live.start_scheduled).isBefore(dayjs().add(3, "w"))
          )
      );
  },
  patchFavorites(
    jwt: any,
    operations: { op: "add" | "remove"; channel_id: string }[]
  ) {
    return axiosInstance_v2.patch("/users/favorites", operations, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  getVideoTopic(videoId: any) {
    return axiosInstance_v2.get(`/videos/${videoId}/topic`);
  },
  topics() {
    // gets topics from backend
    return axiosInstance_v2.get("/topics");
  },
  topicSet(topicId: any, videoId: any, jwt: any) {
    return axiosInstance_v2.post(
      "/topics/video",
      { videoId, topicId },
      {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      }
    );
  },
  rotation() {
    return axiosInstance_v2.get("/rotation");
  },
  songListByVideo(channelId: any, videoId: any, allowCache: any) {
    const dt = allowCache ? "_" : Math.floor(Math.random() * 100);
    return axiosInstance_v2.post(`/songs/latest?c=${dt}`, {
      channel_id: channelId,
      video_id: videoId,
      limit: 100,
    });
  },
  tryCreateSong(songObj: any, jwt: any) {
    return axiosInstance_v2.put("/songs", songObj, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  deleteSong(songObj: any, jwt: any) {
    return axiosInstance_v2.delete("/songs", {
      data: { ...songObj },

      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  chatHistory(videoId: any, query: Record<any, unknown> | undefined) {
    const q = stringifyQuery(query);
    return axiosInstance_v2.get(`videos/${videoId}/chats?${q}`);
  },
  getMentions(videoId: any) {
    return axiosInstance_v2.get(`videos/${videoId}/mentions`);
  },
  deleteMentions(videoId: any, channelIds: any, jwt: any) {
    return axiosInstance_v2.delete(`videos/${videoId}/mentions`, {
      data: {
        channel_ids: channelIds,
      },

      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  addMention(videoId: any, channelId: any, jwt: any) {
    return axiosInstance_v2.post(
      `videos/${videoId}/mentions`,
      {
        channel_id: channelId,
      },
      {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      }
    );
  },
  v3BulkEditMentions(opts: BulkMentionsRequest, jwt: string) {
    return axiosInstance_v3.post<null>("mentions/change", opts, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  v3BulkGetMentions(opts: { ids: string[] }) {
    return axiosInstance_v3.post<null>("mentions/get", opts);
  },
  /**
   * Fetches song lists up to LIMIT count with offset. Always ordered by available_at date.
   * @param {{org?, channel_id?, video_id?, q?}} condition one of the conditions
   * @param {number} offset
   * @param {number} limit
   */
  // songListByCondition(condition, offset, limit) {
  //     return axiosInstance.post("/songs/latest", { ...condition, offset, limit });
  // },
  // trackSongPlay(channelId, videoId, name, jwt) {
  //     const urlsafe = stringifyQuery({ n: name });
  //     return axiosInstance.get(
  //         `/songs/record/${channelId}/${videoId}?${urlsafe}`,
  //         {
  //             headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
  //         },
  //     );
  // },
  // trackSong(id: Number | string, jwt: string | undefined) {
  //     return axiosInstance.get(`/songs/record/${id}`, {
  //         headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
  //     });
  // },
  /**
   * Grabs top 20 songs from API.
   * @param {string?} org = org name
   * @param {string?} channelId = channel ID. only org name OR channel ID should be supplied, never both.
   */
  // hot(org, channelId) {
  //     const q = stringifyQuery(
  //         org ? { org } : { channel_id: channelId },
  //     );
  //     return axiosInstance.get(`/songs/hot?${q}`);
  // },
  getPlaylistList(jwt: string) {
    if (!jwt) throw new Error("Not authorized");
    return axiosInstance_v2.get<PlaylistList>("/users/playlists", {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  getPlaylist(id: string | number) {
    if (!id) throw new Error("Arg bad");
    return axiosInstance_v2.get<Playlist>(`/playlist/${id}`);
  },
  savePlaylist(obj: object, jwt: string) {
    return axiosInstance_v2.post("/playlist/", obj, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  deletePlaylist(id: string | number, jwt: string) {
    if (!id || !jwt) throw new Error("Arg bad");
    return axiosInstance_v2.delete(`/playlist/${id}`, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  reportVideo(id: string, body: Array<object>, jwt: string) {
    if (!id) throw new Error("Arg bad");
    return axiosInstance_v2.post(`/reports/video/${id}`, body, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  trackMultiviewLink(link: any) {
    return axiosInstance_v2.get(`/multiview/record/${link}`);
  },
  discordServerInfo(inviteLink: any) {
    return axiosInstance_v2.get(
      `https://discord.com/api/v8/invites/${inviteLink}`
    );
  },
  addPlaceholderStream(body: any, jwt: any, token: any) {
    return axiosInstance_v2.post(
      `videos/placeholder${token ? `?token=${token}` : ""}`,
      body,
      {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      }
    );
  },
  deletePlaceholderStream(videoId: any, jwt: any) {
    return axiosInstance_v2.delete(`videos/placeholder/${videoId}`, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  getPlaylistState(videoId: any, jwt: any) {
    return axiosInstance_v2.get<
      { id: number; name: string; contains: boolean }[]
    >(`/video-playlist/${videoId}`, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  addVideoToPlaylist(videoId: any, playlistId: any, jwt: any) {
    return axiosInstance_v2.put(
      `/video-playlist/${playlistId}/${videoId}`,
      null,
      {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      }
    );
  },
  deleteVideoFromPlaylist(videoId: any, playlistId: any, jwt: any) {
    return axiosInstance_v2.delete(`/video-playlist/${playlistId}/${videoId}`, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  postTL({
    videoId,
    jwt,
    body,
    lang,
    custom_video_id,
  }: {
    videoId: string;
    jwt: string;
    body: any;
    lang: string;
    custom_video_id?: string;
  }) {
    const q = stringifyQuery({ lang, custom_video_id });
    return axiosInstance_v2.post(`/videos/${videoId}/chats?${q}`, body, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  postBulkTL({
    videoId,
    jwt,
    body,
    lang,
    custom_video_id,
  }: {
    videoId: string;
    jwt: string;
    body: any;
    lang: string;
    custom_video_id?: string;
  }) {
    const q = stringifyQuery({ lang, custom_video_id });
    return axiosInstance_v2.post(`/videos/${videoId}/chatsBulk?${q}`, body, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  getTLStats(jwt: any, query: Record<any, unknown> | undefined) {
    const q = stringifyQuery(query);
    return axiosInstance_v2.get(`/tlutil?${q}`, {
      headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
    });
  },
  postTLLog(
    videoID: any,
    jwt: any,
    body: any,
    langCode: any,
    override = false
  ) {
    const head: any = {};
    if (jwt) {
      head.Authorization = `BEARER ${jwt}`;
    }
    if (override) {
      head.Override = "true";
    }
    return axiosInstance_v2.post(
      `/videos/${videoID}/scripteditor/log?lang=${langCode}`,
      body,
      {
        headers: head,
      }
    );
  },
  fetchMChadData(room: any, pass: any) {
    return axios.post("https://repo.mchatx.org/v2/HolodexDahcM/data", {
      Room: room,
      Pass: pass,
    });
  },
  checkMchadMigrate(room: any, pass: any) {
    return axiosInstance_v2.post("/tlutil/migrate/check", {
      Room: room,
      Pass: pass,
    });
  },
  claimMchadMigrate(jwt: any, room: any, pass: any) {
    return axiosInstance_v2.post(
      "/tlutil/migrate/claim",
      {
        Room: room,
        Pass: pass,
      },
      {
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      }
    );
  },
  requestChannel(obj: any) {
    return axiosInstance_v2.post("/reports/channel", obj);
  },

  // ---------- RELAY BOT DISCORD LOGIN ----------
  relayBotLogin(code: any, mode: any) {
    return axios.post("https://repo.mchatx.org/holodexproxybot/user", {
      code,
      mode,
    });
  },
  relayBotCheckBotPresence(guildAddressList: any) {
    return axios.post("https://repo.mchatx.org/holodexproxybot/guild", {
      ids: guildAddressList,
    });
  },
  relayBotGetChannels(guildAddress: any) {
    return axios.post("https://repo.mchatx.org/holodexproxybot/channel", {
      guild: guildAddress,
    });
  },
  relayBotGetSettingChannel(channelAddress: any) {
    return axios.post("https://repo.mchatx.org/holodexproxybot/data", {
      channel: channelAddress,
    });
  },
  relayBotSubmitData(channelAddress: any, data: any) {
    return axios.post("https://repo.mchatx.org/holodexproxybot/submit", {
      Address: channelAddress,
      SubChannel: data,
    });
  },
  relayBotTrigger(channelAddress: any, mode: any, link: any, lang: any) {
    return axios.post("https://repo.mchatx.org/holodexproxybot/trigger", {
      Address: channelAddress,
      mode,
      link,
      lang,
    });
  },
  //= ========= RELAY BOT DISCORD LOGIN ==========
};

export interface BulkMentionsRequest {
  videoIds: string[];
  mentions: (Partial<FullChannel> & { id: string })[];
  delete: boolean;
}
