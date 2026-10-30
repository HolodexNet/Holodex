import type { Video } from "./types.ts"

/** Provider identity is independent of the API's stream/clip/placeholder category. */
export type VideoSource =
  | { provider: "youtube"; videoId: string; url: string }
  | { provider: "twitch"; channel: string; videoId?: undefined; url: string }
  | { provider: "twitch"; videoId: string; channel?: undefined; url: string }
  | { provider: "external"; url: string | null }

type SourceVideo = Pick<Video, "id"> &
  Partial<Pick<Video, "type" | "link" | "placeholderType">>

function httpUrl(value?: string | null): URL | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol) ? url : null
  } catch {
    return null
  }
}

export function videoSource(video: SourceVideo): VideoSource {
  // Native IDs from next: tw:<broadcaster_user_login>:<event.id>.
  // The event ID is not a Twitch VOD ID and must never be passed as one.
  const nativeTwitch = /^tw:([a-zA-Z0-9_]+)(?::[^:]+)?$/.exec(video.id)
  if (nativeTwitch) {
    const channel = nativeTwitch[1].toLowerCase()
    return {
      provider: "twitch",
      channel,
      url: `https://www.twitch.tv/${channel}`,
    }
  }

  const link = httpUrl(video.link)
  if (
    link &&
    ["twitch.tv", "www.twitch.tv", "m.twitch.tv"].includes(link.hostname) &&
    (!isPlaceholderType(video.type) ||
      video.placeholderType === "external-stream")
  ) {
    const vod = /^\/videos\/(\d+)\/?$/.exec(link.pathname)
    if (vod) {
      return {
        provider: "twitch",
        videoId: vod[1],
        url: `https://www.twitch.tv/videos/${vod[1]}`,
      }
    }
    const channel = /^\/([a-zA-Z0-9_]+)\/?$/
      .exec(link.pathname)?.[1]
      .toLowerCase()
    if (
      channel &&
      ![
        "directory",
        "videos",
        "downloads",
        "settings",
        "login",
        "signup",
      ].includes(channel)
    ) {
      return {
        provider: "twitch",
        channel,
        url: `https://www.twitch.tv/${channel}`,
      }
    }
  }

  if (isPlaceholderType(video.type) || video.id.includes(":")) {
    return { provider: "external", url: link?.href ?? null }
  }
  return {
    provider: "youtube",
    videoId: video.id,
    url: `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`,
  }
}

function isPlaceholderType(type: SourceVideo["type"]): boolean {
  return type === "placeholder" || type === "legacy-placeholder"
}

export function isVideoPlaceholder(video: SourceVideo): boolean {
  return (
    isPlaceholderType(video.type) && videoSource(video).provider !== "twitch"
  )
}

/** Keep the parent hostname dynamic so local, staging and production embeds work. */
export function videoEmbedUrl(
  source: VideoSource,
  hostname: string
): string | null {
  switch (source.provider) {
    case "twitch": {
      const params = new URLSearchParams({
        parent: hostname,
        autoplay: "false",
      })
      if (source.videoId) params.set("video", `v${source.videoId}`)
      else if (source.channel) params.set("channel", source.channel)
      return `https://player.twitch.tv/?${params}`
    }
    case "youtube":
      return `https://www.youtube.com/embed/${encodeURIComponent(source.videoId)}`
    case "external":
      return null
  }
}
