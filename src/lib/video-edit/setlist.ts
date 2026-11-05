import { toHalfWidth } from "./timecode.ts"

/**
 * Reading setlists out of YouTube comments and descriptions.
 *
 * People write these every way imaginable, and all of it has to survive:
 *
 *   0:05:12 Song A / Artist A            1. 12:34 - 16:20 「Song」 Artist
 *   [12:34] Song - Artist                Song by Artist 12:34
 *   １２：３４ 曲名／歌手                   12:34 Song 16:20 Song 20:10 Song
 *
 * Nothing here is authoritative: every result is a suggestion a person confirms.
 */

export type EntryKind = "song" | "note"

export interface SetlistEntry {
  start: number
  /** Only when the writer gave a range. */
  end?: number
  /** The line's annotation, with its timestamps removed. */
  text: string
  title: string
  artist: string
  /** `note` is a timestamp that isn't a song, such as "MC" or "Opening". */
  kind: EntryKind
}

export interface SetlistSource {
  id: string
  kind: "comment" | "description" | "paste"
  message: string
  entries: SetlistEntry[]
  songCount: number
  score: number
}

export interface SongHint {
  start: number
  end?: number
  text: string
  title: string
  artist: string
  /** How many sources agree on this moment. */
  weight: number
}

/** Longer than almost any performance, so a pair of times further apart isn't one. */
const LONGEST_RANGE_SECONDS = 20 * 60

/** The lookbehind this wants would break older Safari, hence the captured prefix. */
const STAMP = /(^|[^\d:.])(?:(\d{1,2}):)?(\d{1,3}):(\d{2})(?![\d:])/g
const WALL_CLOCK =
  /\b(?:JST|PST|PDT|EST|EDT|UTC|GMT|KST|CET|CEST|WIB|AEST|BST|CST|IST)\b|日本時間|開始予定|配信予定/i
