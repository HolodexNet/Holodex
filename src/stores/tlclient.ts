import { create } from "zustand"
import { persist } from "zustand/middleware"

import { MAX_SPEAKERS, speakerPrefix, type Speaker } from "@/lib/tlclient/lines"
import { syncAcrossTabs } from "./sync"

export interface RecentSession {
  main: string
  collabs: string[]
  lang: string
  label: string
  at: number
}

export interface TlClientSettings {
  /** Slots 1..n of the speaker strip; slot 0, "no speaker", is implicit. */
  speakers: Speaker[]
  /** The selected speaker's id, or null for none. */
  activeSpeaker: string | null
  /** The tag added in front of chat copies; null follows the language. */
  chatTag: string | null
  /** Time a line from its first keystroke rather than from sending it. */
  stampOnType: boolean
  /** Tab and Shift+Tab switch speakers instead of moving focus. */
  tabCyclesSpeakers: boolean
  showPlayer: boolean
  showChat: boolean
  /** Share of the workspace width given to chats, in percent. */
  chatWidth: number
  /** Share of the left column given to the player, in percent. */
  playerHeight: number
  recent: RecentSession[]
}

interface TlClientStore extends TlClientSettings {
  set: <K extends keyof TlClientSettings>(
    key: K,
    value: TlClientSettings[K]
  ) => void
  addSpeaker: (name: string) => Speaker
  updateSpeaker: (id: string, patch: Partial<Omit<Speaker, "id">>) => void
  removeSpeaker: (id: string) => void
  moveSpeaker: (id: string, direction: -1 | 1) => void
  replaceSpeakers: (names: string[]) => void
  rememberSession: (session: Omit<RecentSession, "at">) => void
}

const MAX_RECENT = 6

const newId = () => Math.random().toString(36).slice(2, 10)

const makeSpeaker = (name: string): Speaker => ({
  id: newId(),
  name: name.trim(),
  prefix: speakerPrefix(name),
  suffix: "",
})

interface LegacyProfile {
  Name?: string
  Prefix?: string
  Suffix?: string
}

/**
 * The old client kept "profiles" under `tldex-profiles`; the first was a
 * default that usually had no prefix at all. They carry over as speakers.
 */
function legacySpeakers(): Speaker[] {
  try {
    const raw = localStorage.getItem("tldex-profiles")
    if (!raw) return []
    const profiles = JSON.parse(raw) as LegacyProfile[]
    if (!Array.isArray(profiles)) return []
    return profiles
      .filter(
        (profile, index) =>
          index > 0 || profile.Prefix?.trim() || profile.Suffix?.trim()
      )
      .slice(0, MAX_SPEAKERS)
      .map((profile) => ({
        id: newId(),
        name: profile.Name?.trim() || "Speaker",
        prefix: profile.Prefix ?? "",
        suffix: profile.Suffix ?? "",
      }))
  } catch {
    return []
  }
}

function defaults(): TlClientSettings {
  return {
    speakers: legacySpeakers(),
    activeSpeaker: null,
    chatTag: null,
    stampOnType: true,
    tabCyclesSpeakers: true,
    showPlayer: true,
    showChat: true,
    chatWidth: 32,
    playerHeight: 50,
    recent: [],
  }
}

export const useTlClient = create<TlClientStore>()(
  persist(
    (set, get) => ({
      ...defaults(),
      set: (key, value) =>
        set({ [key]: value } as Pick<TlClientSettings, typeof key>),
      addSpeaker: (name) => {
        const speaker = makeSpeaker(name)
        set((state) => ({
          speakers: [...state.speakers, speaker].slice(0, MAX_SPEAKERS),
        }))
        return speaker
      },
      updateSpeaker: (id, patch) =>
        set((state) => ({
          speakers: state.speakers.map((speaker) => {
            if (speaker.id !== id) return speaker
            const next = { ...speaker, ...patch }
            // A prefix that was only ever the name follows a rename.
            if (
              patch.name !== undefined &&
              patch.prefix === undefined &&
              speaker.prefix === speakerPrefix(speaker.name)
            ) {
              next.prefix = speakerPrefix(patch.name)
            }
            return next
          }),
        })),
      removeSpeaker: (id) =>
        set((state) => ({
          speakers: state.speakers.filter((speaker) => speaker.id !== id),
          activeSpeaker:
            state.activeSpeaker === id ? null : state.activeSpeaker,
        })),
      moveSpeaker: (id, direction) =>
        set((state) => {
          const index = state.speakers.findIndex((s) => s.id === id)
          const target = index + direction
          if (index < 0 || target < 0 || target >= state.speakers.length)
            return state
          const speakers = [...state.speakers]
          ;[speakers[index], speakers[target]] = [
            speakers[target],
            speakers[index],
          ]
          return { speakers }
        }),
      replaceSpeakers: (names) =>
        set({
          speakers: names.slice(0, MAX_SPEAKERS).map(makeSpeaker),
          activeSpeaker: null,
        }),
      rememberSession: (session) => {
        const recent = get().recent.filter(
          (entry) => entry.main !== session.main
        )
        set({
          recent: [{ ...session, at: Date.now() }, ...recent].slice(
            0,
            MAX_RECENT
          ),
        })
      },
    }),
    { name: "holodex-v3/tlclient", version: 1 }
  )
)

syncAcrossTabs(useTlClient)
