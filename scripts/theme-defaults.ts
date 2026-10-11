/**
 * Keeps the static colour tokens in src/index.css in step with the theme
 * engine. Those tokens are what the page is painted with before any script
 * runs, so they should equal what src/lib/theme derives for the default
 * primary colour. Run this after changing the palette algorithm:
 *
 *   node scripts/theme-defaults.ts           # print the tokens
 *   node scripts/theme-defaults.ts --write   # update src/index.css, index.html, seo.html
 */
import { readFileSync, writeFileSync } from "node:fs"

import { derivePalette } from "../src/lib/theme/palette.ts"

const DEFAULT_PRIMARY = "#f06292"
const write = process.argv.includes("--write")
const root = new URL("../", import.meta.url)

const blocks = [
  { selector: ":root", palette: derivePalette(DEFAULT_PRIMARY, "light") },
  { selector: ".dark", palette: derivePalette(DEFAULT_PRIMARY, "dark") },
]

if (!write) {
  for (const { selector, palette } of blocks) {
    const body = Object.entries(palette.vars)
      .map(([name, value]) => `    ${name}: ${value};`)
      .join("\n")
    console.log(`${selector} {\n${body}\n}\n`)
  }
  process.exit(0)
}

const cssUrl = new URL("src/index.css", root)
let css = readFileSync(cssUrl, "utf8")
for (const { selector, palette } of blocks) {
  const start = css.indexOf(`\n${selector} {`)
  const end = css.indexOf("\n}", start)
  if (start < 0 || end < 0) throw new Error(`Block ${selector} not found`)
  let block = css.slice(start, end)
  for (const [name, value] of Object.entries(palette.vars)) {
    const line = new RegExp(`(\\n\\s*${name}:)[^;]*;`)
    if (!line.test(block)) throw new Error(`${name} missing in ${selector}`)
    block = block.replace(line, `$1 ${value};`)
  }
  css = css.slice(0, start) + block + css.slice(end)
}
writeFileSync(cssUrl, css)

// The default theme is dark; the browser chrome colour matches its background.
const background = blocks[1].palette.background
for (const file of ["index.html", "seo.html"]) {
  const url = new URL(file, root)
  const html = readFileSync(url, "utf8").replace(
    /(<meta name="theme-color" content=")[^"]*(")/,
    `$1${background}$2`
  )
  writeFileSync(url, html)
}

console.log(`Updated default theme tokens (dark background ${background}).`)
