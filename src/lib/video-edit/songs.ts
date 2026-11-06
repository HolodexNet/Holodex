import type { Song } from "../musicdex/types.ts"
import type { WireDate } from "../types.ts"
import type { SetlistEntry } from "./setlist.ts"
import { foldName, stillSameTrack } from "./track-match.ts"

/** Shorter than this and it's a mistake rather than a song. */
export const MIN_SONG_SECONDS = 13
/** What a song is assumed to run for until something better is known. */
export const DEFAULT_SONG_SECONDS = 240
/** Beyond this, the next timestamp isn't plausibly the end of this song. */
const LONGEST_SONG_SECONDS = 15 * 60

/** Where a song's end came from, which decides whether a track may replace it. */
export type EndSource = "comment" | "next" | "track" | "estimate" | "user"

export interface SongDraft {
  id: string
  name: string
  original_artist: string
  start: number
  end: number
  itunesid: string | number | null
  art: string | null
  amUrl: string | null
  creator_id?: string | number | null
  channel_id?: string
  available_at?: WireDate | null

  // Editing aids, never sent to the server.
  endSource?: EndSource
  /** The matched track's own length, for "use the track's length". */
  trackSeconds?: number | null
  /** What the linked track is called, to tell a correction from a different song. */
  trackName?: string | null
  /** The comment text this came from, kept while a match replaces the name. */
  fromText?: string
  /** Waiting to be looked up in Musicdex and iTunes. */
  matchPending?: boolean
  /** Someone has said no to a match, so don't keep offering it unless the name changes. */
  matchDeclined?: boolean
  /** Someone has listened to this one and is happy with it. */
  checked?: boolean
}

export type SongState = "saved" | "new" | "edited" | "removed"

export interface SongRow {
  song: SongDraft
  state: SongState
}

export function draftFromSong(song: Song): SongDraft {
  return {
    id: song.id,
    name: song.name,
    original_artist: song.original_artist ?? "",
    start: song.start,
    end: song.end,
    itunesid: song.itunesid ?? null,
    art: song.art ?? null,
    amUrl: song.amUrl ?? null,
    trackName: song.itunesid || song.art || song.amUrl ? song.name : null,
    creator_id: song.creator_id ?? null,
    channel_id: song.channel_id,
    available_at: song.available_at ?? null,
  }
}

const sameId = (a: unknown, b: unknown) => String(a ?? "") === String(b ?? "")

/** Whether two songs would look the same to anyone listening on Musicdex. */
export function sameContent(a: SongDraft, b: SongDraft): boolean {
  return (
    a.name.trim() === b.name.trim() &&
    a.original_artist.trim() === b.original_artist.trim() &&
    Math.round(a.start) === Math.round(b.start) &&
    Math.round(a.end) === Math.round(b.end) &&
    sameId(a.itunesid, b.itunesid) &&
    (a.art ?? null) === (b.art ?? null) &&
    (a.amUrl ?? null) === (b.amUrl ?? null)
  )
}

/** The server's list with local changes on top, in the order things happen. */
export function mergeSongs(
  server: readonly SongDraft[],
  edits: Readonly<Record<string, SongDraft>>,
  removed: Readonly<Record<string, true>>
): SongRow[] {
  const rows: SongRow[] = []
  const known = new Set<string>()
  for (const base of server) {
    known.add(base.id)
    const edit = edits[base.id]
    rows.push({
      song: edit ?? base,
      state: removed[base.id] ? "removed" : edit ? "edited" : "saved",
    })
  }
  for (const edit of Object.values(edits))
    if (!known.has(edit.id)) rows.push({ song: edit, state: "new" })
  return rows.sort(
    (a, b) => a.song.start - b.song.start || a.song.end - b.song.end
  )
}

export type SongIssue = "name" | "order" | "short" | "past-end" | "overlap"

const BLOCKING: readonly SongIssue[] = ["name", "order", "short"]
export const blocksSaving = (issue: SongIssue) => BLOCKING.includes(issue)

