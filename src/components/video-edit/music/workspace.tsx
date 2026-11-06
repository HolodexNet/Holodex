import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { getT, useT } from "@/lib/i18n"
import { can, canEditSong } from "@/lib/permissions"
import type { Video } from "@/lib/types"
import type { PlayerClock } from "@/lib/video-edit/player-clock"
import type { TimeCommit } from "@/lib/video-edit/field"
import { editableParts } from "@/lib/video-edit/routes"
import {
  buildHints,
  makeSource,
  rankSources,
  type PastedSong,
  type SetlistEntry,
  type SetlistSource,
  type SongHint,
} from "@/lib/video-edit/setlist"
import {
  shortcutFromEvent,
  shortcutRepeats,
  type SongShortcut,
} from "@/lib/video-edit/shortcuts"
import {
  blocksSaving,
  DEFAULT_SONG_SECONDS,
  draftFieldsFromEntry,
  hasTrack,
  mergeSongs,
  MIN_SONG_SECONDS,
  NO_TRACK,
  renamePatch,
  songCovers,
  songIssues,
  tidyText,
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

/** Moving an edge plays the result, but not again for every step of a held key. */
const HEAR_SETTLE_MS = 320

/** Fresh from the store, for what runs after the render that set it up has passed. */
function liveSong(id: string): SongDraft | null {
  const { edits, server } = useSongEditor.getState()
  return edits[id] ?? server.find((song) => song.id === id) ?? null
}

function liveSongs(): SongDraft[] {
  const { server, edits, removed } = useSongEditor.getState()
  return mergeSongs(server, edits, removed)
    .filter((row) => row.state !== "removed")
    .map((row) => row.song)
}

/** Moves the keyboard to a field of the open song, ready to be typed over. */
export function focusSongField(field: "name" | "end") {
  requestAnimationFrame(() => {
    const input = document.querySelector<HTMLInputElement>(
      `[data-song-${field}-field]`
    )
    input?.focus()
    input?.select()
  })
}

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
  /** Sets an edge from a time field or button, playing the result if that's asked for. */
  commitEdge: (
    id: string,
    edge: SongEdge,
    seconds: number,
    how: TimeCommit
  ) => void
  hear: (edge: SongEdge, song?: SongDraft | null) => void
  /** Selects a song and takes the player to it. */
  openSong: (id: string, options?: { seek?: boolean }) => void
  step: (delta: number) => void
  removeSong: (id: string) => void
  /** A new name typed in, which may or may not still go with the song's track. */
  rename: (id: string, name: string) => void
  /** Leaving a text field: tidies what's there, and looks up what was typed. */
  settleText: (id: string, field: "name" | "artist", edited: boolean) => void
  swapNameArtist: (id: string) => void
  unlinkTrack: (id: string) => void
  applyPaste: (id: string, text: string, pasted: PastedSong) => void
  pickTrack: (id: string, track: Track) => void
  applyHint: (id: string, hint: SongHint) => void
  addEntry: (source: SetlistSource, entry: SetlistEntry) => string | null
  addAllEntries: (source: SetlistSource) => number
  addHint: (hint: SongHint) => string
  addPastedSource: (text: string) => SetlistSource | null
  /** The next thing the comments mention that nobody has added yet. */
  nextHint: (after: number) => SongHint | null
  save: () => void
  /** Opens the first song that can't be saved, at the field that's holding it up. */
  jumpToProblem: () => void
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
 * tabs doesn't interrupt it.
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
          // Someone may have typed over it or removed it in the meantime. If they've
          // settled on another name since, it's still pending and comes round again.
          if (
            !latest?.matchPending ||
            latest.name !== next.name ||
            latest.original_artist !== next.original_artist
          )
            continue
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

function toastSaveSummary(summary: SaveSummary, jumpToProblem: () => void) {
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
    toast.warning(tc("videoEdit.songs.save.blocked", summary.blocked), {
      action: { label: t("videoEdit.songs.save.show"), onClick: jumpToProblem },
    })
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
  // The player has the last word: a listing can lag behind what's really there.
  const duration = Math.max(video.duration || 0, status.duration || 0)
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
    const guess =
      next !== undefined && next - start >= MIN_SONG_SECONDS
        ? Math.min(start + DEFAULT_SONG_SECONDS, next - 1)
        : start + DEFAULT_SONG_SECONDS
    const end = duration ? Math.min(guess, duration) : guess
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
    // A held button or key calls this many times over from the same render.
    const song = liveSong(id)
    if (!song) return
    const value = Math.max(
      0,
      Math.round(duration ? Math.min(time, duration) : time)
    )
    if (value === song[edge]) return
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

  // The first step answers straight away. While more keep coming nothing plays, as
  // seeking on every one of them is slow and sounds terrible, and then the last plays.
  const settling = useRef<{
    timer: ReturnType<typeof setTimeout>
    again?: () => void
  } | null>(null)
  useEffect(
    () => () => {
      if (settling.current) clearTimeout(settling.current.timer)
    },
    []
  )
  const hearMoved = (id: string, edge: SongEdge) => {
    const play = () => {
      const song = liveSong(id)
      if (!song) return
      if (edge === "start") clock.hearFrom(song.start)
      else clock.hearUntil(song.end, 3)
    }
    const pending = settling.current
    if (pending) clearTimeout(pending.timer)
    else play()
    settling.current = {
      again: pending ? play : undefined,
      timer: setTimeout(() => {
        const again = settling.current?.again
        settling.current = null
        again?.()
      }, HEAR_SETTLE_MS),
    }
  }

  const openSong: SongWorkspace["openSong"] = (id, options) => {
    store().select(id)
    const song = liveSong(id)
    if (song && options?.seek !== false) clock.seek(song.start)
  }

  const jumpToProblem = () => {
    const list = liveSongs()
    const broken = list.find((song) =>
      songIssues(song, list, duration).some(blocksSaving)
    )
    if (!broken) return
    openSong(broken.id)
    focusSongField(
      songIssues(broken, list, duration).includes("name") ? "name" : "end"
    )
  }

  const addAllEntries = (source: SetlistSource) => {
    // Can be called from a toast, some time after the list on screen was drawn.
    const current = liveSongs()
    const fields = source.entries.flatMap((entry, index) =>
      entry.kind === "song" && !songCovers(current, entry.start)
        ? [draftFieldsFromEntry(source.entries, index, duration)]
        : []
    )
    if (fields.length) store().addMany(fields)
    return fields.length
  }

  const addPastedSource = (text: string) => {
    const source = makeSource(
      `paste-${Date.now()}`,
      "paste",
      text,
      video.duration || undefined
    )
    if (!source.songCount) return null
    setPasted((list) => [source, ...list])
    return source
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
      const live = liveSong(song.id)
      if (!live) return
      setEdge(song.id, edge, live[edge] + delta, {
        group: `nudge:${edge}:${song.id}`,
      })
      hearMoved(song.id, edge)
    },
    commitEdge: (id, edge, seconds, how) => {
      setEdge(
        id,
        edge,
        seconds,
        how === "step" ? { group: `nudge:${edge}:${id}` } : undefined
      )
      if (how === "step") hearMoved(id, edge)
      else if (how === "enter") hear(edge, liveSong(id))
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
      const song = liveSong(id)
      const unsaved = !store().server.some((other) => other.id === id)
      store().remove(id)
      // A saved song stays listed until the save, and can be kept from there. A new
      // one just vanishes, so this is the only way back that doesn't undo other work.
      if (song && unsaved && song.name.trim())
        toast(t("videoEdit.songs.removedOne", { name: song.name.trim() }), {
          action: {
            label: t("videoEdit.undo"),
            onClick: () => store().reinstate(song),
          },
        })
    },
    rename: (id, name) => {
      const song = liveSong(id)
      if (!song) return
      store().update(id, renamePatch(song, name), { group: `name:${id}` })
      // What was offered for the old name says nothing about the new one.
      if (store().matches[id]?.candidates.length)
        store().setMatch(id, { state: "done", candidates: [] })
    },
    settleText: (id, field, edited) => {
      const song = liveSong(id)
      if (!song) return
      const key = field === "name" ? "name" : "original_artist"
      const tidied = tidyText(song[key])
      const name = field === "name" ? tidied : tidyText(song.name)
      const artist = field === "name" ? tidyText(song.original_artist) : tidied
      const patch: Partial<SongDraft> = {}
      if (tidied !== song[key]) patch[key] = tidied
      // Typed and never taken from the list, it gets the same lookup as a comment
      // would, and the same way back to what was written if the match is wrong.
      // Fixing the artist of a song whose match was turned down shouldn't bring that
      // same match back. A new name is a new question, though.
      if (
        edited &&
        name &&
        !hasTrack(song) &&
        (field === "name" || !song.matchDeclined)
      ) {
        patch.matchPending = true
        patch.matchDeclined = false
        patch.fromText = artist ? `${name} / ${artist}` : name
      }
      if (Object.keys(patch).length) store().update(id, patch, { silent: true })
    },
    swapNameArtist: (id) => {
      const song = liveSong(id)
      if (!song) return
      store().update(id, {
        ...NO_TRACK,
        name: song.original_artist,
        original_artist: song.name,
        fromText: undefined,
        // The right way round may well be something that can be found now.
        matchPending: !!(song.name.trim() && song.original_artist.trim()),
      })
    },
    unlinkTrack: (id) => {
      store().update(id, {
        ...NO_TRACK,
        matchPending: false,
        matchDeclined: true,
      })
      store().setMatch(id, { state: "done", candidates: [] })
    },
    applyPaste: (id, text, pasted) => {
      if (pasted.kind === "many") {
        const source = addPastedSource(text)
        if (source)
          toast(tc("videoEdit.setlist.pasteFound", source.songCount), {
            action: {
              label: tc("videoEdit.songs.addAll", source.songCount),
              onClick: () => {
                const added = addAllEntries(source)
                if (added) toast.success(tc("videoEdit.songs.addedMany", added))
              },
            },
          })
        return
      }
      const song = liveSong(id)
      if (!song || pasted.kind !== "one") return
      // One paste, however many fields it fills, is one thing to undo.
      const group = { group: `paste:${id}` }
      store().update(
        id,
        {
          ...renamePatch(song, pasted.title),
          ...(pasted.artist ? { original_artist: pasted.artist } : {}),
        },
        group
      )
      if (pasted.start !== undefined) setEdge(id, "start", pasted.start, group)
      if (pasted.end !== undefined) setEdge(id, "end", pasted.end, group)
    },
    pickTrack: (id, track) => {
      const song = liveSong(id)
      if (song)
        store().update(id, trackPatch(song, track, nextStartAfter(song)))
    },
    applyHint: (id, hint) => {
      store().update(id, {
        ...NO_TRACK,
        name: hint.title,
        original_artist: hint.artist,
        fromText: hint.text,
        matchPending: true,
      })
    },
    addEntry: (source, entry) => {
      const index = source.entries.indexOf(entry)
      if (index < 0) return null
      return store().add(draftFieldsFromEntry(source.entries, index, duration))
    },
    addAllEntries,
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
    addPastedSource,
    nextHint: (after) =>
      hints.find(
        (hint) => hint.start > after && !songCovers(songs, hint.start)
      ) ?? null,
    helpOpen,
    setHelpOpen,
    jumpToProblem,
    save: () => {
      void store()
        .save(video)
        .then((summary) => {
          if (!summary) return
          toastSaveSummary(summary, jumpToProblem)
          // Nothing else went through, so the problem is the only thing to do next.
          if (summary.blocked && !summary.saved && !summary.notSaved)
            jumpToProblem()
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

/** The song editor's keys. A view can take a key over, as Setlist does Enter. */
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
      if (!event.repeat) workspace.save()
      return
    }
    if (belongsToField(event.target)) return
    if (event.repeat && !shortcutRepeats(shortcut)) {
      event.preventDefault()
      return
    }
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
      search: () => {
        // With no song open there's nothing to name yet, so start one here.
        if (
          !document.querySelector("[data-song-name-field]") &&
          workspace.canAdd
        )
          workspace.addAt(clock.now())
        focusSongField("name")
      },
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
