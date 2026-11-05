import type { Song } from "../musicdex/types.ts"
import {
  draftFromSong,
  sameContent,
  type SongDraft,
  type SongPayload,
} from "./songs.ts"

export type SongSaveState = "saved" | "refused" | "failed" | "unknown"

export type SongSaveStop = "session" | "rateLimited" | "connection"

export interface SongSavePlan {
  videoId: string
  upserts: readonly SongPayload[]
  removals: readonly string[]
}

export interface SongSaveOutcome {
  /** One entry per song in the plan that was tried. */
  results: Record<string, SongSaveState>
  /** The list afterwards, when it could be read. */
  songs: Song[] | null
  stopped?: SongSaveStop
}

export interface SongSaveServices {
  put: (song: SongPayload, signal: AbortSignal) => Promise<unknown>
  remove: (
    target: { id: string; video_id: string },
    signal: AbortSignal
  ) => Promise<unknown>
  read: (signal: AbortSignal) => Promise<Song[]>
  /** Picks up a role change, once, without replaying the write that needed it. */
  refreshSession: () => Promise<void>
  progress: (results: Readonly<Record<string, SongSaveState>>) => void
}

const WRITE_TIMEOUT_MS = 20_000
const READ_TIMEOUT_MS = 15_000

function statusOf(error: unknown): number | undefined {
  return error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : undefined
}

/** Compares what was asked for with what the server now holds. */
export function payloadMatches(payload: SongPayload, song: Song): boolean {
  const asDraft = (from: Song | SongPayload): SongDraft =>
    draftFromSong({
      ...from,
      available_at: null,
    } as Song)
  return sameContent(asDraft(payload), asDraft(song))
}

/**
 * Writes one song at a time. Songs are independent, so one being refused doesn't
 * stop the others; anything that would affect them all does stop the run, and the
 * read at the end decides what really happened either way. Writes are never
 * replayed: song ids are chosen here, so saving again later is what's safe.
 */
export async function runSongSave(
  plan: SongSavePlan,
  services: SongSaveServices,
  signal: AbortSignal
): Promise<SongSaveOutcome> {
  const results: Record<string, SongSaveState> = {}
  let stopped: SongSaveStop | undefined
  let refreshed = false

  const attempt = async (
    id: string,
    write: (signal: AbortSignal) => Promise<unknown>
  ) => {
    try {
      // The endpoints answer with how many rows changed: 0 means not permitted.
      const changed = Number(
        await write(
          AbortSignal.any([signal, AbortSignal.timeout(WRITE_TIMEOUT_MS)])
        )
      )
      results[id] = changed > 0 ? "saved" : "refused"
    } catch (error) {
      const status = statusOf(error)
      if (status === 401) {
        results[id] = "failed"
        stopped = "session"
      } else if (status === 429) {
        results[id] = "failed"
        stopped = "rateLimited"
      } else if (status === 403) {
        results[id] = "refused"
        if (!refreshed) {
          refreshed = true
          await services.refreshSession().catch(() => {})
        }
      } else if (status !== undefined) {
        results[id] = "failed"
      } else {
        // No answer at all: it may have worked, and the others would fail too.
        results[id] = "unknown"
        stopped = "connection"
      }
    }
    services.progress({ ...results })
  }

  for (const id of plan.removals) {
    if (stopped || signal.aborted) break
    await attempt(id, (writeSignal) =>
      services.remove({ id, video_id: plan.videoId }, writeSignal)
    )
  }
  for (const song of plan.upserts) {
    if (stopped || signal.aborted) break
    await attempt(song.id, (writeSignal) => services.put(song, writeSignal))
  }

  let songs: Song[] | null = null
  try {
    songs = await services.read(AbortSignal.timeout(READ_TIMEOUT_MS))
  } catch {
    // Keep what the responses said.
  }
  if (songs) {
    const byId = new Map(songs.map((song) => [song.id, song]))
    for (const id of plan.removals) {
      if (!byId.has(id)) results[id] = "saved"
      else if (results[id] === "saved") results[id] = "unknown"
    }
    for (const payload of plan.upserts) {
      const stored = byId.get(payload.id)
      if (stored && payloadMatches(payload, stored))
        results[payload.id] = "saved"
      else if (results[payload.id] === "saved") results[payload.id] = "unknown"
    }
  }
  return { results, songs, ...(stopped ? { stopped } : {}) }
}