export function songIssues(
  song: SongDraft,
  others: readonly SongDraft[],
  duration: number
): SongIssue[] {
  const issues: SongIssue[] = []
  if (!song.name.trim()) issues.push("name")
  if (song.end <= song.start) issues.push("order")
  else if (song.end - song.start < MIN_SONG_SECONDS) issues.push("short")
  if (duration && song.end > duration + 1) issues.push("past-end")
  if (
    others.some(
      (other) =>
        other.id !== song.id && other.start < song.end && song.start < other.end
    )
  )
    issues.push("overlap")
  return issues
}

/** The first song this one runs into. */
export function firstOverlap(
  song: SongDraft,
  others: readonly SongDraft[]
): SongDraft | null {
  return (
    others.find(
      (other) =>
        other.id !== song.id && other.start < song.end && song.start < other.end
    ) ?? null
  )
}

export const overlapSeconds = (a: SongDraft, b: SongDraft) =>
  Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start))

export type SongFix =
  | { kind: "length"; end: number; seconds: number }
  | { kind: "video-end"; end: number }
  | { kind: "before-next"; end: number; other: SongDraft }
  | { kind: "after-previous"; start: number; other: SongDraft }

/**
 * The one obvious way out of an issue, when there is one. Offered rather than
 * applied, and never one that would only trade this problem for another.
 */
export function songFix(
  issue: SongIssue,
  song: SongDraft,
  others: readonly SongDraft[],
  duration: number
): SongFix | null {
  if (issue === "order" || issue === "short") {
    const next = others.find(
      (other) => other.id !== song.id && other.start > song.start
    )
    let end = song.start + (song.trackSeconds || DEFAULT_SONG_SECONDS)
    if (next && next.start > song.start + MIN_SONG_SECONDS)
      end = Math.min(end, next.start - 1)
    if (duration) end = Math.min(end, duration)
    return end - song.start >= MIN_SONG_SECONDS && end !== song.end
      ? { kind: "length", end, seconds: end - song.start }
      : null
  }
  if (issue === "past-end")
    return duration - song.start >= MIN_SONG_SECONDS
      ? { kind: "video-end", end: duration }
      : null
  if (issue === "overlap") {
    const other = firstOverlap(song, others)
    if (!other) return null
    if (other.start > song.start)
      return other.start - song.start >= MIN_SONG_SECONDS
        ? { kind: "before-next", end: other.start, other }
        : null
    return song.end - other.end >= MIN_SONG_SECONDS
      ? { kind: "after-previous", start: other.end, other }
      : null
  }
  return null
}

/** Artists already used on this video, so that one gets spelled the same way twice. */
export function artistSuggestions(
  typed: string,
  songs: readonly Pick<SongDraft, "original_artist">[],
  limit = 6
): string[] {
  const wanted = foldName(typed)
  const seen = new Map<string, { name: string; uses: number }>()
  for (const { original_artist: artist } of songs) {
    const name = artist.trim()
    const key = foldName(name)
    if (!key) continue
    const entry = seen.get(key)
    if (entry) entry.uses++
    else seen.set(key, { name, uses: 1 })
  }
  return [...seen.entries()]
    .filter(([key, { name }]) => key.includes(wanted) && name !== typed.trim())
    .sort((a, b) => b[1].uses - a[1].uses)
    .slice(0, limit)
    .map(([, { name }]) => name)
}

/** An end for an entry, from whatever the list itself gives away. */
export function estimateEnd(
  entries: readonly SetlistEntry[],
  index: number,
  duration: number
): { end: number; endSource: EndSource } {
  const entry = entries[index]
  if (entry.end !== undefined) return { end: entry.end, endSource: "comment" }
  const next = entries[index + 1]
  if (next) {
    const gap = next.start - entry.start
    // "12:34 Song / 16:50 MC" is someone telling you when the song stopped.
    if (next.kind === "note" && gap >= 45 && gap <= LONGEST_SONG_SECONDS)
      return { end: next.start, endSource: "next" }
    // Otherwise the next song is only a limit: there's usually talk in between.
    if (gap >= MIN_SONG_SECONDS && gap < DEFAULT_SONG_SECONDS)
      return { end: next.start - 1, endSource: "estimate" }
  }
  const end = entry.start + DEFAULT_SONG_SECONDS
  return {
    end: duration ? Math.min(end, Math.max(duration, entry.start + 1)) : end,
    endSource: "estimate",
  }
}

