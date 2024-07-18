/* eslint-disable no-useless-escape,max-len */
export const MUSICDEX_URL =
  window.location.origin === "https://holodex.net"
    ? "https://music.holodex.net"
    : "https://music-staging.holodex.net";

export const CHANNEL_TYPES = {
  VTUBER: "vtuber",
  SUBBER: "subber",
} as const;

export const VIDEO_TYPES = {
  CLIP: "clip",
  STREAM: "stream",
  PLACEHOLDER: "placeholder",
} as const;

export const PLACEHOLDER_TYPES = {
  YT_STREAM: "scheduled-yt-stream",
  EXTERNAL_STREAM: "external-stream",
  EVENT: "event",
} as const;

export const CHANNEL_URL_REGEX =
  /(?:(?:https?:|)\/\/|)(?:www\.|)(?:youtube\.com\/|\/?)channel\/(?<id>[\w-]+)/i;

export const VIDEO_URL_REGEX =
  /(?:(?:https?:|)\/\/|)((?:www|m)\.|)(?<domain>youtube\.com|youtu\.be|holodex\.net)\/(?:[\w-]+\?v=|embed|v|watch|live|)\/?(?<id>[\w-]{11})/i;

export const TWITCH_VIDEO_URL_REGEX =
  /(?:(?:https?:|)\/\/|)twitch\.tv\/(?<id>[\w-]+)/i;

export const TWITCH_UNLIVE_VIDEO_URL_REGEX =
  /(?:https:\/\/)?twitch\.tv\/videos\/([\w\-_]*)/i;

export const TWITCAST_VIDEO_URL_REGEX = /(?:https:\/\/)?twitcasting\.tv\/(.*)/i;

export const TWITCAST_UNLIVE_VIDEO_URL_REGEX =
  /(?:https:\/\/)?twitcasting\.tv\/(.*)\/movie\/([\w\-_]*)/i;

export const NICONICO_VIDEO_URL_REGEX =
  /(?:https:\/\/)?live\.nicovideo\.jp\/watch\/([\w\-_]*)/i;

export const NICONICO_UNLIVE_VIDEO_URL_REGEX =
  /(?:https:\/\/)?nicovideo\.jp\/watch\/([\w\-_]*)/i;

export const BILIBILI_VIDEO_URL_REGEX =
  /(?:https:\/\/)?live\.bilibili\.com\/([\w\-_]*)/i;

export const BILIBILI_UNLIVE_VIDEO_URL_REGEX =
  /(?:https:\/\/)?bilibili\.com\/video\/([\w\-_]*)/i;

// Clip channel TL Langs;

export const TL_LANGS = [
  {
    text: "English",
    value: "en",
  },
  {
    text: "日本語",
    value: "ja",
  },
  {
    text: "Español",
    value: "es",
  },
  {
    text: "中文",
    value: "zh",
  },
  {
    text: "Bahasa Indonesia / Melayu",
    value: "id",
  },
  {
    text: "Русский язык",
    value: "ru",
  },
  {
    text: "한국어",
    value: "ko",
  },
] as const;

export type TLLanguageCode = (typeof TL_LANGS)[number]["value"];

export const CLIPPER_LANGS = TL_LANGS;

// exports.CHANNEL_TYPE_TO_VIDEO_TYPE = {
//     [this.CHANNEL_TYPES.VTUBER]: this.VIDEO_TYPES.STREAM,
//     [this.CHANNEL_TYPES.SUBBER]: this.VIDEO_TYPES.CLIP,
// };

export const RELATIONSHIP_TYPES = {
  REFER: "refer",
  SIMULCAST: "simulcast",
  CLIP: "clip",
} as const;

export const STATUSES = {
  NEW: "new",
  LIVE: "live",
  UPCOMING: "upcoming",
  PAST: "past",
  MISSING: "missing",
} as const;

export const COMPANION_EXTENSION_ID = "jkdnofimdhpbhdjbcdlgnccfjjkidlgp";

export const MESSAGE_TYPES = Object.freeze({
  TOKEN: "token",
  FAVORITES: "favorites",
});

export const MAX_PLAYLIST_LENGTH = 500;

export const GET_ON_INIT = { getOnInit: true };
