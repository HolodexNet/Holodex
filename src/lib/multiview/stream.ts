import type { Video } from "../types.ts"
import { videoSource } from "../video-source.ts"
import type {
  MultiviewChannel,
  MultiviewVideo,
  PlayableSource,
} from "./types.ts"

const YOUTUBE_ID = /^[\w-]{11}$/
const TWITCH_LOGIN = /^[a-zA-Z0-9_]+$/

const VIDEO_URL =
  /(?:(?:https?:|)\/\/|)((?:www|m)\.|)(?<domain>youtube\.com|youtu\.be|holodex\.net)\/(?:[\w-]+\?v=|embed|v|watch|live|shorts|)\/?(?<id>[\w-]{11})/i
const TWITCH_URL =
  /(?:(?:https?:|)\/\/|)(?:(?:www|m)\.|)twitch\.tv\/(?<path>[\w-]+(?:\/\d+)?)/i
/** Paths on twitch.tv that are not somebody's channel. */
const TWITCH_RESERVED = new Set([
  "directory",
  "downloads",
  "login",
  "settings",
  "signup",
])

/** Identifies a stream across cells, chats and permalinks. */
export function streamId(source: PlayableSource): string {
  if (source.provider === "youtube") return source.videoId
  return source.channel ? `tw:${source.channel}` : `twvod:${source.videoId}`
}

/** The parts of a video the multiview keeps, or `null` if it cannot play it. */
export function toMultiviewVideo(video: Video): MultiviewVideo | null {
  const source = videoSource(video)
  if (source.provider === "external") return null
  return {
    id: streamId(source),
    source,
    channel: {
      id: video.channel?.id,
      name: video.channel?.name ?? video.id,
      english_name: video.channel?.english_name,
      photo: video.channel?.photo,
    },
    title: video.title,
    status: video.status,
    topic_id: video.topic_id,
    available_at: video.available_at,
    start_scheduled: video.start_scheduled,
    start_actual: video.start_actual,
    duration: video.duration,
  }
}

/** A stream known only by its id, until its metadata has been looked up. */
export function youtubeStub(id: string, channelName?: string): MultiviewVideo {
  return {
    id,
    source: {
      provider: "youtube",
      videoId: id,
      url: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
    },
    channel: { name: channelName || id },
  }
}

export function twitchChannelStub(channel: string): MultiviewVideo {
  const login = channel.toLowerCase()
  return {
    id: `tw:${login}`,
    source: {
      provider: "twitch",
      channel: login,
      url: `https://www.twitch.tv/${login}`,
    },
    channel: { name: login },
  }
}

export function twitchVodStub(videoId: string): MultiviewVideo {
  return {
    id: `twvod:${videoId}`,
    source: {
      provider: "twitch",
      videoId,
      url: `https://www.twitch.tv/videos/${videoId}`,
    },
    channel: { name: `Twitch ${videoId}` },
  }
}

/**
 * A pasted or dropped link: YouTube, Twitch channels and VODs, and Holodex
 * watch pages, with or without the scheme.
 */
export function parseVideoUrl(text: string): MultiviewVideo | null {
  const trimmed = text.trim()
  const youtube = VIDEO_URL.exec(trimmed)?.groups?.id
  if (youtube) return youtubeStub(youtube)

  // `watch?list=...&v=...` puts the id somewhere the pattern above cannot see.
  if (/youtube\.com\//i.test(trimmed)) {
    const v = /[?&]v=([\w-]{11})/.exec(trimmed)?.[1]
    if (v) return youtubeStub(v)
    return null
  }

  const twitch = TWITCH_URL.exec(trimmed)?.groups?.path
  if (!twitch) return null
  const [first, second] = twitch.split("/")
  if (first.toLowerCase() === "videos") {
    return second ? twitchVodStub(second) : null
  }
  if (second || TWITCH_RESERVED.has(first.toLowerCase())) return null
  return TWITCH_LOGIN.test(first) ? twitchChannelStub(first) : null
}

export const isYoutubeId = (id: string) => YOUTUBE_ID.test(id)
export const isTwitchLogin = (login: string) => TWITCH_LOGIN.test(login)

