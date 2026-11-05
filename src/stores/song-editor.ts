import { useMemo } from "react"
import { create } from "zustand"

import { api } from "@/lib/api"
import { reconcileVideoEdits } from "@/lib/curation-cache"
import { musicApi } from "@/lib/musicdex/api"
import { canEditSong } from "@/lib/permissions"
import type { Video } from "@/lib/types"
import {
  runSongSave,
  type SongSaveState,
  type SongSaveStop,
} from "@/lib/video-edit/save-songs"
import {
  blocksSaving,
  draftFromSong,
  mergeSongs,
  sameContent,
  songIssues,
  songPayload,
  type SongDraft,
  type Track,
} from "@/lib/video-edit/songs"
import { useAuth } from "@/stores/auth"

/**
 * One video's songs while they're being edited. Nothing reaches the server until
 * Save, and until then the work is kept on this device: a singing stream takes a
 * while to go through, and neither a reload nor a crash should cost anyone that.
 */

const DRAFTS_KEY = "holodex-v3/song-drafts"
const DRAFT_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000
const HISTORY_LIMIT = 100
/** Nudges in a row are one thing to undo, not one per key press. */
const GROUP_WINDOW_MS = 1500

interface Snapshot {
  edits: Record<string, SongDraft>
  removed: Record<string, true>
}

export interface MatchInfo {
  state: "searching" | "done"
  candidates: Track[]
}

export interface SaveSummary {
  saved: number
  notSaved: number
  /** Songs left out because something must be fixed first. */
  blocked: number
  stopped?: SongSaveStop
}

interface SongEditorState extends Snapshot {
  scope: string | null
  videoId: string | null
  channelId: string | null
  server: SongDraft[]
  load: "loading" | "ready" | "error"
  selectedId: string | null
  past: Snapshot[]
  future: Snapshot[]
  lastGroup: { key: string; at: number } | null
  saving: boolean
  saveResults: Record<string, SongSaveState>
  /** How many unsaved changes were picked up from an earlier visit. */
  restored: number
  matches: Record<string, MatchInfo>

  open: (videoId: string, channelId: string, userId: string | null) => void
  close: () => void
  reload: () => Promise<void>
  select: (id: string | null) => void
  /** Adds a song and returns its id. Ids are made here so that saves can repeat safely. */
  add: (fields: Omit<SongDraft, "id">, options?: { select?: boolean }) => string
  addMany: (list: Omit<SongDraft, "id">[]) => string[]
  update: (
    id: string,
    patch: Partial<SongDraft>,
    options?: { group?: string; silent?: boolean }
  ) => void
  remove: (id: string) => void
  restore: (id: string) => void
  undo: () => void
  redo: () => void
  discardAll: () => void
  setMatch: (id: string, info: MatchInfo) => void
  save: (video: Video) => Promise<SaveSummary | null>
}

interface StoredDrafts extends Snapshot {
  at: number
}

function readAllDrafts(): Record<string, StoredDrafts> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, StoredDrafts>) : {}
  } catch {
    return {}
  }
}

function writeDrafts(scope: string, snapshot: Snapshot) {
  try {
    const all = readAllDrafts()
    const now = Date.now()
    for (const key of Object.keys(all))
      if (now - all[key].at > DRAFT_LIFETIME_MS) delete all[key]
    if (
      Object.keys(snapshot.edits).length ||
      Object.keys(snapshot.removed).length
    )
      all[scope] = { ...snapshot, at: now }
    else delete all[scope]
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(all))
  } catch {
    // Out of space or blocked: the editor still works, just without the safety net.
  }
}

function forgetSaved(
  scope: string,
  planned: ReadonlyMap<string, SongDraft>,
  entries: readonly [string, SongSaveState][]
) {
  const stored = readAllDrafts()[scope]
  if (!stored) return
  const edits = { ...stored.edits }
  const removed = { ...stored.removed }
  for (const [id, result] of entries) {
    if (result !== "saved") continue
    delete removed[id]
    const sent = planned.get(id)
    if (edits[id] && (!sent || sameContent(edits[id], sent))) delete edits[id]
  }
  writeDrafts(scope, { edits, removed })
}

let loadController: AbortController | null = null
let writeTimer: ReturnType<typeof setTimeout> | undefined

const EMPTY = {
  edits: {},
  removed: {},
  server: [],
  selectedId: null,
  past: [],
  future: [],
  lastGroup: null,
  saving: false,
  saveResults: {},
  restored: 0,
  matches: {},
} satisfies Partial<SongEditorState>