const CALENDAR_DATE = /\d{4}[/.-]\d{1,2}|\d{1,2}月\d{1,2}日/
const RANGE_JOIN = /^[\s\-–—―ー~〜～→⇒>]*(?:to)?[\s\-–—―ー~〜～→⇒>]*$/i
/** Kept off the end of a title on purpose: "ー" is a letter, as in ハッピー. */
const EDGE_NOISE_START =
  /^[\s\-–—―ー~〜～・•·*►▶▷→⇒➡♪♫♬♩🎵🎶🎤🎼🎧#:：|｜,、.。]+/u
const EDGE_NOISE_END = /[\s\-–—―~〜～・•·*►▶▷→⇒➡♪♫♬♩🎵🎶🎤🎼🎧#:：|｜,、]+$/u
const EMPTY_BRACKETS = /[[(（【［{<＜《〈]\s*[\])）】］}>＞》〉]/g
/** Not when a digit follows: "99.9" is a song, not the 99th item of a list. */
const LIST_NUMBER = /^(?:\d{1,3}[.)、．](?!\d)|[①-⑳]|#\d{1,3})\s*/
const NOTE_WORDS =
  /^(?:start|starts|stream start|intro|opening|op|ending|ed|outro|end|fin|mc|talk|talking|chat|chatting|break|rest|greetings?|bgm|thanks|super ?chats?.*|sc.*|members?.*|スパチャ.*|配信開始|開始|スタート|雑談|トーク|休憩|あいさつ|挨拶|おしゃべり|オープニング|エンディング|待機.*|準備.*|締め|終了|おわり|おしまい|お知らせ.*|告知.*)$/i
const NOT_AN_ARTIST =
  /^(?:covers?|カバー|acoustic|アコースティック|short|tv\s*size|full|remix|.*ver\.?|.*version|live|アカペラ|a\s*cappella|feat\.?.*|ft\.?.*|with.*|w\/.*|\d+)$/i
const SETLIST_WORDS =
  /set\s*list|setlist|セトリ|セットリスト|歌枠|曲目|曲リスト|song\s*list|track\s*list|tracklist|タイムスタンプ/i
const HAS_LETTERS = /[\p{L}\p{N}]/u

function cleanText(text: string): string {
  return text
    .replace(EMPTY_BRACKETS, " ")
    .replace(EDGE_NOISE_START, "")
    .replace(LIST_NUMBER, "")
    .replace(EDGE_NOISE_START, "")
    .replace(EDGE_NOISE_END, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Comments arrive as plain text now, but older rows hold YouTube's HTML. */
export function decodeMessage(message: string): string {
  if (!/<br|<a\s|&(?:amp|quot|lt|gt|nbsp|#\d+|#x[\da-f]+);/i.test(message))
    return message
  return message
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

/**
 * Splits "Song / Artist" and its many cousins. The title is assumed to come
 * first: when a comment has it the other way round, matching against real tracks
 * is what notices (see `scoreTrack`).
 */
export function splitTitleArtist(text: string): {
  title: string
  artist: string
} {
  const quoted =
    /^[「『"“]([^」』"”]+)[」』"”]\s*(?:[-–—/／|｜:：]|by\s+)?\s*(.*)$/i.exec(
      text
    )
  if (quoted)
    return { title: quoted[1].trim(), artist: cleanText(quoted[2] ?? "") }
  const quotedLast = /^(.+?)\s*[「『]([^」』]+)[」』]\s*$/.exec(text)
  if (quotedLast)
    return { title: quotedLast[2].trim(), artist: cleanText(quotedLast[1]) }
  // In order of how rarely each appears inside a title itself.
  for (const separator of [
    /\s+[/／]\s+/,
    /\s*／\s*/,
    /\s+[-–—―ー~〜～]\s+/,
    /\s+by\s+/i,
    /\s*[|｜]\s*/,
    /\s*\/\s*/,
  ]) {
    const match = separator.exec(text)
    if (!match || match.index === 0) continue
    const title = text.slice(0, match.index).trim()
    const artist = cleanText(text.slice(match.index + match[0].length))
    if (title && artist) return { title, artist }
  }
  const tail = /^(.+?)\s*[(（【［[]([^)）】］\]]+)[)）】］\]]\s*$/.exec(text)
  if (tail && !NOT_AN_ARTIST.test(tail[2].trim()))
    return { title: tail[1].trim(), artist: tail[2].trim() }
  return { title: text, artist: "" }
}

interface Stamp {
  seconds: number
  index: number
  end: number
}

function findStamps(line: string): Stamp[] {
  const stamps: Stamp[] = []
  for (const match of line.matchAll(STAMP)) {
    const hours = Number(match[2] ?? 0)
    const minutes = Number(match[3])
    const seconds = Number(match[4])
    if (seconds >= 60 || (match[2] && minutes >= 60)) continue
    const index = match.index + match[1].length
    stamps.push({
      seconds: hours * 3600 + minutes * 60 + seconds,
      index,
      end: match.index + match[0].length,
    })
  }
  return stamps
}

function makeEntry(start: number, rawText: string, end?: number): SetlistEntry {
  const text = cleanText(rawText)
  const isNote = !HAS_LETTERS.test(text) || NOTE_WORDS.test(text)
  const { title, artist } = isNote
    ? { title: text, artist: "" }
    : splitTitleArtist(text)
  return {
    start,
    ...(end !== undefined ? { end } : {}),
    text,
    title,
    artist,
    kind: isNote ? "note" : "song",
  }
}

function parseLine(rawLine: string): SetlistEntry[] {
  const line = toHalfWidth(rawLine).replace(/https?:\/\/\S+/g, " ")
  if (!line.trim() || WALL_CLOCK.test(line) || CALENDAR_DATE.test(line))
    return []
  const stamps = findStamps(line)
  if (!stamps.length) return []
  const before = line.slice(0, stamps[0].index)
  if (stamps.length === 1)
    return [
      makeEntry(stamps[0].seconds, `${before} ${line.slice(stamps[0].end)}`),
    ]
  if (stamps.length === 2) {
    const [first, second] = stamps
    const between = line.slice(first.end, second.index)
    const after = line.slice(second.end)
    const gap = second.seconds - first.seconds
    if (
      gap > 0 &&
      gap <= LONGEST_RANGE_SECONDS &&
      (RANGE_JOIN.test(between) || !after.trim())
    )
      return [
        makeEntry(
          first.seconds,
          RANGE_JOIN.test(between)
            ? `${before} ${after}`
            : `${before} ${between}`,
          second.seconds
        ),
      ]
  }
  // Several songs flattened onto one line. The text belongs to the stamp it
  // follows, unless the line starts with text and ends on a stamp.
  const textComesFirst =
    !!before.trim() && !line.slice(stamps[stamps.length - 1].end).trim()
  return stamps.map((stamp, index) =>
    makeEntry(
      stamp.seconds,
      textComesFirst
        ? line.slice(index ? stamps[index - 1].end : 0, stamp.index)
        : line.slice(stamp.end, stamps[index + 1]?.index ?? line.length)
    )
  )
}

/** Every timestamped line of a message, in the order they were written. */
export function parseSetlist(
  message: string,
  duration?: number
): SetlistEntry[] {
  const entries = decodeMessage(message).split(/\r?\n/).flatMap(parseLine)
  return duration
    ? entries.filter((entry) => entry.start <= duration + 30)
    : entries
}

function scoreSetlist(
  entries: readonly SetlistEntry[],
  message: string,
  duration?: number
): number {
  const songs = entries.filter((entry) => entry.kind === "song")
  if (songs.length < 2) return 0
  let ascending = 0
  for (let index = 1; index < songs.length; index++)
    if (songs[index].start > songs[index - 1].start) ascending++
  const inOrder = ascending / (songs.length - 1)
  const credited = songs.filter((song) => song.artist).length / songs.length
  const brief =
    songs.filter((song) => song.text.length <= 60).length / songs.length
  const starts = songs.map((song) => song.start)
  const spread = duration
    ? (Math.max(...starts) - Math.min(...starts)) / duration
    : 0.5
  return (
    songs.length *
    (0.4 + 0.6 * inOrder) *
    (0.4 + 0.6 * credited) *
    (0.5 + 0.5 * brief) *
    (0.7 + 0.3 * Math.min(spread, 1)) *
    (SETLIST_WORDS.test(message) ? 1.5 : 1)
  )
}

export function makeSource(
  id: string,
  kind: SetlistSource["kind"],
  message: string,
  duration?: number
): SetlistSource {
  const entries = parseSetlist(message, duration)
    // A list is read in time order even when it wasn't written in it.
    .slice()
    .sort((a, b) => a.start - b.start)
  return {
    id,
    kind,
    message: decodeMessage(message),
    entries,
    songCount: entries.filter((entry) => entry.kind === "song").length,
    score: scoreSetlist(parseSetlist(message, duration), message, duration),
  }
}

/** Everything that looks like a setlist, the most convincing first. */
export function rankSources(
  comments: readonly { comment_key: string; message: string }[],
  description: string | null | undefined,
  duration?: number
): SetlistSource[] {
  const sources = comments.map((comment) =>
    makeSource(comment.comment_key, "comment", comment.message, duration)
  )
  if (description)
    sources.push(
      makeSource("description", "description", description, duration)
    )
  return sources
    .filter((source) => source.score > 0)
    .sort((a, b) => b.score - a.score)
}

/** Within this, two comments are taken to be talking about the same moment. */
const SAME_MOMENT_SECONDS = 5

/**
 * What the comments say is happening when, for pointing out in the player's
 * timeline. Single-line comments count too: "12:34 this part!" tends to mark a
 * song even when nobody wrote a whole setlist.
 */
export function buildHints(
  comments: readonly { comment_key: string; message: string }[],
  sources: readonly SetlistSource[],
  duration?: number
): SongHint[] {
  const hints: SongHint[] = []
  const take = (entry: SetlistEntry) => {
    if (entry.kind !== "song" || entry.text.length > 80) return
    const same = hints.find(
      (hint) => Math.abs(hint.start - entry.start) <= SAME_MOMENT_SECONDS
    )
    if (same) {
      same.weight++
      same.end ??= entry.end
      return
    }
    hints.push({
      start: entry.start,
      ...(entry.end !== undefined ? { end: entry.end } : {}),
      text: entry.text,
      title: entry.title,
      artist: entry.artist,
      weight: 1,
    })
  }
  // Best sources first, so that their wording is the wording that's kept.
  for (const source of sources) source.entries.forEach(take)
  const used = new Set(sources.map((source) => source.id))
  for (const comment of comments) {
    if (used.has(comment.comment_key)) continue
    parseSetlist(comment.message, duration).forEach(take)
  }
  return hints.sort((a, b) => a.start - b.start).slice(0, 400)
}

/** What people said around a moment, the closest first. */
export function hintsNear(
  hints: readonly SongHint[],
  time: number,
  within = 45
): SongHint[] {
  return hints
    .filter((hint) => Math.abs(hint.start - time) <= within)
    .sort((a, b) => Math.abs(a.start - time) - Math.abs(b.start - time))
}
