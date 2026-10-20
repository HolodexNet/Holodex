import type { Video } from "./types.ts"

const MINUTE = 60_000
const COLLAB_WINDOW = 30 * MINUTE

/** Live streams compare by when they went on air; schedules can slip apart. */
function start(video: Video): number {
  const value =
    video.status === "live"
      ? (video.start_actual ?? video.start_scheduled ?? video.available_at)
      : (video.start_scheduled ?? video.start_actual ?? video.available_at)
  return value == null ? NaN : new Date(value).getTime()
}

/** Conservative pairwise evidence: do not turn unrelated game streams into a collab. */
export function areCollaborating(a: Video, b: Video): boolean {
  if (
    a.id === b.id ||
    a.channel.id === b.channel.id ||
    a.type !== "stream" ||
    b.type !== "stream" ||
    a.status !== b.status ||
    !["live", "upcoming"].includes(a.status) ||
    !a.topic_id?.trim() ||
    a.topic_id !== b.topic_id
  )
    return false

  const gap = Math.abs(start(a) - start(b))
  if (!Number.isFinite(gap) || gap > COLLAB_WINDOW) return false

  const aMentionsB = !!a.mentions?.some(
    (channel) => channel.id === b.channel.id
  )
  const bMentionsA = !!b.mentions?.some(
    (channel) => channel.id === a.channel.id
  )
  return aMentionsB && bMentionsA
}

/**
 * Preserve feed order, putting a collab in its first member's position. Every
 * pair within a group must match; a shared guest cannot bridge separate events.
 * Input is already filtered, so blocked/hidden streams never return via a group.
 */
export function collateCollaborations(videos: readonly Video[]): Video[][] {
  const unique = new Map<string, Video>()
  const byChannel = new Map<string, Video[]>()
  for (const video of videos) {
    if (unique.has(video.id)) continue
    unique.set(video.id, video)
    const channelVideos = byChannel.get(video.channel.id) ?? []
    channelVideos.push(video)
    byChannel.set(video.channel.id, channelVideos)
  }
  const neighbors = new Map<string, Set<string>>()
  const connect = (a: string, b: string) => {
    if (a === b || !unique.has(b)) return
    for (const [from, to] of [
      [a, b],
      [b, a],
    ]) {
      const ids = neighbors.get(from) ?? new Set<string>()
      ids.add(to)
      neighbors.set(from, ids)
    }
  }
  for (const video of unique.values()) {
    for (const mention of video.mentions ?? []) {
      for (const other of byChannel.get(mention.id) ?? [])
        connect(video.id, other.id)
    }
  }
  const groups: Video[][] = []
  const groupById = new Map<string, number>()
  for (const video of unique.values()) {
    // Most streams have no related hosts: skip unrelated pairs even in huge feeds.
    const candidates = new Set<number>()
    for (const id of neighbors.get(video.id) ?? []) {
      const index = groupById.get(id)
      if (index !== undefined) candidates.add(index)
    }
    const index = [...candidates]
      .sort((a, b) => a - b)
      .find((index) =>
        groups[index].every((member) => areCollaborating(member, video))
      )
    if (index !== undefined) {
      groups[index].push(video)
      groupById.set(video.id, index)
    } else {
      groupById.set(video.id, groups.length)
      groups.push([video])
    }
  }
  return groups
}
