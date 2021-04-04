/* eslint-disable no-useless-escape */

export const primaryColor = "#F06292";
export const secondaryColor = "#64B5F6";

export const CHANNEL_TYPES = Object.freeze({
    VTUBER: "vtuber",
    SUBBER: "subber",
});

export const VIDEO_TYPES = Object.freeze({
    CLIP: "clip",
    STREAM: "stream",
});

export const MUSIC_PLAYER_STATE = Object.freeze({
    PLAYING: 1,
    PAUSED: 0,
});

export const MUSIC_PLAYBACK_MODE = Object.freeze({
    LOOP: 0,
    LOOPONE: 1,
    SHUFFLE: 2,
    NATURAL: 4,
});

export const ORGS = Object.freeze([
    "All Vtubers",
    "Hololive",
    "Nijisanji",
    "Kizuna Ai Inc.",
    "Independents",
    "VSpo",
    "VShojo",
    "774inc",
    "Eilene Family",
    "Idol-bu",
    "Nori Pro",
    "ReACT",
    ".LIVE",
    "VOMS",
    "Tsunderia",
    "Yuni Create",
    "Atelier Live",
    "Hanayori Joshiryo",
    "ViViD",
    "Chukorara",
    "X enc'ount",
    "Marbl_s",
    "Iridori",
    "V Dimension.Creators",
]);

export const ORGS_PREFIX = Object.freeze({
    // "AniMare",
    "Atelier Live": "Atelier",
    Chukorara: "Chuko",
    "Eilene Family": "Eilene",
    "Hanayori Joshiryo": "Hana",
    Hololive: "Holo",
    // "HoneyStrap",
    // "Idol-bu",
    Independents: "Indie",
    // "Iridori",
    "Kizuna Ai Inc.": "Kizuna",
    Marbl_s: "Marbl",
    Nijisanji: "Niji",
    "Nori Pro": "Nori",
    // "ReACT",
    // "SugarLyric",
    // "upd8",
    // "VApArt",
    "V Dimension.Creators": "VDC",
    // "ViViD",
    // "VOMS",
    Tsunderia: "Tsun",
    // "VShojo",
    "X enc'ount": "X'",
    "Yuni Create": "Yuni",
    "All Vtubers": "Vtuber",
});

export const CHANNEL_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/)(?:channel|c)\/([\w\-\_]*)/i;

// eslint-disable-next-line max-len
export const VIDEO_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(?:.*\&|\?)?(?:t?=?)?(\d+[\dhms]*)?/i;

export const TL_LANGS = Object.freeze([
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
        text: "Indonesian / Malay",
        value: "id",
    },
    {
        text: "Русский язык",
        value: "ru",
    },
]);

// exports.CHANNEL_TYPE_TO_VIDEO_TYPE = {
//     [this.CHANNEL_TYPES.VTUBER]: this.VIDEO_TYPES.STREAM,
//     [this.CHANNEL_TYPES.SUBBER]: this.VIDEO_TYPES.CLIP,
// };

// exports.RELATIONSHIP_TYPES = {
//     REFER: "refer",
//     SIMULCAST: "simulcast",
//     CLIP: "clip",
// };

// exports.STATUSES = {
//     NEW: "new",
//     LIVE: "live",
//     UPCOMING: "upcoming",
//     PAST: "past",
//     MISSING: "missing",
// };