function withHistory(
  state: SongEditorState,
  next: Snapshot,
  group?: string
): Partial<SongEditorState> {
  const now = Date.now()
  const continues =
    !!group &&
    state.lastGroup?.key === group &&
    now - state.lastGroup.at < GROUP_WINDOW_MS
  return {
    ...next,
    past: continues
      ? state.past
      : [
          ...state.past.slice(-HISTORY_LIMIT + 1),
          { edits: state.edits, removed: state.removed },
        ],
    future: [],
    lastGroup: group ? { key: group, at: now } : null,
  }
}

function omit<Value>(record: Record<string, Value>, id: string) {
  const next = { ...record }
  delete next[id]
  return next
}

export const useSongEditor = create<SongEditorState>((set, get) => ({
  ...EMPTY,
  scope: null,
  videoId: null,
  channelId: null,
  load: "loading",

  open: (videoId, channelId, userId) => {
    const scope = `${userId ?? "guest"}:${videoId}`
    if (get().scope === scope) return
    const stored = readAllDrafts()[scope]
    set({
      ...EMPTY,
      scope,
      videoId,
      channelId,
      load: "loading",
      edits: stored?.edits ?? {},
      removed: stored?.removed ?? {},
      restored: stored
        ? Object.keys(stored.edits).length + Object.keys(stored.removed).length
        : 0,
    })
    void get().reload()
  },

  close: () => {
    loadController?.abort()
    const { scope, edits, removed } = get()
    // A timer may still be waiting to write this, and leaving is no time to lose it.
    clearTimeout(writeTimer)
    if (scope) writeDrafts(scope, { edits, removed })
    set({
      ...EMPTY,
      scope: null,
      videoId: null,
      channelId: null,
      load: "loading",
    })
  },

  reload: async () => {
    const { videoId, channelId } = get()
    if (!videoId || !channelId) return
    loadController?.abort()
    const controller = new AbortController()
    loadController = controller
    set({ load: "loading" })
    try {
      const songs = await musicApi.videoSongs(
        channelId,
        videoId,
        controller.signal
      )
      if (controller.signal.aborted) return
      set({ server: songs.map(draftFromSong), load: "ready" })
    } catch {
      if (!controller.signal.aborted) set({ load: "error" })
    }
  },

  select: (id) => {
    if (get().selectedId !== id) set({ selectedId: id })
  },

  add: (fields, options) => {
    const id = crypto.randomUUID()
    set((state) => ({
      ...withHistory(state, {
        edits: {
          ...state.edits,
          [id]: {
            creator_id: useAuth.getState().user?.id ?? null,
            ...fields,
            id,
          },
        },
        removed: state.removed,
      }),
      ...(options?.select === false ? {} : { selectedId: id }),
    }))
    return id
  },

  addMany: (list) => {
    const creator = useAuth.getState().user?.id ?? null
    const drafts = list.map((fields) => ({
      creator_id: creator,
      ...fields,
      id: crypto.randomUUID(),
    }))
    set((state) =>
      withHistory(state, {
        edits: {
          ...state.edits,
          ...Object.fromEntries(drafts.map((draft) => [draft.id, draft])),
        },
        removed: state.removed,
      })
    )
    return drafts.map((draft) => draft.id)
  },

  update: (id, patch, options) =>
    set((state) => {
      const base = state.server.find((song) => song.id === id)
      const current = state.edits[id] ?? base
      if (!current) return state
      const next = { ...current, ...patch }
      // Putting a song back how it was means there's nothing left to save.
      const edits =
        base && sameContent(base, next)
          ? omit(state.edits, id)
          : { ...state.edits, [id]: next }
      const saveResults = omit(state.saveResults, id)
      if (options?.silent) return { edits, saveResults }
      return {
        ...withHistory(
          state,
          { edits, removed: state.removed },
          options?.group
        ),
        saveResults,
      }
    }),

  remove: (id) =>
    set((state) => {
      const onServer = state.server.some((song) => song.id === id)
      return withHistory(state, {
        edits: omit(state.edits, id),
        removed: onServer ? { ...state.removed, [id]: true } : state.removed,
      })
    }),

  restore: (id) =>
    set((state) =>
      withHistory(state, {
        edits: state.edits,
        removed: omit(state.removed, id),
      })
    ),

  undo: () =>
    set((state) => {
      const previous = state.past[state.past.length - 1]
      if (!previous) return state
      return {
        ...previous,
        past: state.past.slice(0, -1),
        future: [
          ...state.future,
          { edits: state.edits, removed: state.removed },
        ],
        lastGroup: null,
      }
    }),

  redo: () =>
    set((state) => {
      const next = state.future[state.future.length - 1]
      if (!next) return state
      return {
        ...next,
        future: state.future.slice(0, -1),
        past: [...state.past, { edits: state.edits, removed: state.removed }],
        lastGroup: null,
      }
    }),

  discardAll: () =>
    set((state) => ({
      ...withHistory(state, { edits: {}, removed: {} }),
      saveResults: {},
      restored: 0,
    })),

  setMatch: (id, info) =>
    set((state) => ({ matches: { ...state.matches, [id]: info } })),

  save: async (video) => {
    const state = get()
    const user = useAuth.getState().user
    // Until the list has loaded, there's no telling what's already there.
    if (state.saving || !user || state.load !== "ready") return null
    const rows = mergeSongs(state.server, state.edits, state.removed)
    const active = rows
      .filter((row) => row.state !== "removed")
      .map((row) => row.song)
    const duration = video.duration ?? 0
    const pending = rows.filter(
      (row) => row.state !== "saved" && canEditSong(user, row.song)
    )
    const writable = pending.filter((row) => row.state !== "removed")
    const ready = writable.filter(
      (row) => !songIssues(row.song, active, duration).some(blocksSaving)
    )
    const removals = pending
      .filter((row) => row.state === "removed")
      .map((row) => row.song.id)
    const blocked = writable.length - ready.length
    if (!ready.length && !removals.length)
      return { saved: 0, notSaved: 0, blocked }

    const planned = new Map(ready.map((row) => [row.song.id, row.song]))
    const scope = state.scope
    set({ saving: true, saveResults: {} })
    const outcome = await runSongSave(
      {
        videoId: video.id,
        upserts: ready.map((row) => songPayload(row.song, video)),
        removals,
      },
      {
        put: (song, signal) => musicApi.saveSong(song, signal),
        remove: (target, signal) => musicApi.deleteSong(target, signal),
        read: (signal) =>
          musicApi.videoSongs(video.channel.id, video.id, signal),
        refreshSession: async () => {
          const session = await api.refreshSession(AbortSignal.timeout(10_000))
          useAuth.getState().setSession(session)
        },
        progress: (results) => {
          if (get().scope === scope) set({ saveResults: { ...results } })
        },
      },
      new AbortController().signal
    )

    const entries = Object.entries(outcome.results)
    if (get().scope !== scope) {
      // They moved on to another video while this ran, so tidy its drafts instead.
      if (scope) forgetSaved(scope, planned, entries)
    } else
      set((current) => {
        const edits = { ...current.edits }
        const removed = { ...current.removed }
        const saveResults: Record<string, SongSaveState> = {}
        for (const [id, result] of entries) {
          if (result !== "saved") {
            saveResults[id] = result
            continue
          }
          delete removed[id]
          // Someone can keep working during a save, and that work isn't saved yet.
          const sent = planned.get(id)
          if (edits[id] && (!sent || sameContent(edits[id], sent)))
            delete edits[id]
        }
        return {
          edits,
          removed,
          saving: false,
          saveResults,
          server: outcome.songs
            ? outcome.songs.map(draftFromSong)
            : current.server,
          past: [],
          future: [],
          lastGroup: null,
          restored: 0,
        }
      })
    if (outcome.songs)
      reconcileVideoEdits({ [video.id]: { songCount: outcome.songs.length } })
    return {
      saved: entries.filter(([, result]) => result === "saved").length,
      notSaved: entries.filter(([, result]) => result !== "saved").length,
      blocked,
      ...(outcome.stopped ? { stopped: outcome.stopped } : {}),
    }
  },
}))

useSongEditor.subscribe((state, previous) => {
  if (
    !state.scope ||
    state.scope !== previous.scope ||
    (state.edits === previous.edits && state.removed === previous.removed)
  )
    return
  const { scope, edits, removed } = state
  clearTimeout(writeTimer)
  writeTimer = setTimeout(() => writeDrafts(scope, { edits, removed }), 300)
})

/** The list as it stands right now, removed songs included so they can be restored. */
export function useSongRows() {
  const server = useSongEditor((state) => state.server)
  const edits = useSongEditor((state) => state.edits)
  const removed = useSongEditor((state) => state.removed)
  return useMemo(
    () => mergeSongs(server, edits, removed),
    [server, edits, removed]
  )
}
