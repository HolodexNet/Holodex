import type { Track } from "./songs.ts"

/** Above this a match is applied without asking. It can still be undone. */
export const AUTO_MATCH_SCORE = 0.82

/** Strips what differs between two spellings of the same name. */
export function foldName(text: string): string {
  return (
    text
      .normalize("NFKC")
      .toLowerCase()
      // Katakana to hiragana, so ハッピー and はっぴー compare as the same word.
      .replace(/[ァ-ヶ]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0x60)
      )
      .replace(
        /[(（[【［]\s*(?:feat|ft|with|cover|tv|short|.*ver)[^)）\]】］]*[)）\]】］]/g,
        ""
      )
      .replace(/[\s\p{P}\p{S}]+/gu, "")
  )
}

/** Sørensen–Dice over letter pairs: forgiving of word order and small typos. */
export function similarity(a: string, b: string): number {
  const left = foldName(a)
  const right = foldName(b)
  if (!left || !right) return 0
  if (left === right) return 1
  if (left.length < 2 || right.length < 2) return 0
  const pairs = new Map<string, number>()
  for (let index = 0; index < left.length - 1; index++) {
    const pair = left.slice(index, index + 2)
    pairs.set(pair, (pairs.get(pair) ?? 0) + 1)
  }
  let shared = 0
  for (let index = 0; index < right.length - 1; index++) {
    const pair = right.slice(index, index + 2)
    const count = pairs.get(pair) ?? 0
    if (count) {
      pairs.set(pair, count - 1)
      shared++
    }
  }
  return (2 * shared) / (left.length + right.length - 2)
}

/**
 * Whether a name is still the track's: corrected, shortened or added to, not
 * replaced. Replacing one fails this within its first two letters, so the bar only
 * has to be low enough for a typo fixed in place.
 */
export function stillSameTrack(name: string, trackName: string): boolean {
  const typed = foldName(name)
  const track = foldName(trackName)
  if (!typed || !track) return false
  return (
    typed.includes(track) ||
    track.includes(typed) ||
    similarity(name, trackName) >= 0.5
  )
}

/**
 * Enough to search on. One letter of the alphabet isn't, but one kanji may well be
 * the whole title: 春, 虹, 鏡.
 */
export const isSearchable = (query: string) =>
  query.length >= 2 || /[^ -\u024f]/.test(query)

/** Many tracks are stored as "怪物 / Monster", and a comment may use either half. */
function nameVariants(name: string): string[] {
  const parts = name.split(/\s+\/\s+/)
  return parts.length > 1 ? [name, ...parts] : [name]
}

const bestOf = (text: string, name: string) =>
  Math.max(...nameVariants(name).map((variant) => similarity(text, variant)))

/**
 * How well a track fits what someone wrote. Also tries the writer's title and
 * artist the other way round, because "Artist - Song" is common and nothing but
 * real track data can tell the two apart.
 */
export function scoreTrack(
  wanted: { title: string; artist: string },
  track: Pick<Track, "name" | "artist">
): number {
  const title = bestOf(wanted.title, track.name)
  if (!wanted.artist) return title * 0.9
  const direct = title * 0.7 + similarity(wanted.artist, track.artist) * 0.3
  const flipped =
    bestOf(wanted.artist, track.name) * 0.7 +
    similarity(wanted.title, track.artist) * 0.3
  return Math.max(direct, flipped)
}

export function rankTracks(
  wanted: { title: string; artist: string },
  tracks: readonly Track[]
): { track: Track; score: number }[] {
  return tracks
    .map((track) => ({ track, score: scoreTrack(wanted, track) }))
    .sort((a, b) => b.score - a.score)
}

/** Keeps the first of each, as earlier sources are the better ones. */
export function dedupeTracks(tracks: readonly Track[]): Track[] {
  const seen = new Set<string>()
  const out: Track[] = []
  for (const track of tracks) {
    const keys = [
      track.itunesid && Number(track.itunesid) > 0
        ? `id:${track.itunesid}`
        : null,
      `name:${foldName(track.name)}|${foldName(track.artist)}`,
    ].filter((key): key is string => !!key)
    if (keys.some((key) => seen.has(key))) continue
    keys.forEach((key) => seen.add(key))
    out.push(track)
  }
  return out
}

/** "怪物 / Monster", when the English listing differs enough to be worth adding. */
export function withEnglishName(name: string, english?: string): string {
  if (!english || name.toUpperCase() === english.toUpperCase()) return name
  return similarity(name, english) < 0.75 ? `${name} / ${english}` : name
}
