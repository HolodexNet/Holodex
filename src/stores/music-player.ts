import { create } from "zustand"
import type { Song } from "@/lib/musicdex/types"

export type MusicSource = { id: string; title: string; type?: string }
type RepeatMode = "none" | "all" | "one"

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

interface MusicPlayerState {
  current: Song | null
  queue: Song[]
  queuedCount: number
  history: Song[]
  playlist: Song[]
  source?: MusicSource
  radio: boolean
  playing: boolean
  shuffle: boolean
  repeat: RepeatMode
  volume: number
  expanded: boolean
  playbackId: number
  playSongs: (
    songs: Song[],
    options?: {
      index?: number
      shuffle?: boolean
      source?: MusicSource
      radio?: boolean
    }
  ) => void
  queueSongs: (songs: Song[]) => void
  addToQueue: (songs: Song[]) => void
  appendRadioSongs: (songs: Song[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  next: (automatic?: boolean) => void
  previous: () => void
  restart: () => void
  pause: () => void
  play: () => void
  toggle: () => void
  setPlaying: (playing: boolean) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  setVolume: (volume: number) => void
  setExpanded: (expanded: boolean) => void
  close: () => void
}

const valid = (songs: Song[]) =>
  songs.filter((song) => song?.id && song.video_id)

export const useMusicPlayer = create<MusicPlayerState>((set, get) => ({
  current: null,
  queue: [],
  queuedCount: 0,
  history: [],
  playlist: [],
  radio: false,
  playing: false,
  shuffle: false,
  repeat: "none",
  volume: 80,
  expanded: false,
  playbackId: 0,
  playSongs: (songs, options) => {
    const list = valid(songs)
    if (!list.length) return
    const index = Math.max(0, Math.min(options?.index ?? 0, list.length - 1))
    const current = list[index]
    const shuffle = options?.shuffle ?? false
    const remaining = [...list.slice(index + 1), ...list.slice(0, index)]
    set((state) => ({
      current,
      queue: shuffle ? shuffled(remaining) : list.slice(index + 1),
      playlist: list,
      history: [],
      queuedCount: 0,
      shuffle,
      source: options?.source,
      radio: options?.radio ?? false,
      playing: true,
      playbackId: state.playbackId + 1,
    }))
  },
  queueSongs: (songs) => {
    const list = valid(songs)
    if (!list.length) return
    set((state) =>
      state.current
        ? {
            queue: [
              ...state.queue.slice(0, state.queuedCount),
              ...list,
              ...state.queue.slice(state.queuedCount),
            ],
            queuedCount: state.queuedCount + list.length,
          }
        : {
            current: list[0],
            queue: list.slice(1),
            playlist: list,
            playing: true,
            playbackId: state.playbackId + 1,
          }
    )
  },
  addToQueue: (songs) => get().queueSongs(songs),
  appendRadioSongs: (songs) =>
    set((state) => ({ queue: [...state.queue, ...valid(songs)] })),
  removeFromQueue: (index) =>
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
      queuedCount:
        index < state.queuedCount ? state.queuedCount - 1 : state.queuedCount,
    })),
  clearQueue: () => set({ queue: [], queuedCount: 0 }),
  next: (automatic = false) =>
    set((state) => {
      if (!state.current) return state
      if (automatic && state.repeat === "one")
        return { playbackId: state.playbackId + 1, playing: true }
      let queue = state.queue
      if (!queue.length && state.repeat === "all" && !state.radio) {
        queue = state.shuffle ? shuffled(state.playlist) : state.playlist
      }
      if (!queue.length) return { playing: false }
      return {
        current: queue[0],
        queue: queue.slice(1),
        queuedCount: Math.max(0, state.queuedCount - 1),
        history: [...state.history, state.current].slice(-100),
        playing: true,
        playbackId: state.playbackId + 1,
      }
    }),
  previous: () =>
    set((state) => {
      if (!state.history.length || !state.current)
        return { playbackId: state.playbackId + 1, playing: true }
      return {
        current: state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
        queue: [state.current, ...state.queue],
        queuedCount: state.queuedCount + 1,
        playing: true,
        playbackId: state.playbackId + 1,
      }
    }),
  restart: () =>
    set((state) => ({ playbackId: state.playbackId + 1, playing: true })),
  pause: () => set({ playing: false }),
  play: () => set({ playing: true }),
  toggle: () => set((state) => ({ playing: !state.playing })),
  setPlaying: (playing) => set({ playing }),
  toggleShuffle: () =>
    set((state) => {
      const priority = state.queue.slice(0, state.queuedCount)
      const upcoming = state.queue.slice(state.queuedCount)
      if (!state.shuffle)
        return { shuffle: true, queue: [...priority, ...shuffled(upcoming)] }
      const start = state.playlist.findIndex(
        (song) => song.id === state.current?.id
      )
      const order = [
        ...state.playlist.slice(start + 1),
        ...state.playlist.slice(0, start + 1),
      ]
      const rank = new Map(order.map((song, index) => [song.id, index]))
      return {
        shuffle: false,
        queue: [
          ...priority,
          ...upcoming.sort(
            (a, b) =>
              (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity)
          ),
        ],
      }
    }),
  toggleRepeat: () =>
    set((state) => ({
      repeat:
        state.repeat === "none"
          ? "all"
          : state.repeat === "all"
            ? "one"
            : "none",
    })),
  setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),
  setExpanded: (expanded) => set({ expanded }),
  close: () =>
    set({
      current: null,
      playing: false,
      queue: [],
      queuedCount: 0,
      history: [],
      playlist: [],
      source: undefined,
      radio: false,
      expanded: false,
    }),
}))
