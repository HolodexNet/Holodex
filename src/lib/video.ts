import { ALL_VTUBERS } from "@/lib/consts"
import type { ChannelSummary, Video } from "@/lib/types"
import type { Settings } from "@/stores/settings"

export function decodeEntities(str: string): string {
  return str.split("&amp;").join("&").split("&quot;").join('"')
}

export function videoTitle(video: Video, preferEnglish: boolean): string {
  if (video.type === "placeholder") {
    const title = preferEnglish
      ? (video.title ?? video.jp_name)
      : (video.jp_name ?? video.title)
    return decodeEntities(title ?? "")
  }
  return decodeEntities(video.title ?? "")
}

export function channelName(
  channel: Pick<ChannelSummary, "name" | "english_name">,
  preferEnglish: boolean
): string {
  return (preferEnglish && channel.english_name) || channel.name
}

/** Avatar URL at roughly the requested CSS pixel size. */
export function channelPhoto(
  channel: Pick<ChannelSummary, "id" | "photo">,
  size: number
): string {
  if (channel.photo) {
    // YouTube serves any size; stick to a few so the browser cache gets hits.
    const px = size <= 28 ? 48 : size <= 44 ? 88 : 176
    return `${channel.photo.split("=s")[0]}=s${px}-c-k-c0x00ffffff-no-rj-mo`
  }
  const nearest = Math.min(Math.max(Math.ceil(size / 50) * 50, 50), 150)
  return `/statics/channelImg/${channel.id}/${nearest}.png`
}

export interface Thumbnail {
  src: string
  srcSet?: string
}

export function videoThumbnail(video: Video): Thumbnail {
  if (video.thumbnail) {
    const encoded = btoa(video.thumbnail)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
    return { src: `/statics/thumbnail/default/${encoded}.jpg` }
  }
  if (video.type === "placeholder") {
    return { src: `/statics/channelImg/${video.channel_id ?? video.channel.id}.png` }
  }
  const base = `https://i.ytimg.com/vi/${video.id}`
  return {
    src: `${base}/mqdefault.jpg`,
    srcSet: `${base}/mqdefault.jpg 320w, ${base}/sddefault.jpg 640w`,
  }
}

export function clipCount(video: Video): number {
  if (Array.isArray(video.clips)) return video.clips.length
  return Number(video.clips) || 0
}

export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
export const watchPath = (id: string) => `/watch/${id}`

export interface FilterContext {
  settings: Pick<
    Settings,
    | "blockedChannels"
    | "ignoredTopics"
    | "hiddenGroups"
    | "hidePlaceholder"
    | "hideMissing"
  >
  favoriteIds: ReadonlySet<string>
  /** Organization the list is for; `null` on the favorites feed. */
  org: string | null
  hideCollabs: boolean
}

/**
 * Decides whether a video belongs in a feed, given the viewer's filters.
 * This mirrors the behaviour of the previous UI's feed filter.
 */
export function createVideoFilter({
  settings,
  favoriteIds,
  org,
  hideCollabs,
}: FilterContext): (video: Video) => boolean {
  const blocked = new Set(settings.blockedChannels.map((c) => c.id))
  const ignoredTopics = new Set(settings.ignoredTopics)
  const hiddenGroups = settings.hiddenGroups
  const groupOf = (ch: ChannelSummary) =>
    (ch.group || `${ch.suborg ?? ""}`.slice(2) || "Other").toLowerCase()
  const isGroupHidden = (ch: ChannelSummary) =>
    !!ch.org && !!hiddenGroups[ch.org]?.includes(groupOf(ch))

  return (video) => {
    const channel = video.channel
    const channelId = video.channel_id ?? channel.id

    if (blocked.has(channelId)) return false
    if (video.topic_id && ignoredTopics.has(video.topic_id)) return false
    if (settings.hidePlaceholder && video.type === "placeholder") return false
    if (settings.hideMissing && video.status === "missing") return false
    if (isGroupHidden(channel)) return false

    // A video from outside the organization (and not from a favorite) is only
    // here because it features someone who is: a collab.
    const inOrg = (ch: ChannelSummary) =>
      org !== null && (org === ALL_VTUBERS || ch.org === org)
    const belongs = inOrg(channel) || favoriteIds.has(channelId)
    if (!belongs) {
      if (hideCollabs) return false
      const mentions = video.mentions
      if (
        mentions?.length &&
        mentions.every(
          (m) =>
            blocked.has(m.id) ||
            isGroupHidden(m) ||
            (!inOrg(m) && !favoriteIds.has(m.id))
        )
      ) {
        return false
      }
    }
    return true
  }
}
