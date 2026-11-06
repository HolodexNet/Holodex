import assert from "node:assert/strict"
import test from "node:test"

import { hexToOklch as hexToOklchForTest } from "../src/lib/theme/color.ts"
import { derivePalette } from "../src/lib/theme/palette.ts"
import {
  exportTheme,
  importTheme,
  isThemeColor,
  normalizeThemeColor,
  resolvePalette as resolve,
  THEME_GROUPS,
  themeColorToHex,
} from "../src/lib/theme/overrides.ts"

/** The previous positional signature, so the older tests read as before. */
const resolvePalette = (primary, mode, overrides, extra = {}) =>
  resolve({ primary, overrides, ...extra }, mode)

test("existing themes retain their computed defaults without overrides", () => {
  for (const primary of ["#f06292", "#000000", "#ffffff", "#0088ff"]) {
    for (const mode of ["light", "dark"]) {
      assert.deepEqual(
        resolvePalette(primary, mode),
        derivePalette(primary, mode)
      )
      // Default tuning is a no-op.
      assert.deepEqual(
        derivePalette(primary, mode, { tint: 1, contrast: 0 }),
        derivePalette(primary, mode)
      )
    }
  }
})

test("every overridable token belongs to exactly one color group", () => {
  const tokens = Object.keys(derivePalette("#f06292", "dark").vars).filter(
    (t) => t !== "--primary"
  )
  const members = Object.values(THEME_GROUPS).flatMap((g) => g.members)
  assert.deepEqual([...members].sort(), [...tokens].sort())
  for (const group of Object.values(THEME_GROUPS))
    assert.ok(group.members.includes(group.seed))
})

test("a group color moves every member and keeps their offsets", () => {
  const defaults = derivePalette("#f06292", "dark")
  const custom = resolvePalette("#f06292", "dark", undefined, {
    groups: { dark: { text: "#ffcc00" } },
  })
  // Members that matched the seed take the exact colour.
  for (const token of THEME_GROUPS.text.members) {
    if (defaults.vars[token] === defaults.vars["--foreground"])
      assert.equal(custom.vars[token], "#ffcc00")
  }
  // Muted text stays dimmer than text, now at the new hue.
  const muted = hexToOklchForTest(themeColorToHex(custom.vars["--muted-foreground"]))
  const text = hexToOklchForTest("#ffcc00")
  assert.ok(muted.l < text.l)
  assert.ok(Math.abs(muted.h - text.h) < 10)
  // Other groups are untouched; the other mode too.
  assert.equal(custom.vars["--background"], defaults.vars["--background"])
  assert.deepEqual(
    resolvePalette("#f06292", "light", undefined, {
      groups: { dark: { text: "#ffcc00" } },
    }),
    derivePalette("#f06292", "light")
  )
})

test("group opacity scales members' opacity proportionally", () => {
  const custom = resolvePalette("#f06292", "dark", undefined, {
    groups: { dark: { borders: "#ffffff38" } }, // 22%, double the default 11%
  })
  assert.equal(custom.vars["--border"], "#ffffff38")
  const input = themeColorToHex(custom.vars["--input"])
  // Default input is 16%; doubled is 32% (0x52).
  assert.ok(Math.abs(parseInt(input.slice(7), 16) - 0x52) <= 1)
})

test("individual colors win over their group", () => {
  const custom = resolvePalette(
    "#f06292",
    "dark",
    { dark: { "--card-foreground": "#123456" } },
    { groups: { dark: { text: "#ffcc00" } } }
  )
  assert.equal(custom.vars["--card-foreground"], "#123456")
  assert.equal(custom.vars["--foreground"], "#ffcc00")
})

test("themes survive an export and import round trip", () => {
  const theme = {
    primary: "#0088FF",
    tuning: { secondary: "#22aa44", tint: 1.5, contrast: -0.25 },
    groups: { dark: { text: "#ffcc00" }, light: {} },
    overrides: { light: { "--card": "#fafafa80" } },
  }
  const text = exportTheme(theme)
  const json = JSON.parse(text)
  assert.equal(json.primary, "#0088ff")
  assert.equal(json.groups.light, undefined) // empty modes are left out
  assert.deepEqual(importTheme(text), {
    primary: "#0088ff",
    tuning: { secondary: "#22aa44", tint: 1.5, contrast: -0.25 },
    groups: { dark: { text: "#ffcc00" } },
    overrides: { light: { "--card": "#fafafa80" } },
  })
  // A default theme exports without its default layers.
  assert.deepEqual(JSON.parse(exportTheme({ primary: "#f06292" })), {
    holodexTheme: 1,
    primary: "#f06292",
  })
})

