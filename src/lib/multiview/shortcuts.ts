/**
 * The keyboard map as data: which commands exist, what they are bound to, and
 * which key presses count. Running a command is up to the caller.
 *
 * A key is written the way it reads, with modifiers first: `K`, `Shift+K`, `?`,
 * `ArrowUp`, `Mod+Z`. `Mod` is Ctrl, or Command on a Mac. Shift only appears on
 * letters and named keys, because for a symbol it is already part of which symbol
 * came out, and differs by keyboard layout.
 */

export type ShortcutGroup = "playback" | "audio" | "layout" | "sync"

/** When a command can run: browsing the view, editing the layout, or either. */
export type ShortcutScope = "view" | "edit" | "any"

interface ShortcutDefinition {
  group: ShortcutGroup
  /** `null` is available to bind, but not bound to anything out of the box. */
  key: string | null
  scope?: ShortcutScope
  /** Also fires while the key is held down. */
  repeat?: boolean
  /** Works as well as `key`, but is not shown or configurable. */
  also?: readonly string[]
}

export const SHORTCUTS = {
  "play-pause": { group: "playback", key: "K", scope: "any" },
  "seek-back": { group: "playback", key: "J", repeat: true },
  "seek-forward": { group: "playback", key: "L", repeat: true },
  "catch-up": { group: "playback", key: "G" },
  "reload-all": { group: "playback", key: null },

  mute: { group: "audio", key: "M", scope: "any" },
  "unmute-all": { group: "audio", key: "Shift+M" },
  "audio-focus": { group: "audio", key: "A", scope: "any" },
  "hear-previous": { group: "audio", key: "," },
  "hear-next": { group: "audio", key: "." },
  "volume-up": { group: "audio", key: "ArrowUp", repeat: true },
  "volume-down": { group: "audio", key: "ArrowDown", repeat: true },

  director: { group: "layout", key: "D" },
  "director-layout": { group: "layout", key: "Shift+D" },
  "screen-next": { group: "layout", key: "]" },
  "screen-previous": { group: "layout", key: "[" },
  "swap-1": { group: "layout", key: "1" },
  "swap-2": { group: "layout", key: "2" },
  "swap-3": { group: "layout", key: "3" },
  "swap-4": { group: "layout", key: "4" },
  "swap-5": { group: "layout", key: "5" },
  "swap-6": { group: "layout", key: "6" },
  "swap-7": { group: "layout", key: "7" },
  "swap-8": { group: "layout", key: "8" },
  "swap-9": { group: "layout", key: "9" },
  edit: { group: "layout", key: "E", scope: "any" },
  undo: { group: "layout", key: "Mod+Z", scope: "edit", repeat: true },
  redo: {
    group: "layout",
    key: "Mod+Shift+Z",
    scope: "edit",
    repeat: true,
    also: ["Mod+Y"],
  },
  "add-video": { group: "layout", key: "V" },
  "add-cell": { group: "layout", key: "N" },
  presets: { group: "layout", key: "P" },
  "media-controls": { group: "layout", key: "C" },
  fullscreen: { group: "layout", key: "F", scope: "any" },
  toolbar: { group: "layout", key: "T", scope: "any" },
  help: { group: "layout", key: "?", scope: "any" },

  "sync-bar": { group: "sync", key: "S" },
  "sync-play-pause": { group: "sync", key: "Shift+K" },
  "sync-back": { group: "sync", key: "Shift+J", repeat: true },
  "sync-forward": { group: "sync", key: "Shift+L", repeat: true },
  "sync-slower": { group: "sync", key: "<" },
  "sync-faster": { group: "sync", key: ">" },
} as const satisfies Record<string, ShortcutDefinition>

export type ShortcutId = keyof typeof SHORTCUTS

/** One key per numbered place on screen, which the list of keys shows as a set. */
export const SWAP_SHORTCUTS = [
  "swap-1",
  "swap-2",
  "swap-3",
  "swap-4",
  "swap-5",
  "swap-6",
  "swap-7",
  "swap-8",
  "swap-9",
] as const satisfies readonly ShortcutId[]

