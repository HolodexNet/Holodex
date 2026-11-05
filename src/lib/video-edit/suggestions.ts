import type { ChannelSummary, Video } from "../types.ts"

/** How a topic id reads to people: `Apex_Legends` is "Apex Legends". */
export const topicLabel = (id: string) => id.replace(/_/g, " ")

/**
 * Topics worth a single click for this video: those named in its title, then
 * those its channel uses most. Titles win because they describe this video.
 */
export function suggestTopics(
  video: Pick<Video, "title">,
  topics: readonly string[],
  channelTopics: readonly string[] = [],
  limit = 6
): string[] {
  const title = (video.title ?? "").toLowerCase()
  const inTitle = topics
    // Short ids like "art" or "ai" match inside far too many words.
    .filter((id) => id.length >= 4)
    .filter((id) => title.includes(topicLabel(id).toLowerCase()))
    .sort((a, b) => b.length - a.length)
  return [...new Set([...inTitle, ...channelTopics])].slice(0, limit)
}

/** Parts of a channel name that say nothing about who it is. */
const GENERIC_NAME_PART =
  /^(ch|ch\.|channel|chan|official|hololive|holostars|holoen|holoid|holojp|nijisanji|niji|vshojo|vspo|phaseconnect|en|jp|id|kr|cn|gen|vtuber|the|ver)$/i

const LATIN_ONLY = /^[a-z0-9 .'-]+$/i

/** The distinct names a channel goes by, longest and so most specific first. */
export function channelNameParts(channel: {
  name: string
  english_name?: string | null
}): string[] {
  const parts = [channel.english_name ?? "", channel.name]
    .flatMap((name) => name.split(/[\s/|・･,、【】[\]()（）「」『』-]+/))
    .map((part) => part.trim())
    .filter((part) => part && !GENERIC_NAME_PART.test(part))
    .filter((part) =>
      // A short Latin word is usually an ordinary word; a short kana name isn't.
      LATIN_ONLY.test(part) ? part.length >= 4 : part.length >= 2
    )
  return [...new Set(parts)].sort((a, b) => b.length - a.length)
}

function containsName(text: string, name: string): boolean {
  if (!LATIN_ONLY.test(name)) return text.includes(name)
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`,
    "iu"
  ).test(text)
}

/**
 * Talents named in a video's title or description who aren't credited yet.
 * Links are already turned into mentions when a video is crawled, which leaves
 * plain text such as "w/ Korone" for a person to pick up, or for this to offer.
 */
export function suggestMentions(
  video: Pick<Video, "title" | "description" | "channel">,
  channels: readonly ChannelSummary[],
  existing: ReadonlySet<string>,
  limit = 6
): ChannelSummary[] {
  const title = video.title ?? ""
  const description = video.description ?? ""
  const scored: { channel: ChannelSummary; score: number }[] = []
  for (const channel of channels) {
    if (channel.id === video.channel.id || existing.has(channel.id)) continue
    const parts = channelNameParts(channel)
    const score = parts.some((part) => containsName(title, part))
      ? 2
      : parts.some((part) => containsName(description, part))
        ? 1
        : 0
    if (score) scored.push({ channel, score })
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.channel)
}
