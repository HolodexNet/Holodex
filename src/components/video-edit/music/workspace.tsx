import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { getT, useT } from "@/lib/i18n"
import { can, canEditSong } from "@/lib/permissions"
import type { Video } from "@/lib/types"
import type { PlayerClock } from "@/lib/video-edit/player-clock"
import { editableParts } from "@/lib/video-edit/routes"
import {
  buildHints,
  makeSource,
  rankSources,
  type SetlistEntry,
  type SetlistSource,
  type SongHint,
} from "@/lib/video-edit/setlist"
import {
  shortcutFromEvent,
  type SongShortcut,
} from "@/lib/video-edit/shortcuts"
import {
  DEFAULT_SONG_SECONDS,
  draftFieldsFromEntry,
  mergeSongs,
  MIN_SONG_SECONDS,
  songCovers,
  trackPatch,
  type SongDraft,
  type SongRow,
  type Track,
} from "@/lib/video-edit/songs"
import { findTrackMatch, type MatchResult } from "@/lib/video-edit/track-search"
import { useAuth } from "@/stores/auth"
import {
  useSongEditor,
  useSongRows,
  type SaveSummary,
} from "@/stores/song-editor"

export type SongEdge = "start" | "end"

interface SongWorkspace {
  video: Video
  clock: PlayerClock
  /** Seconds; 0 until the video or player knows. */
  duration: number
  rows: SongRow[]
  /** Songs that aren't marked for removal, in time order. */
  songs: SongDraft[]
  selected: SongDraft | null
  sources: SetlistSource[]
  hints: SongHint[]
  canAdd: boolean
  canEdit: (song: SongDraft) => boolean
  /** Starts a new song at a moment, and selects it. */
  addAt: (time: number, fields?: Partial<SongDraft>) => string
  setEdge: (
    id: string,
    edge: SongEdge,
    time: number,
    options?: { group?: string }
  ) => void
  /** Sets the selected song's edge to the playhead; S with nothing selected starts one. */
  mark: (edge: SongEdge) => void
  /** Moves an edge and plays the result, since hearing it is the point of moving it. */
  nudge: (edge: SongEdge, delta: number, song?: SongDraft | null) => void
  hear: (edge: SongEdge, song?: SongDraft | null) => void
  /** Selects a song and takes the player to it. */
  openSong: (id: string, options?: { seek?: boolean }) => void
  step: (delta: number) => void
  removeSong: (id: string) => void
  pickTrack: (id: string, track: Track) => void
  applyHint: (id: string, hint: SongHint) => void
  addEntry: (source: SetlistSource, entry: SetlistEntry) => string | null
  addAllEntries: (source: SetlistSource) => number
  addHint: (hint: SongHint) => string
  addPastedSource: (text: string) => SetlistSource | null
  /** The next thing the comments mention that nobody has added yet. */
  nextHint: (after: number) => SongHint | null
  save: () => void
  helpOpen: boolean
  setHelpOpen: (open: boolean) => void
}

const WorkspaceContext = createContext<SongWorkspace | null>(null)

export function useSongWorkspace(): SongWorkspace {
  const workspace = use(WorkspaceContext)
  if (!workspace) throw new Error("Outside the song workspace")
  return workspace
}

/** Whole seconds only, so that a clock on screen re-renders once a second at most. */
export function usePlayheadSecond(clock: PlayerClock): number {
  return useSyncExternalStore(clock.subscribeSecond, clock.getSecond)
}

function nextStartAfter(song: SongDraft): number | undefined {
  const { server, edits, removed } = useSongEditor.getState()
  return mergeSongs(server, edits, removed).find(
    (row) => row.state !== "removed" && row.song.start > song.start
  )?.song.start
}

/**
 * Looks up imported setlist lines in the background, one at a time so as to stay
 * inside Apple's limit. Runs for as long as the editor is open, so that switching
 * approaches or tabs doesn't interrupt it.
 */