const definition = (id: ShortcutId): ShortcutDefinition => SHORTCUTS[id]

export const SHORTCUT_IDS = Object.keys(SHORTCUTS) as ShortcutId[]

export const SHORTCUT_GROUPS: readonly ShortcutGroup[] = [
  "playback",
  "audio",
  "layout",
  "sync",
]

export const shortcutsInGroup = (group: ShortcutGroup) =>
  SHORTCUT_IDS.filter((id) => definition(id).group === group)

/** Only what differs from the defaults is kept, so new defaults reach everyone. */
export type ShortcutOverrides = Partial<Record<ShortcutId, string | null>>

export function keyFor(
  id: ShortcutId,
  overrides: ShortcutOverrides = {}
): string | null {
  const override = overrides[id]
  return override === undefined ? definition(id).key : override
}

export const isOverridden = (id: ShortcutId, overrides: ShortcutOverrides) =>
  overrides[id] !== undefined && overrides[id] !== definition(id).key

/** Which command a key runs. Aliases give way to anything bound to that key. */
export function commandFor(
  key: string,
  overrides: ShortcutOverrides = {}
): ShortcutId | null {
  const bound = SHORTCUT_IDS.find((id) => keyFor(id, overrides) === key)
  if (bound) return bound
  return SHORTCUT_IDS.find((id) => definition(id).also?.includes(key)) ?? null
}

export const shortcutScope = (id: ShortcutId): ShortcutScope =>
  definition(id).scope ?? "view"

export const shortcutRepeats = (id: ShortcutId) => !!definition(id).repeat

export const runsWhile = (id: ShortcutId, editing: boolean) => {
  const scope = shortcutScope(id)
  return scope === "any" || scope === (editing ? "edit" : "view")
}

/** Assigns a key, taking it from any command already using it. */
export function rebind(
  overrides: ShortcutOverrides,
  id: ShortcutId,
  key: string | null
): { overrides: ShortcutOverrides; displaced: ShortcutId | null } {
  const next = { ...overrides }
  const displaced = key
    ? (SHORTCUT_IDS.find(
        (other) => other !== id && keyFor(other, next) === key
      ) ?? null)
    : null
  if (displaced) next[displaced] = null
  if (key === definition(id).key) delete next[id]
  else next[id] = key
  return { overrides: next, displaced }
}

export const resetShortcut = (overrides: ShortcutOverrides, id: ShortcutId) =>
  rebind(overrides, id, definition(id).key)

/** The subset of a `KeyboardEvent` that decides which key was meant. */
export interface KeyInput {
  key: string
  code?: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  /** AltGr shows up as Ctrl+Alt, and is how many layouts type ordinary symbols. */
  getModifierState?: (key: "AltGraph") => boolean
}

/** These alone never make a shortcut. */
const NOT_A_KEY = new Set([
  "Shift",
  "Control",
  "Alt",
  "AltGraph",
  "Meta",
  "OS",
  "Fn",
  "FnLock",
  "Hyper",
  "Super",
  "CapsLock",
  "NumLock",
  "ScrollLock",
  "Dead",
  "Process",
  "Unidentified",
])

/**
 * The key as a shortcut sees it. A layout that does not type Latin letters still
 * has keys in the same places, so on a Russian or Korean keyboard the key at M's
 * position is treated as M, and likewise for Alt+letter on a Mac, which types a
 * symbol of its own.
 */
function baseKey({ key, code }: KeyInput): string {
  if (key === " ") return "Space"
  if (key.length !== 1) return key
  if (/^[a-z]$/i.test(key)) return key.toUpperCase()
  const position = code ? /^(?:Key([A-Z])|Digit(\d))$/.exec(code) : null
  const isLetterOrDigit = /^[\p{L}\p{N}]$/u.test(key)
  if (position && isLetterOrDigit) return position[1] ?? position[2]
  return key
}

