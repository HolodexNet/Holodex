import assert from "node:assert/strict"
import test from "node:test"
import {
  ariaKey,
  commandFor,
  compactKey,
  isBindable,
  isCharacterKey,
  isOverridden,
  keyFor,
  keyFromEvent,
  keyParts,
  localDay,
  rebind,
  resetShortcut,
  runsWhile,
  SHORTCUT_GROUPS,
  SHORTCUT_IDS,
  shortcutsInGroup,
  targetOwnsKey,
} from "../src/lib/multiview/shortcuts.ts"

test("keys are written the way they read, with modifiers first", () => {
  assert.equal(keyFromEvent({ key: "k" }), "K")
  assert.equal(keyFromEvent({ key: "K", shiftKey: true }), "Shift+K")
  assert.equal(keyFromEvent({ key: " " }), "Space")
  assert.equal(keyFromEvent({ key: "ArrowUp" }), "ArrowUp")
  assert.equal(
    keyFromEvent({ key: "ArrowUp", shiftKey: true }),
    "Shift+ArrowUp"
  )
  assert.equal(keyFromEvent({ key: "z", ctrlKey: true }), "Mod+Z")
  assert.equal(keyFromEvent({ key: "z", metaKey: true }), "Mod+Z")
  assert.equal(
    keyFromEvent({ key: "Z", ctrlKey: true, shiftKey: true }),
    "Mod+Shift+Z"
  )
})

test("shift is part of a symbol, not a modifier on it", () => {
  assert.equal(keyFromEvent({ key: "?", shiftKey: true }), "?")
  assert.equal(keyFromEvent({ key: "<", shiftKey: true }), "<")
  assert.equal(keyFromEvent({ key: "1" }), "1")
})

test("pressing only a modifier is not a key", () => {
  for (const key of [
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "AltGraph",
    "Dead",
    "Process",
  ]) {
    assert.equal(keyFromEvent({ key }), null)
  }
})

test("a layout that does not type Latin letters still has the same key positions", () => {
  assert.equal(keyFromEvent({ key: "ь", code: "KeyM" }), "M")
  assert.equal(keyFromEvent({ key: "ㅡ", code: "KeyM" }), "M")
  assert.equal(
    keyFromEvent({ key: "Ь", code: "KeyM", shiftKey: true }),
    "Shift+M"
  )
  assert.equal(keyFromEvent({ key: "ё", code: "Backquote" }), "ё")
})

test("Alt+letter on a Mac means the letter, not the symbol it types", () => {
  assert.equal(keyFromEvent({ key: "µ", code: "KeyM", altKey: true }), "Alt+M")
})

test("AltGr types a symbol, and is not Ctrl+Alt", () => {
  const altGraph = { getModifierState: (name) => name === "AltGraph" }
  assert.equal(
    keyFromEvent({
      key: "@",
      code: "KeyQ",
      ctrlKey: true,
      altKey: true,
      ...altGraph,
    }),
    "@"
  )
  assert.equal(
    keyFromEvent({ key: "@", code: "Digit2", ctrlKey: true, altKey: true }),
    "Mod+Alt+@"
  )
})

test("every command is in a group, and no two share a default key", () => {
  const grouped = SHORTCUT_GROUPS.flatMap(shortcutsInGroup)
  assert.deepEqual([...grouped].sort(), [...SHORTCUT_IDS].sort())
  const keys = SHORTCUT_IDS.map((id) => keyFor(id)).filter(Boolean)
  assert.equal(new Set(keys).size, keys.length)
})

test("defaults are all keys that can really be pressed and bound", () => {
  for (const id of SHORTCUT_IDS) {
    const key = keyFor(id)
    if (key) assert.equal(isBindable(key), true, id)
  }
})

test("a key finds its command, and an alias gives way to a real binding", () => {
  assert.equal(commandFor("K"), "play-pause")
  assert.equal(commandFor("Mod+Y"), "redo")
  assert.equal(commandFor("Q"), null)
  assert.equal(commandFor("Mod+Y", { undo: "Mod+Y" }), "undo")
})

test("rebinding takes the key from whatever had it", () => {
  const { overrides, displaced } = rebind({}, "mute", "K")
  assert.equal(displaced, "play-pause")
  assert.equal(keyFor("mute", overrides), "K")
  assert.equal(keyFor("play-pause", overrides), null)
  assert.equal(commandFor("K", overrides), "mute")
  assert.equal(commandFor("M", overrides), null)
})

test("only differences from the default are kept", () => {
  const { overrides } = rebind({}, "mute", "Q")
  assert.equal(isOverridden("mute", overrides), true)
  const back = rebind(overrides, "mute", "M")
  assert.deepEqual(back.overrides, {})
  assert.equal(isOverridden("mute", back.overrides), false)
})