function useTrackMatcher(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    let running = false
    const run = async () => {
      if (running) return
      running = true
      try {
        for (;;) {
          const state = useSongEditor.getState()
          const next = Object.values(state.edits).find(
            (song) =>
              song.matchPending && state.matches[song.id]?.state !== "searching"
          )
          if (!next || controller.signal.aborted) return
          state.setMatch(next.id, { state: "searching", candidates: [] })
          let result: MatchResult = { match: null, candidates: [] }
          try {
            result = await findTrackMatch(
              { title: next.name, artist: next.original_artist },
              controller.signal
            )
          } catch {
            if (controller.signal.aborted) {
              useSongEditor
                .getState()
                .setMatch(next.id, { state: "done", candidates: [] })
              return
            }
          }
          const current = useSongEditor.getState()
          current.setMatch(next.id, {
            state: "done",
            candidates: result.candidates,
          })
          const latest = current.edits[next.id]
          // Someone may have typed over it or removed it in the meantime.
          if (!latest?.matchPending) continue
          current.update(
            next.id,
            result.match
              ? trackPatch(latest, result.match, nextStartAfter(latest))
              : { matchPending: false },
            { silent: true }
          )
        }
      } finally {
        running = false
      }
    }
    void run()
    const unsubscribe = useSongEditor.subscribe((state, previous) => {
      if (state.edits !== previous.edits) void run()
    })
    return () => {
      controller.abort()
      unsubscribe()
    }
  }, [enabled])
}

function toastSaveSummary(summary: SaveSummary) {
  const { t, tc } = getT()
  if (summary.stopped)
    toast.error(t(`videoEdit.songs.save.stopped.${summary.stopped}`))
  else if (summary.notSaved)
    toast.error(
      t("videoEdit.songs.save.partial", {
        saved: summary.saved,
        total: summary.saved + summary.notSaved,
      })
    )
  else if (summary.saved)
    toast.success(tc("videoEdit.songs.save.done", summary.saved))
  if (summary.blocked)
    toast.warning(tc("videoEdit.songs.save.blocked", summary.blocked))
}