export function keyFromEvent(input: KeyInput): string | null {
  if (NOT_A_KEY.has(input.key)) return null
  const altGraph = input.getModifierState?.("AltGraph")
  const mod = !altGraph && (input.ctrlKey || input.metaKey)
  const alt = !altGraph && input.altKey
  const macAltLetter = alt && input.code?.startsWith("Key")
  const base = macAltLetter ? input.code!.slice(3) : baseKey(input)
  const isSymbol = base.length === 1 && !/^[A-Z]$/.test(base)
  const parts = [
    mod && "Mod",
    alt && "Alt",
    input.shiftKey && !isSymbol && "Shift",
    base,
  ]
  return parts.filter(Boolean).join("+")
}

/**
 * A key with no Ctrl, Alt or Command to it, which a stray press, dictation or a
 * screen reader's own commands can set off. These can be turned off as a group.
 */
export function isCharacterKey(key: string): boolean {
  const base = key.replace(/^Shift\+/, "")
  return base.length === 1 || base === "Space"
}

/**
 * Keys that cannot be taken over. Tab and Enter are how the page is used without
 * a mouse, Escape leaves things, and Delete clears a binding while choosing one.
 */
const RESERVED = /(^|\+)(Tab|Enter|Escape|Delete|Backspace)$/

export const isBindable = (key: string) => !RESERVED.test(key)

const SYMBOLS: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Escape: "Esc",
}

/** The parts to show on key caps, in the words of the viewer's keyboard. */
export function keyParts(key: string, mac = false): string[] {
  return key.split(/\+(?=.)/).map((part) => {
    if (part === "Mod") return mac ? "⌘" : "Ctrl"
    if (part === "Alt" && mac) return "⌥"
    return SYMBOLS[part] ?? part
  })
}

/** Small enough to sit in the corner of an icon button. */
export function compactKey(key: string, mac = false): string {
  return key
    .split(/\+(?=.)/)
    .map((part) => {
      if (part === "Shift") return "⇧"
      if (part === "Mod") return mac ? "⌘" : "⌃"
      if (part === "Alt") return mac ? "⌥" : "Alt+"
      if (part === "Space") return "␣"
      return SYMBOLS[part] ?? part
    })
    .join("")
}

/** The value for `aria-keyshortcuts`, which spells modifiers out in full. */
export const ariaKey = (key: string) => key.replace(/\bMod\b/, "Control")

/** Enough of a DOM element to tell who a key press belongs to. */
export interface KeyTarget {
  tagName: string
  isContentEditable?: boolean
  closest?: (selector: string) => unknown
}

/** ARIA widgets that use plain keys themselves, such as arrows or type-ahead. */
const KEY_USING_WIDGETS = [
  "textbox",
  "searchbox",
  "combobox",
  "listbox",
  "option",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "radio",
  "radiogroup",
  "slider",
  "spinbutton",
  "tab",
  "tablist",
  "tree",
  "treeitem",
  "grid",
  "gridcell",
  "application",
]
  .map((role) => `[role="${role}"]`)
  .join(",")

const ACTIVATES_ON_KEY =
  'button,a[href],summary,[role="button"],[role="link"],[role="switch"],[role="checkbox"]'

/**
 * Whether a key press belongs to whatever has focus rather than to a shortcut.
 * Typing and sliders keep every key, and a focused button keeps the keys that
 * press it. Letters still work from a button, since one clicked with the mouse
 * stays focused and should not silently switch the keyboard off.
 */
export function targetOwnsKey(target: KeyTarget | null, key: string): boolean {
  if (!target) return false
  if (target.isContentEditable) return true
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return true
  if (target.closest?.(KEY_USING_WIDGETS)) return true
  return (
    (key === "Space" || key === "Enter") && !!target.closest?.(ACTIVATES_ON_KEY)
  )
}

/** The local calendar day, which is what "once a day" means to a person. */
export function localDay(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