/**
 * Whether a stream is known only by its id, however it is labelled. Sync and
 * chat both depend on its status, so a shared link naming a channel is not enough.
 */
export function needsMetadata(video: MultiviewVideo): boolean {
  return video.source.provider === "youtube" && !video.noData && !video.status
}

export function refreshable(video: MultiviewVideo): boolean {
  return (
    video.source.provider === "youtube" &&
    (video.status === "live" || video.status === "upcoming")
  )
}

/** Whatever a lookup found out about a stream. */
export type VideoDetails = Partial<
  Pick<
    MultiviewVideo,
    | "title"
    | "status"
    | "topic_id"
    | "available_at"
    | "start_scheduled"
    | "start_actual"
    | "duration"
  >
> & { channel?: Partial<MultiviewChannel>; noData?: boolean }

/** Fills a stream's details in from a fresher copy, without touching identity. */
export function withMetadata(
  video: MultiviewVideo,
  fresh: VideoDetails
): MultiviewVideo {
  return {
    ...video,
    title: fresh.title ?? video.title,
    status: fresh.status ?? video.status,
    topic_id: fresh.topic_id ?? video.topic_id,
    available_at: fresh.available_at ?? video.available_at,
    start_scheduled: fresh.start_scheduled ?? video.start_scheduled,
    start_actual: fresh.start_actual ?? video.start_actual,
    duration: fresh.duration ?? video.duration,
    channel: {
      ...video.channel,
      ...(fresh.channel?.id ? { id: fresh.channel.id } : {}),
      ...(fresh.channel?.name ? { name: fresh.channel.name } : {}),
      ...(fresh.channel?.english_name
        ? { english_name: fresh.channel.english_name }
        : {}),
      ...(fresh.channel?.photo ? { photo: fresh.channel.photo } : {}),
    },
    noData: fresh.noData ?? false,
  }
}

/**
 * The toolbar's quick picks from a live feed: everything live or starting within
 * two hours, stretching to six while the list is still short, minus whatever is
 * already on screen.
 */
export function selectTrayVideos(
  videos: readonly Video[],
  activeIds: ReadonlySet<string>,
  now: number
): Video[] {
  const HOUR = 60 * 60_000
  const MIN_LENGTH_BEFORE_NARROWING = 7
  return videos
    .filter((video, index) => {
      if (video.status === "live" || !video.start_scheduled) {
        return video.status === "live"
      }
      const until = new Date(video.start_scheduled).getTime() - now
      return (
        until < 2 * HOUR ||
        (index < MIN_LENGTH_BEFORE_NARROWING && until < 6 * HOUR)
      )
    })
    .filter((video) => {
      const stream = toMultiviewVideo(video)
      return stream !== null && !activeIds.has(stream.id)
    })
}

/** Streams the multiview can play, out of everything a feed lists. */
export function isPlayableInMultiview(video: Video): boolean {
  if (video.type !== "stream" && video.type !== "placeholder") return false
  return toMultiviewVideo(video) !== null
}

/**
 * What was dropped on the grid: the JSON a Holodex card carries, or else any
 * link. The JSON can come from any page, so it is checked before being used.
 */
export function videoFromDrop(
  json: string,
  text: string
): MultiviewVideo | null {
  if (json) {
    try {
      const parsed: unknown = JSON.parse(json)
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as Video).id === "string"
      ) {
        const video = toMultiviewVideo(parsed as Video)
        if (video) return video
      }
    } catch {
      // Not ours; the text form may still be a usable link.
    }
  }
  return parseVideoUrl(text)
}

/** Where the site's language code differs from what YouTube's player expects. */
const YOUTUBE_LANGS: Record<string, string> = {
  "lol-PEKO": "en",
  "lol-UWU": "en",
  zh: "zh-Hant",
  "zh-CN": "zh-Hans",
  "en-GB": "enm",
}

export function youtubeLang(lang: string): string {
  return YOUTUBE_LANGS[lang] ?? lang.split("-")[0].toLowerCase()
}
