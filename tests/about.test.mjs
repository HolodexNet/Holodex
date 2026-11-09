import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { parseChangelog, tokenizeInline } from "../src/lib/changelog.ts"
import { parseRichText } from "../src/lib/rich-text.ts"

const changelog = readFileSync(
  new URL("../docs/CHANGELOG.md", import.meta.url),
  "utf8"
)

test("the newest releases are read with version, name and date", () => {
  const releases = parseChangelog(changelog, 3)
  assert.equal(releases.length, 3)
  for (const release of releases) {
    assert.match(release.version, /^\d+\.[\d?]+(\.\d+)?$/)
    assert.ok(release.name.length > 0, release.version)
    assert.ok(release.date, release.version)
    assert.ok(release.blocks.length > 0, release.version)
  }
})

test("the document title and unreleased notes are not releases", () => {
  const releases = parseChangelog(
    "### Changelog\n\n##### Unreleased\n\n- soon\n\n### 2.1 Holodex [*May 1st, 2024*]\n\n- shipped",
    5
  )
  assert.deepEqual(releases, [
    {
      version: "2.1",
      name: "Holodex",
      date: "May 1st, 2024",
      blocks: [{ kind: "item", text: "shipped", depth: 0 }],
    },
  ])
})

test("groups, nested items, text and images are told apart", () => {
  const [release] = parseChangelog(
    [
      "### 2.37 Holodex & Musicdex [*September 24th, 2023*]",
      "Hello!",
      "#### Holodex",
      "- top",
      "  - nested",
      "![shot](https://example.com/a.png)",
    ].join("\r\n"),
    1
  )
  assert.equal(release.name, "Holodex & Musicdex")
  assert.deepEqual(release.blocks, [
    { kind: "text", text: "Hello!" },
    { kind: "heading", text: "Holodex" },
    { kind: "item", text: "top", depth: 0 },
    { kind: "item", text: "nested", depth: 1 },
  ])
})

test("inline markdown keeps http links and drops other schemes", () => {
  assert.deepEqual(
    tokenizeInline(
      "**Big** fix by @meiamsome, see [docs](https://docs.holodex.net) or [x](javascript:alert(1))"
    ),
    [
      { kind: "strong", text: "Big" },
      { kind: "text", text: " fix by " },
      { kind: "handle", text: "@meiamsome" },
      { kind: "text", text: ", see " },
      { kind: "link", text: "docs", href: "https://docs.holodex.net" },
      { kind: "text", text: " or " },
      { kind: "link", text: "x", href: null },
      { kind: "text", text: ")" },
    ]
  )
})

test("translated HTML keeps links, breaks and emphasis", () => {
  assert.deepEqual(
    parseRichText(
      'a <a href="https://ko-fi.com/holodex">Ko-fi</a>.<br /><br /><b>Thanks</b>'
    ),
    [
      "a ",
      { tag: "a", href: "https://ko-fi.com/holodex", children: ["Ko-fi"] },
      ".",
      { tag: "br" },
      { tag: "br" },
      { tag: "strong", children: ["Thanks"] },
    ]
  )
})

test("translated HTML cannot inject scripts, handlers or script URLs", () => {
  assert.deepEqual(
    parseRichText(
      '<script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)" onclick="x()">hi</a>'
    ),
    ["alert(1)", { tag: "a", href: null, children: ["hi"] }]
  )
})

test("unclosed tags keep their text", () => {
  assert.deepEqual(parseRichText("x <b>bold <a href='https://a.b'>link"), [
    "x ",
    "bold ",
    "link",
  ])
})
