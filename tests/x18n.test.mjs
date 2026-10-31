import assert from "node:assert/strict"
import test from "node:test"

import { createBuiltins } from "@x18n/builtins"
import {
  applyTextEdits,
  createMemoryHost,
  createProject,
  resolveConfig,
} from "@x18n/core"
import { parse } from "yaml"

import config from "../x18n.config.ts"
import holodexYaml from "../scripts/x18n-yaml.ts"

const builtins = await createBuiltins()
const source = `greeting: Hello {name}
clips: '{n} clip | {n} clips'
sizes:
  - Large
  - Small
`

async function fixture(t) {
  const host = createMemoryHost({
    "src/locales/en/ui.yml": source,
    "src/locales/en/seo.yml": "music:\n  title: 'Songs by {{english_name}}'\n",
    "src/locales/fr-FR/ui.yml": source,
    "src/locales/fr-FR/seo.yml": "---\n",
    "src/example.tsx": `
      const { t: translate, tc: plural, tl: list } = useT()
      translate('greeting', { name: 'Alice' })
      plural('clips', 2)
      list('sizes')
      const translator = getT()
      translator.t('greeting', { name: 'Bob' })
      translator.tc('clips', 3)
      translator.tl('sizes')
      getT().t('greeting', { name: 'Carol' })
    `,
    "legacy/example.tsx": "t('legacy.key')",
    "src/lib/i18n.ts": "t('runtime.internal')",
  })
  const setup = await resolveConfig({ host, config, builtins })
  const project = createProject({ host, setup })
  t.after(() => project.dispose())
  await project.ready
  return project
}

test("x18n recognizes translator aliases, objects and chained calls", async (t) => {
  const project = await fixture(t)
  const usages = project.usages().map((match) => match.usage)
  assert.equal(usages.filter((u) => u.key === "greeting").length, 3)
  assert.equal(usages.filter((u) => u.key === "clips").length, 2)
  assert.equal(usages.filter((u) => u.raw === "sizes").length, 2)
  assert.ok(usages.every((u) => u.path === "src/example.tsx"))
  const diagnostics = project.analyze().diagnostics
  assert.ok(!diagnostics.some((d) => d.code === "missing-key"))
  assert.ok(!diagnostics.some((d) => d.code === "param-mismatch"))
})

test("x18n shares dotted keys across bundles and writes to the source bundle", async (t) => {
  const project = await fixture(t)
  assert.equal(project.namespaced, false)
  assert.equal(project.resources.length, 4)
  assert.ok(project.keys().includes("music.title"))
  assert.ok(project.keys().includes("sizes.0"))
  assert.ok(
    !project
      .keys()
      .some((key) => key.startsWith("ui.") || key.startsWith("seo."))
  )
  const plan = project.plan([
    {
      type: "set",
      key: "music.title",
      locale: "en",
      value: "Music by {{english_name}}",
    },
  ])
  assert.equal(plan.changes.length, 1)
  assert.ok(plan.changes[0].path.endsWith("src/locales/en/seo.yml"))
  await project.apply(plan)
  assert.equal(
    project.message("music.title", "en").value,
    "Music by {{english_name}}"
  )
})

test("x18n preserves YAML lists and comments when editing list items", () => {
  const format = holodexYaml.formats[0]
  const ctx = { path: "ui.yml", locale: "en" }
  const text = "# Grid sizes\nsizes:\n  - Large\n  - Small\n"
  const parsed = format.parse(text, ctx)
  assert.deepEqual(parsed.tree, { sizes: { 0: "Large", 1: "Small" } })
  const edits = format.edit(
    text,
    [{ type: "set", path: ["sizes", "0"], value: "Big" }],
    ctx
  )
  const edited = applyTextEdits(text, edits)
  assert.ok(edited.startsWith("# Grid sizes\n"))
  assert.deepEqual(parse(edited), { sizes: ["Big", "Small"] })
  assert.deepEqual(parse(format.serialize(parsed.tree, ctx)), {
    sizes: ["Large", "Small"],
  })
  const emptyEdits = format.edit(
    "---\n",
    [{ type: "set", path: ["music", "title"], value: "Songs" }],
    ctx
  )
  assert.deepEqual(parse(applyTextEdits("---\n", emptyEdits)), {
    music: { title: "Songs" },
  })
})

test("x18n handles empty catalogs and detects both placeholder syntaxes", async (t) => {
  const project = await fixture(t)
  assert.equal(project.explain().errors.length, 0)
  for (const [key, value] of [
    ["greeting", "Bonjour"],
    ["music.title", "Chansons"],
  ]) {
    const plan = project.plan([{ type: "set", key, locale: "fr-FR", value }])
    await project.apply(plan)
  }
  const mismatches = project
    .analyze()
    .diagnostics.filter((d) => d.code === "placeholder-mismatch")
  assert.deepEqual(
    new Set(mismatches.map((d) => d.key)),
    new Set(["greeting", "music.title"])
  )
})