export function SongWorkspaceProvider({
  video,
  clock,
  children,
}: {
  video: Video
  clock: PlayerClock
  children: ReactNode
}) {
  const { tc, t } = useT()
  const user = useAuth((state) => state.user)
  const userId = user ? String(user.id) : null
  const rows = useSongRows()
  const selectedId = useSongEditor((state) => state.selectedId)
  const restored = useSongEditor((state) => state.restored)
  const status = useSyncExternalStore(clock.subscribeStatus, clock.getStatus)
  const [pasted, setPasted] = useState<SetlistSource[]>([])
  const [helpOpen, setHelpOpen] = useState(false)
  const enabled = editableParts(video).songs
  const duration = video.duration || status.duration || 0
  const videoId = video.id
  const channelId = video.channel.id

  // By id alone: the video object is replaced whenever a cached copy is patched.
  useEffect(() => {
    if (!enabled) return
    useSongEditor.getState().open(videoId, channelId, userId)
    return () => useSongEditor.getState().close()
  }, [enabled, videoId, channelId, userId])

  useTrackMatcher(enabled && !!user)

  useEffect(() => {
    if (!restored) return
    useSongEditor.setState({ restored: 0 })
    toast(tc("videoEdit.songs.restored", restored), {
      action: {
        label: t("videoEdit.songs.discard"),
        onClick: () => useSongEditor.getState().discardAll(),
      },
    })
  }, [restored, t, tc])

  const dirty = rows.some((row) => row.state !== "saved")
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const sources = useMemo(() => {
    const ranked = rankSources(
      video.comments ?? [],
      video.description,
      video.duration || undefined
    )
    return [...pasted, ...ranked]
  }, [video.comments, video.description, video.duration, pasted])
  const hints = useMemo(
    () =>
      buildHints(video.comments ?? [], sources, video.duration || undefined),
    [video.comments, video.duration, sources]
  )
  const songs = useMemo(
    () => rows.filter((row) => row.state !== "removed").map((row) => row.song),
    [rows]
  )
  const selected = rows.find((row) => row.song.id === selectedId)?.song ?? null
  const canAdd = can(user, "song.add")
  const canEdit = (song: SongDraft) => canEditSong(user, song)
  const store = () => useSongEditor.getState()

  const addAt = (time: number, fields?: Partial<SongDraft>) => {
    const start = Math.max(0, Math.floor(time))
    const next = songs.find((song) => song.start > start)?.start
    const end =
      next !== undefined && next - start >= MIN_SONG_SECONDS
        ? Math.min(start + DEFAULT_SONG_SECONDS, next - 1)
        : start + DEFAULT_SONG_SECONDS
    return store().add({
      name: "",
      original_artist: "",
      start,
      end,
      endSource: "estimate",
      itunesid: null,
      art: null,
      amUrl: null,
      ...fields,
    })
  }

  const setEdge: SongWorkspace["setEdge"] = (id, edge, time, options) => {
    const song = rows.find((row) => row.song.id === id)?.song
    if (!song) return
    const value = Math.max(0, Math.round(time))
    if (edge === "end") {
      store().update(id, { end: value, endSource: "user" }, options)
      return
    }
    // A guessed end moves with the start; one somebody set stays where it is.
    const guessed = song.endSource === "estimate" || song.endSource === "track"
    store().update(
      id,
      {
        start: value,
        ...(guessed || value >= song.end
          ? { end: value + Math.max(song.end - song.start, MIN_SONG_SECONDS) }
          : {}),
      },
      options
    )
  }

  const hear: SongWorkspace["hear"] = (edge, song = selected) => {
    if (!song) return
    if (edge === "start") clock.hearFrom(song.start)
    else clock.hearUntil(song.end)
  }

  const openSong: SongWorkspace["openSong"] = (id, options) => {
    store().select(id)
    const song = rows.find((row) => row.song.id === id)?.song
    if (song && options?.seek !== false) clock.seek(song.start)
  }

  const workspace: SongWorkspace = {
    video,
    clock,
    duration,
    rows,
    songs,
    selected,
    sources,
    hints,
    canAdd,
    canEdit,
    addAt,
    setEdge,
    mark: (edge) => {
      const now = clock.now()
      if (selected && canEdit(selected)) setEdge(selected.id, edge, now)
      else if (edge === "start" && canAdd) addAt(now)
    },
    nudge: (edge, delta, song = selected) => {
      if (!song || !canEdit(song)) return
      const value = song[edge] + delta
      setEdge(song.id, edge, value, {
        group: `nudge:${edge}:${song.id}`,
      })
      if (edge === "start") clock.hearFrom(value)
      else clock.hearUntil(value, 3)
    },
    hear,
    openSong,
    step: (delta) => {
      if (!songs.length) return
      const index = songs.findIndex((song) => song.id === selectedId)
      const next =
        index < 0
          ? delta > 0
            ? 0
            : songs.length - 1
          : Math.min(Math.max(index + delta, 0), songs.length - 1)
      openSong(songs[next].id)
    },
    removeSong: (id) => {
      if (selectedId === id) {
        const index = songs.findIndex((song) => song.id === id)
        store().select(songs[index + 1]?.id ?? songs[index - 1]?.id ?? null)
      }
      store().remove(id)
    },
    pickTrack: (id, track) => {
      const song = rows.find((row) => row.song.id === id)?.song
      if (song)
        store().update(id, trackPatch(song, track, nextStartAfter(song)))
    },
    applyHint: (id, hint) => {
      store().update(id, {
        name: hint.title,
        original_artist: hint.artist,
        itunesid: null,
        art: null,
        amUrl: null,
        fromText: hint.text,
        matchPending: true,
      })
    },
    addEntry: (source, entry) => {
      const index = source.entries.indexOf(entry)
      if (index < 0) return null
      return store().add(draftFieldsFromEntry(source.entries, index, duration))
    },
    addAllEntries: (source) => {
      const fields = source.entries.flatMap((entry, index) =>
        entry.kind === "song" && !songCovers(songs, entry.start)
          ? [draftFieldsFromEntry(source.entries, index, duration)]
          : []
      )
      if (fields.length) store().addMany(fields)
      return fields.length
    },
    addHint: (hint) =>
      addAt(hint.start, {
        name: hint.title,
        original_artist: hint.artist,
        fromText: hint.text,
        matchPending: true,
        ...(hint.end !== undefined
          ? { end: hint.end, endSource: "comment" as const }
          : {}),
      }),
    addPastedSource: (text) => {
      const source = makeSource(
        `paste-${Date.now()}`,
        "paste",
        text,
        video.duration || undefined
      )
      if (!source.songCount) return null
      setPasted((list) => [source, ...list])
      return source
    },
    nextHint: (after) =>
      hints.find(
        (hint) => hint.start > after && !songCovers(songs, hint.start)
      ) ?? null,
    helpOpen,
    setHelpOpen,
    save: () => {
      void store()
        .save(video)
        .then((summary) => {
          if (summary) toastSaveSummary(summary)
        })
    },
  }

  return <WorkspaceContext value={workspace}>{children}</WorkspaceContext>
}

