import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DEFAULT_PRIMARY, TL_LANGS, UI_LANGS } from "@/lib/consts"
import type { ChannelSummary } from "@/lib/types"
import { defined, readLegacyPrimary, readLegacyState } from "./legacy"
import { syncAcrossTabs } from "./sync"

export type ThemeMode = "light" | "dark" | "system"
export type HomeViewMode = "grid" | "list" | "denseList"
export type DefaultPage = "home" | "favorites" | "multiview"
export type GridSize = 0 | 1 | 2

export interface Settings {
  /** UI language, one of UI_LANGS[].val */
  lang: string
  /** Languages of clips shown in feeds and search. */
  clipLangs: string[]
  /** Prefer a channel's English name when it has one. */
  useEnglishName: boolean
  /** Language used for the "has translations" badge on video cards. */
  liveTlLang: string

  themeMode: ThemeMode
  primaryColor: string

  defaultOpen: DefaultPage
  /** Thumbnails open YouTube directly instead of the Holodex watch page. */
  redirectMode: boolean
  /** Load more results on scroll instead of on request. */
  scrollMode: boolean
  homeViewMode: HomeViewMode
  /** Combine simultaneous collaboration perspectives in live/upcoming feeds. */
  collateCollabs: boolean
  gridSize: GridSize

  hideThumbnail: boolean
  hidePlaceholder: boolean
  hideMissing: boolean
  hideCollabStreams: boolean
  ignoredTopics: string[]
  /** org name -> lowercased group names hidden from Home. */
  hiddenGroups: Record<string, string[]>
  blockedChannels: ChannelSummary[]
}

interface SettingsStore extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  toggleBlocked: (channel: ChannelSummary) => void
  reset: () => void
}

const ENGLISH_NAME_LANGS = new Set([
  "en",
  "es",
  "fr",
  "id",
  "pt",
  "de",
  "ru",
  "it",
])

function browserLang(): string {
  return navigator.language || "en"
}

function detectUiLang(): string {
  const lang = browserLang()
  const exact = UI_LANGS.find((l) => l.val === lang)
  if (exact) return exact.val
  const short = lang.split("-")[0].toLowerCase()
  return UI_LANGS.find((l) => l.val === short)?.val ?? "en"
}

function detectContentLang(): string {
  const short = browserLang().split("-")[0].toLowerCase()
  return TL_LANGS.some((l) => l.value === short) ? short : "en"
}

function defaults(): Settings {
  const contentLang = detectContentLang()
  return {
    lang: detectUiLang(),
    clipLangs: [contentLang],
    useEnglishName: ENGLISH_NAME_LANGS.has(contentLang),
    liveTlLang: contentLang,
    themeMode: "dark",
    primaryColor: DEFAULT_PRIMARY,
    defaultOpen: "home",
    redirectMode: false,
    scrollMode: true,
    homeViewMode: "grid",
    collateCollabs: false,
    gridSize: 0,
    hideThumbnail: false,
    hidePlaceholder: false,
    hideMissing: false,
    hideCollabStreams: false,
    ignoredTopics: [],
    hiddenGroups: {},
    blockedChannels: [],
  }
}

function fromLegacy(): Partial<Settings> {
  const legacy = readLegacyState()
  const s = legacy?.settings
  if (!s) return {}
  const gridSize = legacy?.currentGridSize
  return defined<Partial<Settings>>({
    lang: UI_LANGS.some((l) => l.val === s.lang) ? s.lang : undefined,
    clipLangs: s.clipLangs,
    useEnglishName:
      s.nameProperty === undefined
        ? undefined
        : s.nameProperty === "english_name",
    liveTlLang: s.liveTlLang,
    themeMode:
      s.darkMode === undefined ? undefined : s.darkMode ? "dark" : "light",
    primaryColor: readLegacyPrimary() ?? undefined,
    defaultOpen: (["home", "favorites", "multiview"] as const).find(
      (p) => p === s.defaultOpen
    ),
    redirectMode: s.redirectMode,
    scrollMode: s.scrollMode,
    homeViewMode: (["grid", "list", "denseList"] as const).find(
      (m) => m === s.homeViewMode
    ),
    gridSize:
      gridSize === 0 || gridSize === 1 || gridSize === 2 ? gridSize : undefined,
    hideThumbnail: s.hideThumbnail,
    hidePlaceholder: s.hidePlaceholder,
    hideMissing: s.hideMissing,
    hideCollabStreams: s.hideCollabStreams,
    ignoredTopics: s.ignoredTopics,
    hiddenGroups: s.hiddenGroups,
    blockedChannels: s.blockedChannels,
  })
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults(),
      ...fromLegacy(),
      set: (key, value) => set({ [key]: value } as Pick<Settings, typeof key>),
      toggleBlocked: (channel) =>
        set((state) => {
          const exists = state.blockedChannels.some((c) => c.id === channel.id)
          return {
            blockedChannels: exists
              ? state.blockedChannels.filter((c) => c.id !== channel.id)
              : [
                  ...state.blockedChannels,
                  {
                    id: channel.id,
                    name: channel.name,
                    english_name: channel.english_name,
                    photo: channel.photo,
                    org: channel.org,
                  },
                ],
          }
        }),
      reset: () => set(defaults()),
    }),
    { name: "holodex-v3/settings", version: 1 }
  )
)

syncAcrossTabs(useSettings)
