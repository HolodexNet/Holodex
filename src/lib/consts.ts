import type { Org } from "@/lib/types"

export const ALL_VTUBERS = "All Vtubers"

export const musicdexURL =
  window.location.origin === "https://holodex.net"
    ? "https://music.holodex.net"
    : "https://music-staging.holodex.net"

/** UI languages. `dir` is the folder under src/locales. */
export const UI_LANGS = [
  { val: "en", dir: "en", display: "English", credit: "@Holodex" },
  { val: "en-CA", dir: "en", display: "English (Canadian)", credit: "@Holodex" },
  { val: "en-GB", dir: "en", display: "English (British)", credit: "@Holodex" },
  { val: "lol-UWU", dir: "lol-UWU", display: "English (UwU)", credit: "Doubleturtle#3660" },
  { val: "lol-PEKO", dir: "lol-PEKO", display: "English (PEKO)", credit: "Doubleturtle#3660" },
  { val: "ja", dir: "ja-JP", display: "日本語", credit: "Yourein#3960,Saginomiya#2353" },
  { val: "zh", dir: "zh-TW", display: "繁體中文", credit: "angel84326#7887" },
  { val: "zh-CN", dir: "zh-CN", display: "简体中文", credit: "ttg#6038" },
  { val: "ko", dir: "ko-KR", display: "한국어", credit: "AlexKoala#0253" },
  { val: "es-ES", dir: "es-ES", display: "Español España", credit: "TraduSquare (Darkc0m y D3fau4)" },
  { val: "es", dir: "es-MX", display: "Español Latino", credit: "Aldo#3682" },
  { val: "ms", dir: "ms-MY", display: "Bahasa Melayu", credit: "Admiy#8261" },
  { val: "id", dir: "id-ID", display: "Bahasa Indonesia", credit: "alcyneous#2803" },
  { val: "ru", dir: "ru-RU", display: "Русский язык", credit: "kirillbarnaul#8499" },
  { val: "pt", dir: "pt-BR", display: "Português Brasileiro", credit: "Ash Niartis#5090" },
  { val: "de", dir: "de-DE", display: "Deutsch", credit: "DatJocab#1803, Doubleturtle#3660" },
  { val: "it", dir: "it-IT", display: "Italiano", credit: "テオさん#0139" },
  { val: "fr", dir: "fr-FR", display: "Français", credit: "pinembour#7770,Derasiel △#0002" },
  { val: "tr", dir: "tr-TR", display: "Türkçe", credit: "creeperkafasipw#1861" },
  { val: "vi", dir: "vi-VN", display: "Tiếng Việt", credit: "Pooh#6666,Dead xda member#4848,#Hiraoka Yukio#3042" },
  { val: "hu", dir: "hu-HU", display: "Magyar", credit: "kuroihikikomori#7216" },
  { val: "th", dir: "th-TH", display: "ไทย", credit: "SnowNeko#0282" },
] as const

/** Languages clips and live translations are tagged with. */
export const TL_LANGS = [
  { text: "English", value: "en" },
  { text: "日本語", value: "ja" },
  { text: "Español", value: "es" },
  { text: "中文", value: "zh" },
  { text: "Bahasa Indonesia / Melayu", value: "id" },
  { text: "Русский язык", value: "ru" },
  { text: "한국어", value: "ko" },
  { text: "Tiếng Việt", value: "vi" },
] as const

/** Short forms shown in the "<Org>dex" wordmark. */
export const ORGS_PREFIX: Record<string, string> = {
  "Atelier Live": "Atelier",
  Chukorara: "Chuko",
  "Eilene Family": "Eilene",
  "Hanayori Joshiryo": "Hana",
  Hololive: "Holo",
  Independents: "Indie",
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
  "V Dimension.Creators": "VDC",
  Tsunderia: "Tsun",
  "Unreal Night Girls": "UNG",
  "X enc'ount": "X'",
  "Yuni Create": "Yuni",
  [ALL_VTUBERS]: "Vtuber",
}

export const DEFAULT_ORG: Org = { name: "Hololive", short: "Holo" }

export const DEFAULT_ORG_FAVORITES: Org[] = [
  { name: ALL_VTUBERS, short: "Vtuber" },
  { name: "Hololive", short: "Holo" },
  { name: "Nijisanji", short: "Niji" },
  { name: "Independents", short: "Indie" },
]

/** Aqua-iro pink. */
export const DEFAULT_PRIMARY = "#f06292"

/**
 * Primary colour presets, carried over from the talent themes of the previous
 * UI. Order matters: the index is the legacy `theme` id used for migration.
 */
export const PRIMARY_PRESETS = [
  { name: "Aqua", color: "#f06292" },
  { name: "Matsuri", color: "#faa749" },
  { name: "Korone", color: "#b07975" },
  { name: "Rushia", color: "#22c4ac" },
  { name: "Fubuki", color: "#317192" },
  { name: "Figaro", color: "#8fb5b7" },
  { name: "Shion", color: "#998aeb" },
  { name: "Coco", color: "#ff9257" },
  { name: "Suisei", color: "#a8d6fc" },
  { name: "Haato", color: "#d52d43" },
  { name: "Miko", color: "#fbb3a5" },
  { name: "IRyS", color: "#d91a5d" },
  { name: "Luna", color: "#eb8fe1" },
  { name: "Pekora", color: "#dc8c2c" },
  { name: "Polka", color: "#e9d9a3" },
  { name: "Towa", color: "#7e6bac" },
  { name: "Flare", color: "#d79e69" },
  { name: "Noel", color: "#9ba4b1" },
  { name: "Lamy", color: "#338bcc" },
  { name: "Okayu", color: "#cda4d5" },
  { name: "Kobo", color: "#7fbde2" },
  { name: "Fauna", color: "#a2c79e" },
  { name: "Reine", color: "#1775fb" },
  { name: "Niko", color: "#f98d30" },
] as const

export const VIDEO_URL_REGEX =
  /(?:(?:https?:|)\/\/|)(?:(?:www|m)\.|)(?:youtube\.com|youtu\.be|holodex\.net)\/(?:[\w-]+\?v=|embed|v|watch|live|)\/?(?<id>[\w-]{11})(?![\w-])/i

export const CHANNEL_URL_REGEX =
  /(?:(?:https?:|)\/\/|)(?:www\.|)(?:youtube\.com|holodex\.net)\/channel\/(?<id>UC[\w-]{22})/i