/** Fields for a new song from a line of a setlist. */
export function draftFieldsFromEntry(
  entries: readonly SetlistEntry[],
  index: number,
  duration: number
): Omit<SongDraft, "id"> {
  const entry = entries[index]
  return {
    name: entry.title,
    original_artist: entry.artist,
    start: entry.start,
    itunesid: null,
    art: null,
    amUrl: null,
    fromText: entry.text,
    matchPending: true,
    ...estimateEnd(entries, index, duration),
  }
}

/** Whether a song already covers the moment a setlist line points at. */
export function songCovers(
  songs: readonly Pick<SongDraft, "start" | "end">[],
  start: number,
  tolerance = 10
): boolean {
  return songs.some((song) => Math.abs(song.start - start) <= tolerance)
}

export interface Track {
  key: string
  source: "musicdex" | "itunes"
  name: string
  artist: string
  /** Null when the source doesn't know. */
  seconds: number | null
  itunesid: string | number | null
  art: string | null
  amUrl: string | null
  album?: string
  year?: string
}

/**
 * What choosing a track changes. Its length replaces the end only if nobody has
 * said otherwise, and never runs over the song after it.
 */
export function trackPatch(
  song: SongDraft,
  track: Track,
  nextStart?: number
): Partial<SongDraft> {
  const patch: Partial<SongDraft> = {
    name: track.name,
    original_artist: track.artist,
    itunesid: track.itunesid,
    art: track.art,
    amUrl: track.amUrl,
    trackSeconds: track.seconds,
    trackName: track.name,
    matchPending: false,
  }
  if (track.seconds && (!song.endSource || song.endSource === "estimate")) {
    const end = song.start + track.seconds
    const limited =
      nextStart !== undefined && end > nextStart && nextStart > song.start
    patch.end = Math.round(limited ? nextStart - 1 : end)
    patch.endSource = "track"
  }
  return patch
}

/** Everything that ties a song to one particular release. */
export const NO_TRACK = {
  itunesid: null,
  art: null,
  amUrl: null,
  trackSeconds: null,
  trackName: null,
} satisfies Partial<SongDraft>

export const hasTrack = (song: Pick<SongDraft, "itunesid" | "art" | "amUrl">) =>
  !!(song.itunesid || song.art || song.amUrl)

/**
 * What typing a new name does to the track. Fixing a typo or adding a translation
 * is still the same song, whereas a different name no longer goes with its cover.
 */
export function renamePatch(song: SongDraft, name: string): Partial<SongDraft> {
  const keeps =
    !hasTrack(song) ||
    (!!song.trackName && stillSameTrack(name, song.trackName))
  return { name, matchPending: false, ...(keeps ? {} : NO_TRACK) }
}

/** Trims, and turns a run of spaces into one, which copied text is often full of. */
export const tidyText = (text: string) =>
  text.replace(/\s+/g, (run) => run[0]).trim()

export interface SongPayload {
  id: string
  channel_id: string
  video_id: string
  name: string
  start: number
  end: number
  itunesid: string | number | null
  art: string | null
  amUrl: string | null
  available_at: WireDate
  original_artist: string
}

/**
 * The write itself. Times are whole seconds in the database, and every field is
 * always sent because an omitted one is left as it was rather than cleared.
 */
export function songPayload(
  song: SongDraft,
  video: {
    id: string
    channel: { id: string }
    available_at?: WireDate | null
    published_at?: WireDate | null
  },
  now: () => WireDate = () => new Date().toISOString()
): SongPayload {
  return {
    id: song.id,
    channel_id: song.channel_id ?? video.channel.id,
    video_id: video.id,
    name: song.name.trim(),
    start: Math.max(0, Math.round(song.start)),
    end: Math.max(0, Math.round(song.end)),
    itunesid: song.itunesid ?? null,
    art: song.art ?? null,
    amUrl: song.amUrl ?? null,
    available_at:
      song.available_at ?? video.available_at ?? video.published_at ?? now(),
    original_artist: song.original_artist.trim(),
  }
}