/** A key press should go to whatever is being typed in or is open, not to the editor. */
function belongsToField(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    !!target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="menu"], [role="listbox"]'
    )
  )
}

/**
 * The same keys in every approach. An approach can take a key over, which Capture
 * does because its S and E walk through a song rather than edit a selected one.
 */
export function useSongShortcuts(
  overrides?: Partial<Record<SongShortcut, () => void>>
) {
  const workspace = useSongWorkspace()

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const shortcut = shortcutFromEvent(event)
    if (!shortcut || event.defaultPrevented) return
    // Saving is the one thing that should work from anywhere, mid-word included.
    if (shortcut === "save") {
      event.preventDefault()
      workspace.save()
      return
    }
    if (belongsToField(event.target)) return
    // Tabbing to a button and pressing Space should press it. A button that was
    // only clicked isn't :focus-visible, and Space then means play or pause.
    if (
      (shortcut === "toggle" || shortcut === "confirm") &&
      event.target instanceof Element &&
      event.target.closest("button, a, [role='button']") &&
      event.target.matches(":focus-visible")
    )
      return

    const { clock, selected } = workspace
    const store = useSongEditor.getState()
    const actions: Record<SongShortcut, (() => void) | undefined> = {
      toggle: () => clock.toggle(),
      back5: () => clock.skip(-5),
      forward5: () => clock.skip(5),
      back1: () => clock.skip(-1),
      forward1: () => clock.skip(1),
      back10: () => clock.skip(-10),
      forward10: () => clock.skip(10),
      nextHint: () => {
        const hint = workspace.nextHint(clock.now() + 2)
        if (hint) clock.hearFrom(Math.max(0, hint.start - 3))
      },
      markStart: () => workspace.mark("start"),
      markEnd: () => workspace.mark("end"),
      hearStart: () => workspace.hear("start"),
      hearEnd: () => workspace.hear("end"),
      startEarlier: () => workspace.nudge("start", -1),
      startLater: () => workspace.nudge("start", 1),
      endEarlier: () => workspace.nudge("end", -1),
      endLater: () => workspace.nudge("end", 1),
      previous: () => workspace.step(-1),
      next: () => workspace.step(1),
      confirm: undefined,
      cancel: () => store.select(null),
      remove: () => {
        if (selected && workspace.canEdit(selected))
          workspace.removeSong(selected.id)
      },
      search: () =>
        document
          .querySelector<HTMLInputElement>("[data-song-name-field]")
          ?.focus(),
      undo: () => store.undo(),
      redo: () => store.redo(),
      save: undefined,
      help: () => workspace.setHelpOpen(true),
    }
    const action = overrides?.[shortcut] ?? actions[shortcut]
    if (!action) return
    event.preventDefault()
    action()
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event)
    document.addEventListener("keydown", listener)
    return () => document.removeEventListener("keydown", listener)
  }, [])
}
