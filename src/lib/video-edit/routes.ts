import type { Video } from "../types.ts"
import { videoSource } from "../video-source.ts"

/**
 * The editor's address space:
 *
 *   /edit/video/:id                    Opens on what this video most likely needs
 *   /edit/video/:id/details            Topic and participants
 *   /edit/video/:id/music              Songs, starting from the comments
 *
 * The previous UI's /topic and /mentions tabs still resolve, to `details`.
 */

export type EditTab = "details" | "music"

export function editPath(id: string, tab?: EditTab): string {
  const base = `/edit/video/${encodeURIComponent(id)}`
  return tab ? `${base}/${tab}` : base
}

/** A tab from the URL, including those of the previous UI. */
export function resolveTab(tab: string | undefined): EditTab | null {
  if (tab === "music") return "music"
  if (tab === "details" || tab === "topic" || tab === "mentions")
    return "details"
  return null
}

/** Which parts of a video can be edited at all, whoever is asking. */
export function editableParts(video: Video) {
  const placeholder =
    video.type === "placeholder" || video.type === "legacy-placeholder"
  return {
    topic: video.type === "stream" || placeholder,
    mentions: !placeholder,
    // Songs are timed against a player, YouTube's is the one that can be read,
    // and there's nothing to time until a stream has started.
    songs:
      video.type === "stream" &&
      videoSource(video).provider === "youtube" &&
      video.status !== "upcoming" &&
      video.status !== "new",
  }
}

const SINGING_TOPICS = /^(music|singing|karaoke|original_song|cover)/i
const SINGING_TITLE =
  /歌枠|うたわく|歌ってみた|カラオケ|karaoke|singing|sing\s*(?:along|stream)/i

/** Most streams want a topic. A singing stream almost always wants its songs. */
export function defaultTab(video: Video): EditTab {
  if (!editableParts(video).songs) return "details"
  return Number(video.songcount) > 0 ||
    SINGING_TOPICS.test(video.topic_id ?? "") ||
    SINGING_TITLE.test(video.title ?? "")
    ? "music"
    : "details"
}
