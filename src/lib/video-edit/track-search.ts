import { musicApi } from "@/lib/musicdex/api"
import type { Song } from "@/lib/musicdex/types"
import type { Track } from "./songs"
import {
  AUTO_MATCH_SCORE,
  dedupeTracks,
  rankTracks,
  withEnglishName,
} from "./track-match"

/** Apple allows about 20 searches a minute per address, and blocks beyond that. */
const ITUNES_PER_MINUTE = 18
const ITUNES_TIMEOUT_MS = 8000

const itunesCalls: number[] = []

async function itunesSlot(signal?: AbortSignal): Promise<void> {
  for (;;) {
    signal?.throwIfAborted()
    const now = Date.now()
    while (itunesCalls.length && now - itunesCalls[0] > 60_000)
      itunesCalls.shift()
    if (itunesCalls.length < ITUNES_PER_MINUTE) {
      itunesCalls.push(now)
      return
    }
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        resolve,
        Math.max(250, itunesCalls[0] + 60_000 - now)
      )
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer)
          reject(signal.reason)
        },
        { once: true }
      )
    })
  }
}

type JsonpWindow = Window &
  Record<string, ((data: unknown) => void) | undefined>
let jsonpSequence = 0

/** iTunes search sends no CORS headers, so JSONP is the only way to call it. */
function jsonp<T>(url: string, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const target = window as unknown as JsonpWindow
    const name = `holodexItunes${Date.now()}${jsonpSequence++}`
    const script = document.createElement("script")
    const finish = () => {
      clearTimeout(timer)
      signal?.removeEventListener("abort", onAbort)
      script.remove()
      // A response already on its way must still find something to call.
      target[name] = () => {
        delete target[name]
      }
    }
    const fail = (reason: unknown) => {
      finish()
      reject(reason)
    }
    const onAbort = () => fail(signal?.reason)
    const timer = setTimeout(
      () => fail(new Error("iTunes timed out")),
      ITUNES_TIMEOUT_MS
    )
    target[name] = (data) => {
      finish()
      delete target[name]
      resolve(data as T)
    }
    signal?.addEventListener("abort", onAbort, { once: true })
    script.onerror = () => fail(new Error("iTunes request failed"))
    script.src = `${url}&callback=${name}`
    document.head.appendChild(script)
  })
}

interface ItunesResult {
  trackId: number
  trackName: string
  trackCensoredName?: string
  artistName: string
  collectionName?: string
  releaseDate?: string
  trackTimeMillis?: number
  artworkUrl100?: string
  trackViewUrl?: string
}

async function itunesSearch(
  term: string,
  lang: string,
  country: string,
  limit: number,
  signal?: AbortSignal
): Promise<ItunesResult[]> {
  await itunesSlot(signal)
  const params = new URLSearchParams({
    term,
    entity: "musicTrack",
    country,
    limit: String(limit),
    lang,
  })
  const response = await jsonp<{ results?: ItunesResult[] }>(
    `https://itunes.apple.com/search?${params}`,
    signal
  )
  return response.results ?? []
}

function itunesTrack(result: ItunesResult, english?: string): Track {
  return {
    key: `itunes:${result.trackId}`,
    source: "itunes",
    name: withEnglishName(result.trackName, english),
    artist: result.artistName,
    seconds: result.trackTimeMillis
      ? Math.ceil(result.trackTimeMillis / 1000)
      : null,
    itunesid: result.trackId,
    art: result.artworkUrl100 ?? null,
    amUrl: result.trackViewUrl ?? null,
    album: result.collectionName,
    year: result.releaseDate?.slice(0, 4),
  }
}

function musicdexTrack(song: Song): Track {
  return {
    key: `musicdex:${song.id}`,
    source: "musicdex",
    name: song.name,
    artist: song.original_artist ?? "",
    seconds: song.end > song.start ? song.end - song.start : null,
    itunesid: song.itunesid ?? null,
    art: song.art ?? null,
    amUrl: song.amUrl ?? null,
  }
}

async function musicdexSearch(
  query: string,
  signal?: AbortSignal
): Promise<Track[]> {
  return (await musicApi.findSongs(query, signal)).map(musicdexTrack)
}

/**
 * Songs already on Holodex. They're usually spelled the way this community spells
 * them and include originals that were never on iTunes, so they go first, and they
 * arrive separately because Apple's limit can keep iTunes waiting for a minute.
 */
export async function searchMusicdexTracks(
  query: string,
  signal?: AbortSignal
): Promise<Track[]> {
  return (await musicdexSearch(query, signal)).slice(0, 4)
}

/**
 * Japan's store has the better catalog for this music, and the US listing supplies
 * an English name where one exists.
 */
export async function searchItunesTracks(
  query: string,
  signal?: AbortSignal
): Promise<Track[]> {
  const [japanese, english] = await Promise.allSettled([
    itunesSearch(query, "ja_jp", "JP", 10, signal),
    itunesSearch(query, "en_us", "US", 10, signal),
  ])
  signal?.throwIfAborted()
  if (japanese.status === "rejected") throw japanese.reason
  const englishNames = new Map(
    (english.status === "fulfilled" ? english.value : []).map((result) => [
      result.trackId,
      result.trackCensoredName || result.trackName,
    ])
  )
  return japanese.value.map((result) =>
    itunesTrack(result, englishNames.get(result.trackId))
  )
}

export interface MatchResult {
  /** Confident enough to apply without asking. */
  match: Track | null
  /** Otherwise, the likeliest few for someone to choose from. */
  candidates: Track[]
}

/**
 * Looks up one line of a setlist. Asks Musicdex first and only spends an iTunes
 * search when that isn't conclusive, because a long setlist would otherwise run
 * straight into Apple's limit.
 */
export async function findTrackMatch(
  wanted: { title: string; artist: string },
  signal?: AbortSignal
): Promise<MatchResult> {
  const query = `${wanted.title} ${wanted.artist}`.trim()
  const fromMusicdex = await musicdexSearch(query, signal).catch(
    () => [] as Track[]
  )
  signal?.throwIfAborted()
  const first = rankTracks(wanted, fromMusicdex)
  if (first[0]?.score >= AUTO_MATCH_SCORE)
    return { match: first[0].track, candidates: [] }
  const fromItunes = await itunesSearch(query, "ja_jp", "JP", 5, signal)
    .then((results) => results.map((result) => itunesTrack(result)))
    .catch(() => [] as Track[])
  signal?.throwIfAborted()
  const ranked = rankTracks(
    wanted,
    dedupeTracks([...fromMusicdex, ...fromItunes])
  )
  return ranked[0]?.score >= AUTO_MATCH_SCORE
    ? { match: ranked[0].track, candidates: [] }
    : {
        match: null,
        candidates: ranked
          .filter((entry) => entry.score > 0.2)
          .slice(0, 4)
          .map((entry) => entry.track),
      }
}
