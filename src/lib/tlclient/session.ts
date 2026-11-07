/**
 * What a TL Client session posts to. A session has one main stream and any
 * number of collab streams (other POVs of the same event); every line goes to
 * all of them. Free of React and the DOM so `node --test` can exercise it.
 */
import type { PlayableSource } from "../multiview/types.ts"
import type { Video } from "../types.ts"
import { videoSource } from "../video-source.ts"

/** A TLdex room: a catalog video, or a free-form custom id for anything else. */
export type TlRoom =
  { kind: "video"; videoId: string } | { kind: "custom"; customId: string }

/** A live chat the Holodex+ extension can type a line into. */
export type ChatRelay =
  | { provider: "youtube"; videoId: string }
  | { provider: "twitch"; channel: string }

/** What can be told from the text alone, before asking the catalog. */
export interface ParsedSource {
  /** Exactly what was entered, trimmed. Custom rooms are keyed by it. */
  raw: string
  /** An id worth looking up in the catalog, if any. */
  lookupId: string | null
  youtubeId: string | null
  twitchChannel: string | null
  twitchVod: string | null
}

const YOUTUBE_ID = /^[\w-]{11}$/
const YOUTUBE_URL =
  /(?:youtube\.com|youtu\.be|holodex\.net)\/(?:[\w-]+\?v=|embed\/|v\/|watch\/|live\/|shorts\/|watch\?.*?v=|)([\w-]{11})(?![\w-])/i
const TWITCH_URL = /twitch\.tv\/([\w-]+)(?:\/(\d+))?/i
const TWITCH_RESERVED = new Set([
  "directory",
  "downloads",
  "login",
  "settings",
  "signup",
])

export function parseSource(text: string): ParsedSource {
  const raw = text.trim()
  const parsed: ParsedSource = {
    raw,
    lookupId: null,
    youtubeId: null,
    twitchChannel: null,
    twitchVod: null,
  }
  if (!raw) return parsed

  // The previous UI linked here with `YT_<id>`.
  const legacy = /^YT_([\w-]{11})$/.exec(raw)?.[1]
  const youtube =
    legacy ?? (YOUTUBE_ID.test(raw) ? raw : YOUTUBE_URL.exec(raw)?.[1])
  if (youtube) {
    parsed.youtubeId = youtube
    parsed.lookupId = youtube
    return parsed
  }

  const twitch = TWITCH_URL.exec(raw)
  if (twitch) {
    const [, first, second] = twitch
    if (first.toLowerCase() === "videos" && second) parsed.twitchVod = second
    else if (!second && !TWITCH_RESERVED.has(first.toLowerCase()))
      parsed.twitchChannel = first.toLowerCase()
    return parsed
  }

  // Catalog ids (placeholders, native Twitch ids) are short and have no spaces;
  // anything that looks like a link is only ever a custom room.
  if (!/[\s/]/.test(raw) && raw.length <= 64) parsed.lookupId = raw
  return parsed
}

/** The room for a source the catalog does not know: keyed by the text itself. */
export function customRoom(parsed: ParsedSource): TlRoom {
  return { kind: "custom", customId: parsed.raw }
}

export function chatRelayFor(parsed: ParsedSource): ChatRelay | null {
  if (parsed.youtubeId)
    return { provider: "youtube", videoId: parsed.youtubeId }
  if (parsed.twitchChannel)
    return { provider: "twitch", channel: parsed.twitchChannel }
  return null
}

/** A source with everything the session needs to post to it and show it. */
export interface ResolvedSource {
  raw: string
  /** The catalog's video, when it knows the stream. */
  video: Video | null
  room: TlRoom
  /** The chat a line can be typed into, while the stream can still take one. */
  chat: ChatRelay | null
  player: PlayableSource | null
}

export function resolveSource(
  parsed: ParsedSource,
  video: Video | null
): ResolvedSource {
  if (video) {
    const source = videoSource(video)
    const open = video.status !== "past" && video.status !== "missing"
    return {
      raw: parsed.raw,
      video,
      room: { kind: "video", videoId: video.id },
      chat: !open
        ? null
        : source.provider === "youtube"
          ? { provider: "youtube", videoId: source.videoId }
          : source.provider === "twitch" && source.channel
            ? { provider: "twitch", channel: source.channel }
            : null,
      player: source.provider === "external" ? null : source,
    }
  }
  return {
    raw: parsed.raw,
    video: null,
    room: customRoom(parsed),
    chat: chatRelayFor(parsed),
    player: parsed.youtubeId
      ? {
          provider: "youtube",
          videoId: parsed.youtubeId,
          url: `https://www.youtube.com/watch?v=${parsed.youtubeId}`,
        }
      : parsed.twitchChannel
        ? {
            provider: "twitch",
            channel: parsed.twitchChannel,
            url: `https://www.twitch.tv/${parsed.twitchChannel}`,
          }
        : parsed.twitchVod
          ? {
              provider: "twitch",
              videoId: parsed.twitchVod,
              url: `https://www.twitch.tv/videos/${parsed.twitchVod}`,
            }
          : null,
  }
}

export const roomKey = (room: TlRoom) =>
  room.kind === "video" ? `v:${room.videoId}` : `c:${room.customId}`

export const relayKey = (relay: ChatRelay) =>
  relay.provider === "youtube"
    ? `yt:${relay.videoId}`
    : `tw:${relay.channel.toLowerCase()}`

/** The id TLdex's socket and history routes know a room by. */
export const roomSocketId = (room: TlRoom) =>
  room.kind === "video" ? room.videoId : room.customId

export interface SessionParams {
  main: string
  collabs: string[]
  lang: string | null
}

/** `?video=<main>&collab=<a>&collab=<b>&lang=en`; `video` matches the old UI. */
export function readSessionParams(search: URLSearchParams): SessionParams {
  const main = search.get("video")?.trim() ?? ""
  const collabs = unique(
    search
      .getAll("collab")
      .map((value) => value.trim())
      .filter((value) => value && value !== main)
  )
  return { main, collabs, lang: search.get("lang") || null }
}

export function writeSessionParams(params: SessionParams): URLSearchParams {
  const search = new URLSearchParams()
  if (params.main.trim()) search.set("video", params.main.trim())
  for (const collab of unique(params.collabs.map((c) => c.trim()))) {
    if (collab && collab !== params.main.trim()) search.append("collab", collab)
  }
  if (params.lang) search.set("lang", params.lang)
  return search
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
