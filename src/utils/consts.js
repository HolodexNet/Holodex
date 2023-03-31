/* eslint-disable no-useless-escape,max-len */
export const musicdexURL = window.location.origin === "https://holodex.net" ? "https://music.holodex.net" : "https://music-staging.holodex.net";

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

export const ORGS_PREFIX = Object.freeze({
    // "AniMare",
    "Atelier Live": "Atelier",
    Chukorara: "Chuko",
    "Eilene Family": "Eilene",
    "Hanayori Joshiryo": "Hana",
    Hololive: "Holo",
    // "HoneyStrap",
    Independents: "Indie",
    // "Iridori",
    "Kizuna Ai Inc.": "Kizuna",
    Marbl_s: "Marbl",
    Nijisanji: "Niji",
    Masquerade: "Masq",
    "Riot Music": "Riot",
    "Nori Pro": "Nori",
    "Aogiri Highschool": "Aogiri",
    KAMITSUBAKI: "KT",
    "VOICE-ORE": "V.O.",
    "Hoshimeguri Gakuen": "Stellar",
    // "ReACT",
    // "SugarLyric",
    // "upd8",
    // "VApArt",
    "V Dimension.Creators": "VDC",
    // "ViViD",
    // "VOMS",
    Tsunderia: "Tsun",
    "Unreal Night Girls": "UNG",
    // "VShojo",
    "X enc'ount": "X'",
    "Yuni Create": "Yuni",
    "All Vtubers": "Vtuber",
});

export const CHANNEL_URL_REGEX = /(?:(?:https?:|)\/\/|)(?:www\.|)(?:youtube\.com\/|\/?)channel\/(?<id>[\w-]+)/i;

export const VIDEO_URL_REGEX = /(?:(?:https?:|)\/\/|)((?:www|m)\.|)(?<domain>youtube\.com|youtu\.be|holodex\.net)\/(?:[\w-]+\?v=|embed|v|watch|live|)\/?(?<id>[\w-]{11})/i;

export const TWITCH_VIDEO_URL_REGEX = /(?:(?:https?:|)\/\/|)twitch\.tv\/(?<id>[\w-]+)/i;

export const TWITCH_UNLIVE_VIDEO_URL_REGEX = /(?:https:\/\/)?twitch\.tv\/videos\/([\w\-_]*)/i;

export const TWITCAST_VIDEO_URL_REGEX = /(?:https:\/\/)?twitcasting\.tv\/(.*)/i;

export const TWITCAST_UNLIVE_VIDEO_URL_REGEX = /(?:https:\/\/)?twitcasting\.tv\/(.*)\/movie\/([\w\-_]*)/i;

export const NICONICO_VIDEO_URL_REGEX = /(?:https:\/\/)?live\.nicovideo\.jp\/watch\/([\w\-_]*)/i;

export const NICONICO_UNLIVE_VIDEO_URL_REGEX = /(?:https:\/\/)?nicovideo\.jp\/watch\/([\w\-_]*)/i;

export const BILIBILI_VIDEO_URL_REGEX = /(?:https:\/\/)?live\.bilibili\.com\/([\w\-_]*)/i;

export const BILIBILI_UNLIVE_VIDEO_URL_REGEX = /(?:https:\/\/)?bilibili\.com\/video\/([\w\-_]*)/i;

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
    {
        text: "TLDex-LIVE (test system)",
        value: "tl",
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

export const companionExtensionId = "jkdnofimdhpbhdjbcdlgnccfjjkidlgp";

export const MESSAGE_TYPES = Object.freeze({
    TOKEN: "token",
    FAVORITES: "favorites",
});

export const MAX_PLAYLIST_LENGTH = 500;

export const APRIL = Object.freeze({
    "UCO_aKKYxn4tvrqPjcTzZ6EQ": "https://i.imgur.com/Vi4CFSB.jpeg",
    "UCoSrY_IQQVpmIRZ9Xf-y93g": "https://i.imgur.com/v1GMWVA.jpeg",
    "UCOyYb1c43VlX9rc_lT6NKQw": "https://i.imgur.com/pCzQoUX.jpeg",
    "UCR6qhsLpn62WVxCBK1dkLow": "https://i.imgur.com/xlnVYSb.jpeg",
    "UCTvHWSfBZgtxE4sILOaurIQ": "https://i.imgur.com/TNxpYNU.jpeg",
    "UCu-J8uIXuLZh16gG-cT1naw": "https://i.imgur.com/feK64ct.jpeg",
    "UCyl1z3jo3XHR1riLFKG5UAg": "https://i.imgur.com/aXT16Bz.jpeg",
    "UCYz_5n-uDuChHtLo7My1HnQ": "https://i.imgur.com/Y2yyqbw.jpeg",
    "UC8rcEBzJSleTkf_-agPM20g": "https://i.imgur.com/g8OTXdR.jpeg",
    "UC47rNmkDcNgbOcM-2BwzJTQ": "https://i.imgur.com/7bohKYK.jpeg",
    "UCAoy6rzhSf4ydcYjJw3WoVg": "https://i.imgur.com/5g2QQr2.jpeg",
    "UCDRWSO281bIHYVi-OV3iFYA": "https://i.imgur.com/rUXvwr3.jpeg",
    "UChgTyjG-pdNvxxhdsXfHQ5Q": "https://i.imgur.com/vxQlLGj.jpeg",
    "UCHsx4Hqa-1ORjQTh9TYDhww": "https://i.imgur.com/r4dAzOA.jpeg",
    "UCIeSUTOTkF9Hs7q3SGcO-Ow": "https://i.imgur.com/Z18LxFN.jpeg",
    "UCL_qhgtOy0dy1Agp8vkySQg": "https://i.imgur.com/0ITzJoQ.jpeg",
    "UCmbs8T6MWqUHP1tIQvSgKrg": "https://i.imgur.com/NV3EwEL.jpeg",
    "UCMwGHR0BTZuLsmjY_NT5Pwg": "https://i.imgur.com/SB0uAkl.jpeg",
    "UC727SQYUvx5pDDGQpTICNWg": "https://i.imgur.com/LVt2FI9.jpeg",
    "UCK9V2B22uJYu3N7eR_BT9QA": "https://i.imgur.com/EMN54zR.jpeg",
    "UC7MMNHR-kf9EN1rXiesMTMw": "https://i.imgur.com/DGnsN16.jpeg",
    "UCqm3BQLlJfvkTsX_hvm0UmA": "https://i.imgur.com/1PocUnc.jpeg",
    "UC5CwaMl1eIgY8h02uZw7u8A": "https://i.imgur.com/uRlaNmM.jpeg",
    "UC1suqwovbL1kzsoaZgFZLKg": "https://i.imgur.com/Vmm7Zjc.jpeg",
    "UCZLZ8Jjx_RN2CXloOmgTHVg": "https://i.imgur.com/b8zeerX.jpeg",
    "UCgmPnx-EEeOrZSg5Tiw7ZRQ": "https://i.imgur.com/If83rJ9.jpeg",
    "UCFKOVgVbGmX65RxO3EtH3iw": "https://i.imgur.com/GW5oTSW.jpeg",
    "UCvaTdHTWBGv3MKj3KVqJVCw": "https://i.imgur.com/CARmKbk.jpeg",
    "UChAnqc_AY5_I3Px5dig3X1Q": "https://i.imgur.com/nPQHy1Z.jpeg",
    "UC1DCedRgGHBdm81E1llLhOQ": "https://i.imgur.com/cneQbMy.jpeg",
});
