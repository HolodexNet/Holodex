/**
 * The song editor's keyboard map, as data. The same keys do the same things in
 * every approach. Letters go by physical key so that they keep working while a
 * Japanese input method is on, and digits work on every layout, which brackets
 * and punctuation do not.
 */

export type SongShortcut =
  | "toggle"
  | "back5"
  | "forward5"
  | "back1"
  | "forward1"
  | "back10"
  | "forward10"
  | "nextHint"
  | "markStart"
  | "markEnd"
  | "hearStart"
  | "hearEnd"
  | "startEarlier"
  | "startLater"
  | "endEarlier"
  | "endLater"
  | "previous"
  | "next"
  | "confirm"
  | "cancel"
  | "remove"
  | "search"
  | "undo"
  | "redo"
  | "save"
  | "help"

interface KeyCombo {
  code: string
  shift?: boolean
  mod?: boolean
}

const BINDINGS: Readonly<Record<SongShortcut, readonly KeyCombo[]>> = {
  toggle: [{ code: "Space" }, { code: "KeyK" }],
  back5: [{ code: "ArrowLeft" }],
  forward5: [{ code: "ArrowRight" }],
  back1: [{ code: "ArrowLeft", shift: true }],
  forward1: [{ code: "ArrowRight", shift: true }],
  back10: [{ code: "KeyJ" }],
  forward10: [{ code: "KeyL" }],
  nextHint: [{ code: "KeyN" }],
  markStart: [{ code: "KeyS" }],
  markEnd: [{ code: "KeyE" }],
  hearStart: [{ code: "KeyS", shift: true }],
  hearEnd: [{ code: "KeyE", shift: true }],
  startEarlier: [{ code: "Digit1" }],
  startLater: [{ code: "Digit2" }],
  endEarlier: [{ code: "Digit3" }],
  endLater: [{ code: "Digit4" }],
  previous: [{ code: "ArrowUp" }],
  next: [{ code: "ArrowDown" }],
  confirm: [{ code: "Enter" }],
  cancel: [{ code: "Escape" }],
  remove: [{ code: "Delete" }, { code: "Backspace" }],
  search: [{ code: "Slash" }],
  undo: [{ code: "KeyZ", mod: true }],
  redo: [
    { code: "KeyZ", mod: true, shift: true },
    { code: "KeyY", mod: true },
  ],
  save: [{ code: "KeyS", mod: true }],
  help: [{ code: "Slash", shift: true }],
}

/** What to print on the key caps, for the help sheet and hints. */
export const SONG_SHORTCUT_KEYS: Readonly<Record<SongShortcut, string>> = {
  toggle: "Space",
  back5: "←",
  forward5: "→",
  back1: "⇧ ←",
  forward1: "⇧ →",
  back10: "J",
  forward10: "L",
  nextHint: "N",
  markStart: "S",
  markEnd: "E",
  hearStart: "⇧ S",
  hearEnd: "⇧ E",
  startEarlier: "1",
  startLater: "2",
  endEarlier: "3",
  endLater: "4",
  previous: "↑",
  next: "↓",
  confirm: "Enter",
  cancel: "Esc",
  remove: "Del",
  search: "/",
  undo: "Ctrl Z",
  redo: "Ctrl ⇧ Z",
  save: "Ctrl S",
  help: "?",
}

export const SHORTCUT_GROUPS: readonly {
  id: "playback" | "marking" | "list"
  items: readonly SongShortcut[]
}[] = [
  {
    id: "playback",
    items: [
      "toggle",
      "back5",
      "forward5",
      "back1",
      "forward1",
      "back10",
      "forward10",
      "nextHint",
    ],
  },
  {
    id: "marking",
    items: [
      "markStart",
      "markEnd",
      "hearStart",
      "hearEnd",
      "startEarlier",
      "startLater",
      "endEarlier",
      "endLater",
    ],
  },
  {
    id: "list",
    items: [
      "previous",
      "next",
      "confirm",
      "remove",
      "search",
      "undo",
      "redo",
      "save",
      "help",
    ],
  },
]

export function shortcutFromEvent(event: {
  code: string
  shiftKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
}): SongShortcut | null {
  if (event.altKey) return null
  const mod = event.ctrlKey || event.metaKey
  for (const [shortcut, combos] of Object.entries(BINDINGS)) {
    if (
      combos.some(
        (combo) =>
          combo.code === event.code &&
          !!combo.shift === event.shiftKey &&
          !!combo.mod === mod
      )
    )
      return shortcut as SongShortcut
  }
  return null
}