test("clearing a key leaves the command unbound, without taking anything", () => {
  const { overrides, displaced } = rebind({}, "mute", null)
  assert.equal(displaced, null)
  assert.equal(keyFor("mute", overrides), null)
  assert.equal(commandFor("M", overrides), null)
})

test("resetting a command takes back its default key", () => {
  let overrides = rebind({}, "mute", "Q").overrides
  overrides = rebind(overrides, "audio-focus", "M").overrides
  const reset = resetShortcut(overrides, "mute")
  assert.equal(keyFor("mute", reset.overrides), "M")
  assert.equal(reset.displaced, "audio-focus")
  assert.equal(keyFor("audio-focus", reset.overrides), null)
})

test("commands run in the mode they belong to", () => {
  assert.equal(runsWhile("undo", true), true)
  assert.equal(runsWhile("undo", false), false)
  assert.equal(runsWhile("volume-up", false), true)
  assert.equal(
    runsWhile("volume-up", true),
    false,
    "arrows move the cell instead"
  )
  assert.equal(runsWhile("edit", true), true)
  assert.equal(runsWhile("edit", false), true)
})

test("character keys are the ones a stray press can set off", () => {
  for (const key of ["K", "Shift+K", "?", "1", "Space"]) {
    assert.equal(isCharacterKey(key), true, key)
  }
  for (const key of ["Mod+Z", "Alt+M", "ArrowUp", "Shift+ArrowUp", "F2"]) {
    assert.equal(isCharacterKey(key), false, key)
  }
})

test("keys needed for getting around the page cannot be taken", () => {
  for (const key of [
    "Tab",
    "Shift+Tab",
    "Enter",
    "Escape",
    "Delete",
    "Mod+Backspace",
  ]) {
    assert.equal(isBindable(key), false, key)
  }
  for (const key of ["K", "Space", "Mod+Z", "ArrowUp", "F2"]) {
    assert.equal(isBindable(key), true, key)
  }
})

test("keys are shown in the viewer's own terms", () => {
  assert.deepEqual(keyParts("Mod+Shift+Z"), ["Ctrl", "Shift", "Z"])
  assert.deepEqual(keyParts("Mod+Z", true), ["⌘", "Z"])
  assert.deepEqual(keyParts("ArrowUp"), ["↑"])
  assert.deepEqual(keyParts("Escape"), ["Esc"])
  assert.deepEqual(keyParts("+"), ["+"])
  assert.deepEqual(keyParts("Mod++"), ["Ctrl", "+"])
  assert.equal(compactKey("Shift+K"), "⇧K")
  assert.equal(compactKey("Mod+Z", true), "⌘Z")
  assert.equal(ariaKey("Mod+Shift+Z"), "Control+Shift+Z")
})

const element = (tagName, matches = () => false, extra = {}) => ({
  tagName,
  closest: (selector) => (matches(selector) ? {} : null),
  ...extra,
})

test("typing and sliders keep every key", () => {
  for (const tag of ["INPUT", "TEXTAREA", "SELECT"]) {
    assert.equal(targetOwnsKey(element(tag), "K"), true, tag)
    assert.equal(targetOwnsKey(element(tag), "Mod+Z"), true, tag)
  }
  assert.equal(
    targetOwnsKey(
      element("DIV", () => false, { isContentEditable: true }),
      "K"
    ),
    true
  )
})

test("widgets that use plain keys keep them", () => {
  for (const role of [
    "slider",
    "menuitem",
    "listbox",
    "combobox",
    "tab",
    "radio",
  ]) {
    const inside = element("DIV", (selector) => selector.includes(`"${role}"`))
    assert.equal(targetOwnsKey(inside, "ArrowUp"), true, role)
  }
})

test("a focused button keeps the keys that press it, and no others", () => {
  const button = element("BUTTON", (selector) => selector.startsWith("button"))
  assert.equal(targetOwnsKey(button, "Space"), true)
  assert.equal(targetOwnsKey(button, "Enter"), true)
  assert.equal(targetOwnsKey(button, "K"), false)
  assert.equal(targetOwnsKey(button, "ArrowUp"), false)
})

test("nothing in particular having focus leaves keys free", () => {
  assert.equal(targetOwnsKey(null, "K"), false)
  assert.equal(targetOwnsKey(element("BODY"), "Space"), false)
  assert.equal(targetOwnsKey(element("DIV"), "K"), false)
})

test("the day is the local calendar day", () => {
  assert.equal(localDay(new Date(2026, 0, 5, 23, 59)), "2026-01-05")
  assert.equal(localDay(new Date(2026, 10, 25, 0, 1)), "2026-11-25")
})