test("importing drops anything that is not a known, valid color", () => {
  assert.equal(importTheme("not json"), null)
  assert.equal(importTheme("{}"), null)
  assert.equal(importTheme('{"holodexTheme":1,"primary":"red"}'), null)
  const imported = importTheme(
    JSON.stringify({
      holodexTheme: 1,
      primary: "#abc",
      tuning: { tint: 99, contrast: "x", secondary: "url(x)" },
      groups: { dark: { text: "javascript:", nope: "#fff" }, sepia: {} },
      overrides: {
        dark: { "--primary": "#123456", "--card": "#123456", "--x": "#fff" },
      },
    })
  )
  assert.deepEqual(imported, {
    primary: "#aabbcc",
    tuning: { secondary: undefined, tint: 2, contrast: 0 },
    groups: {},
    overrides: { dark: { "--card": "#123456" } },
  })
})

test("tuning: secondary sets the neutral hue, tint and contrast behave", () => {
  const base = (p) => hexToOklchForTest(themeColorToHex(p.vars["--secondary"]))
  const secondary = derivePalette("#f06292", "dark", {
    secondary: "#22aa44",
    tint: 1,
    contrast: 0,
  })
  const green = hexToOklchForTest("#22aa44").h
  assert.ok(Math.abs(base(secondary).h - green) < 3)
  assert.equal(secondary.baseHue, green)

  const grey = derivePalette("#f06292", "dark", { tint: 0, contrast: 0 })
  assert.ok(base(grey).c < 0.002)

  const oled = derivePalette("#f06292", "dark", { tint: 1, contrast: 1 })
  assert.equal(oled.background, "#000000")
  const white = derivePalette("#f06292", "light", { tint: 1, contrast: 1 })
  assert.equal(white.background, "#ffffff")
})

test("every theme color can be overridden and reset without affecting other tokens", () => {
  const primary = "#f06292"
  const defaults = derivePalette(primary, "dark")
  for (const token of Object.keys(defaults.vars)) {
    if (token === "--primary") continue
    const overrides = { dark: { [token]: "#123abc80" } }
    const custom = resolvePalette(primary, "dark", overrides)
    assert.deepEqual(custom.vars, { ...defaults.vars, [token]: "#123abc80" })
    assert.deepEqual(
      resolvePalette(primary, "light", overrides),
      derivePalette(primary, "light")
    )
    delete overrides.dark[token]
    assert.deepEqual(resolvePalette(primary, "dark", overrides), defaults)
  }
})

test("overrides persist through primary changes while automatic colors recompute", () => {
  const overrides = {
    dark: { "--complement": "#123456", "--background": "#102030" },
    light: { "--complement": "#abcdef" },
  }
  const saved = JSON.parse(JSON.stringify(overrides))
  const custom = resolvePalette("#00ff00", "dark", saved)
  assert.equal(custom.vars["--complement"], "#123456")
  assert.equal(custom.complement, "#123456")
  assert.equal(custom.background, "#102030")
  assert.equal(
    custom.vars["--card"],
    derivePalette("#00ff00", "dark").vars["--card"]
  )
  delete saved.dark
  assert.deepEqual(
    resolvePalette("#00ff00", "dark", saved),
    derivePalette("#00ff00", "dark")
  )
  assert.equal(resolvePalette("#00ff00", "light", saved).complement, "#abcdef")
})

test("invalid and unknown stored colors cannot override theme tokens or the primary seed", () => {
  const defaults = derivePalette("#f06292", "dark")
  assert.deepEqual(
    resolvePalette("#f06292", "dark", {
      dark: {
        "--background": "broken",
        "--complement": null,
        "--primary": "#123456",
        "--unknown": "#abcdef",
      },
    }),
    defaults
  )
  assert.equal(
    resolvePalette("#f06292", "dark", { dark: { "--complement": "#ABC" } })
      .complement,
    "#aabbcc"
  )
})

test("editing generated colors preserves transparency and accepts valid hex values", () => {
  assert.equal(themeColorToHex("oklch(0.93 0.03 241.96 / 11%)").slice(7), "1c")
  assert.equal(themeColorToHex("oklch(0.74 0.1797 1.96 / 55%)").slice(7), "8c")
  assert.equal(themeColorToHex("#AbC"), "#aabbcc")
  assert.equal(themeColorToHex("oklch(0.5 0 0 / 50%)").slice(7), "80")
  assert.equal(normalizeThemeColor(" #ABCDEF80 "), "#abcdef80")
  for (const value of ["#abc", "abcdef", "#abcdef", "#abcdef00", "#abcdef80"])
    assert.ok(isThemeColor(value))
  for (const value of ["", "#ab", "#abcde", "#abcdefgh", "red", "url(example)"])
    assert.ok(!isThemeColor(value))
})
