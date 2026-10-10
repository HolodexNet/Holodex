import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { deriveTheme, isHex, type Appearance } from './theme'
import type { Channel } from './types'

export interface Preferences {
  appearance: Appearance
  primary: string
  organization: string
  englishNames: boolean
  clipLanguage: string
  timeZone: string
  thumbnails: boolean
  hidePlaceholders: boolean
  hideFreeChat: boolean
  reducedMotion: boolean
  density: 'comfortable' | 'compact'
  view: 'grid' | 'list'
}
export const DEFAULT_PREFERENCES: Preferences = {
  appearance: 'dark', primary: '#f5c542', organization: 'Hololive', englishNames: true,
  clipLanguage: 'en', timeZone: 'local', thumbnails: true, hidePlaceholders: false,
  hideFreeChat: true, reducedMotion: false, density: 'comfortable', view: 'grid',
}
const KEY = 'holodex-react-v1'
interface Saved { preferences: Preferences; favorites: Channel[] }
function read(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return validateSaved(JSON.parse(raw))
    const legacy = JSON.parse(localStorage.getItem('holodex-v2') || '{}')
    return validateSaved({ preferences: {
      ...DEFAULT_PREFERENCES,
      appearance: legacy.settings?.darkMode === false ? 'light' : 'dark',
      englishNames: legacy.settings?.nameProperty !== 'name',
      organization: legacy.currentOrg?.name || 'Hololive',
      clipLanguage: legacy.settings?.clipLangs?.[0] || 'en',
      thumbnails: !legacy.settings?.hideThumbnail,
      hidePlaceholders: !!legacy.settings?.hidePlaceholder,
      view: legacy.settings?.homeViewMode === 'list' ? 'list' : 'grid',
    }, favorites: legacy.favorites?.favorites || [] })
  } catch { return { preferences: { ...DEFAULT_PREFERENCES }, favorites: [] } }
}
export function validateSaved(input: unknown): Saved {
  const object = input && typeof input === 'object' ? input as Partial<Saved> : {}
  const source = object.preferences || {} as Partial<Preferences>
  const preferences = { ...DEFAULT_PREFERENCES }
  for (const key of Object.keys(DEFAULT_PREFERENCES) as (keyof Preferences)[]) {
    const value = source[key]
    if (typeof value === typeof DEFAULT_PREFERENCES[key]) Object.assign(preferences, { [key]: value })
  }
  if (!isHex(preferences.primary)) preferences.primary = DEFAULT_PREFERENCES.primary
  if (!['dark', 'light', 'system'].includes(preferences.appearance)) preferences.appearance = 'dark'
  if (!['comfortable', 'compact'].includes(preferences.density)) preferences.density = 'comfortable'
  if (!['grid', 'list'].includes(preferences.view)) preferences.view = 'grid'
  if (!['en', 'ja', 'id', 'es', 'ko', 'zh', 'all'].includes(preferences.clipLanguage)) preferences.clipLanguage = 'en'
  try { if (preferences.timeZone !== 'local') new Intl.DateTimeFormat('en', { timeZone: preferences.timeZone }) } catch { preferences.timeZone = 'local' }
  const favorites = Array.isArray(object.favorites) ? object.favorites.filter((v): v is Channel => !!v && typeof v.id === 'string' && typeof v.name === 'string') : []
  return { preferences, favorites: [...new Map(favorites.map((v) => [v.id, v])).values()] }
}
interface Context extends Saved {
  update: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  toggleFavorite: (channel: Channel) => void
  reset: () => void
  importData: (input: unknown) => void
  storageError: boolean
}
const PreferencesContext = createContext<Context | null>(null)
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(read)
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const listener = () => setSystemDark(media.matches)
    media.addEventListener('change', listener)
    const sync = (event: StorageEvent) => { if (event.key === KEY && event.newValue) { try { setSaved(validateSaved(JSON.parse(event.newValue))) } catch { /* Ignore invalid storage from another tab. */ } } }
    window.addEventListener('storage', sync)
    return () => { media.removeEventListener('change', listener); window.removeEventListener('storage', sync) }
  }, [])
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)); setStorageError(false) } catch { setStorageError(true) }
  }, [saved])
  useEffect(() => {
    const p = saved.preferences
    const dark = p.appearance === 'system' ? systemDark : p.appearance === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.motion = p.reducedMotion ? 'reduced' : 'normal'
    document.documentElement.dataset.density = p.density
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    for (const [name, value] of Object.entries(deriveTheme(p.primary, dark))) document.documentElement.style.setProperty(name, value)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', p.primary)
  }, [saved.preferences, systemDark])
  const update: Context['update'] = (key, value) => setSaved((s) => ({ ...s, preferences: { ...s.preferences, [key]: value } }))
  const toggleFavorite = (channel: Channel) => setSaved((s) => ({ ...s, favorites: s.favorites.some((c) => c.id === channel.id) ? s.favorites.filter((c) => c.id !== channel.id) : [...s.favorites, channel] }))
  return <PreferencesContext.Provider value={{ ...saved, update, toggleFavorite, storageError,
    reset: () => setSaved((s) => ({ ...s, preferences: { ...DEFAULT_PREFERENCES } })),
    importData: (input) => setSaved(validateSaved(input)),
  }}>{children}</PreferencesContext.Provider>
}
export function usePreferences() { const context = useContext(PreferencesContext); if (!context) throw new Error('PreferencesProvider is missing'); return context }
