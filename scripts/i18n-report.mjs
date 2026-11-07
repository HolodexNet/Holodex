#!/usr/bin/env node
/**
 * Navigate the diagnostics from `x18n check --json`.
 *
 *   npm run i18n:report -- <command> [options]        runs the check itself
 *   npm run -s i18n:check -- --json | node scripts/i18n-report.mjs <command>
 *   node scripts/i18n-report.mjs <command> --input report.json
 *
 * Run with --help for the command list.
 */
import { execSync } from "node:child_process"
import { readFileSync, readdirSync } from "node:fs"
import { dirname, extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SRC = join(ROOT, "src")
const LOCALES_DIR = join(SRC, "locales")
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"])
const SEVERITIES = ["error", "warning", "info"]
const SEVERITY_RANK = Object.fromEntries(SEVERITIES.map((s, i) => [s, i]))
const UNUSED_STATUSES = ["unreferenced", "dynamic", "literal"]
const GROUP_FIELDS = {
  code: (d) => d.code,
  severity: (d) => d.severity,
  file: (d) => d.file ?? "-",
  locale: (d) => d.locale ?? "-",
  key: (d) => d.key ?? "-",
}

const USAGE = `Usage: i18n-report <command> [options]

Commands:
  summary              totals, counts per code, per-locale coverage (default)
  list                 diagnostics as a table
  group --by <field>   counts by code | severity | file | locale | key
  show <key>           every diagnostic for one key, with its fix operations
  unused               keys in ui.yml that x18n reports unused, checked against src/

Filters (list, group, show):
  --code a,b           --severity error|warning|info
  --file <substring>   --locale <tag>
  --key <glob>         --message <substring>        (* matches anything)

Options:
  --input <file>       read a saved report instead of running the check
  --json               print JSON instead of tables
  --limit <n>          rows to print for list/group (default 50, 0 = all)
  --full               do not truncate messages
  --status <name>      unused only: unreferenced | dynamic | literal
  --file <substring>   unused only: source file to check (default ui.yml, "" = all)

Exit codes: 0 ok, 1 unused only: some keys have no reference in src/, 2 usage or input error.
`

// ---------- args and input ----------

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith("--")) {
      args._.push(arg)
      continue
    }
    const name = arg.slice(2)
    if (name === "json" || name === "full" || name === "help") {
      args[name] = true
      continue
    }
    const next = argv[i + 1]
    if (next === undefined || next.startsWith("--")) {
      throw new Error(`--${name} needs a value`)
    }
    args[name] = next
    i++
  }
  return args
}

function loadReport(args) {
  let text
  if (args.input) {
    text = readFileSync(args.input, "utf8")
  } else if (!process.stdin.isTTY) {
    text = readFileSync(0, "utf8")
  }
  if (!text || !text.trim()) {
    try {
      text = execSync("npm run -s i18n:check -- --json", {
        cwd: ROOT,
        encoding: "utf8",
        maxBuffer: 1 << 28,
        stdio: ["ignore", "pipe", "pipe"],
      })
    } catch (err) {
      // x18n exits non-zero when it finds errors, and its JSON is still on stdout.
      if (!err.stdout) {
        throw new Error(`i18n:check produced no output\n${err.stderr ?? ""}`)
      }
      text = err.stdout
    }
  }
  // npm can print a banner before the JSON when run without -s.
  const start = text.search(/^\{/m)
  if (start < 0) {
    throw new Error("No JSON report found. Pass --json to i18n:check, or use --input.")
  }
  return JSON.parse(text.slice(start))
}

// ---------- filtering and output ----------

function globToRegex(glob) {
  const escaped = escapeRegExp(glob).replace(/\\\*/g, ".*")
  return new RegExp(`^${escaped}$`)
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function makeFilter(args) {
  const codes = args.code?.split(",").map((s) => s.trim())
  if (args.severity && !SEVERITIES.includes(args.severity)) {
    throw new Error(`--severity must be one of ${SEVERITIES.join(", ")}`)
  }
  const keyRe = args.key ? globToRegex(args.key) : null
  const message = args.message?.toLowerCase()
  return (d) =>
    (!codes || codes.includes(d.code)) &&
    (!args.severity || d.severity === args.severity) &&
    (!args.file || (d.file ?? "").includes(args.file)) &&
    (!args.locale || d.locale === args.locale) &&
    (!keyRe || keyRe.test(d.key ?? "")) &&
    (!message || (d.message ?? "").toLowerCase().includes(message))
}

function byLocation(a, b) {
  return (
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
    a.code.localeCompare(b.code) ||
    (a.file ?? "").localeCompare(b.file ?? "") ||
    (a.range?.line ?? 0) - (b.range?.line ?? 0)
  )
}

const location = (d) => (d.file ? `${d.file}:${d.range?.line ?? "?"}` : "-")

function clip(text = "", args) {
  if (args.full || text.length <= 100) return text
  return `${text.slice(0, 97)}...`
}

function printTable(headers, rows) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length))
  )
  const format = (cells) =>
    cells
      .map((cell, i) => String(cell ?? "").padEnd(widths[i]))
      .join("  ")
      .trimEnd()
  console.log(format(headers))
  console.log(widths.map((w) => "-".repeat(w)).join("  "))
  for (const row of rows) console.log(format(row))
}

function limitRows(rows, args) {
  const limit = args.limit === undefined ? 50 : Number(args.limit)
  return limit > 0 ? rows.slice(0, limit) : rows
}

function printMore(shown, all) {
  if (shown.length < all.length) {
    console.log(`... ${all.length - shown.length} more; pass --limit 0 to see all`)
  }
}

const printJson = (value) => console.log(JSON.stringify(value, null, 2))

// ---------- commands ----------

function cmdSummary(report, args) {
  const diagnostics = report.diagnostics ?? []
  const severities = Object.fromEntries(
    SEVERITIES.map((s) => [s, diagnostics.filter((d) => d.severity === s).length])
  )
  const codes = new Map()
  for (const d of diagnostics) {
    const entry = codes.get(d.code) ?? {
      severity: d.severity,
      code: d.code,
      count: 0,
      keys: new Set(),
    }
    entry.count++
    if (d.key) entry.keys.add(d.key)
    codes.set(d.code, entry)
  }
  const codeRows = [...codes.values()]
    .map(({ keys, ...rest }) => ({ ...rest, keys: keys.size }))
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.count - a.count
    )
  const coverage = (report.data?.projects ?? []).flatMap((p) => p.coverage ?? [])

  if (args.json) {
    return printJson({ total: diagnostics.length, severities, codes: codeRows, coverage })
  }
  console.log(
    `${diagnostics.length} diagnostics: ` +
      SEVERITIES.map((s) => `${severities[s]} ${s}`).join(", ")
  )
  console.log("")
  printTable(
    ["SEVERITY", "CODE", "COUNT", "KEYS"],
    codeRows.map((r) => [r.severity, r.code, r.count, r.keys])
  )
  if (coverage.length) {
    console.log("")
    printTable(
      ["LOCALE", "TOTAL", "TRANSLATED", "MISSING", "EMPTY", "OUTDATED", "NEEDS REVIEW"],
      coverage.map((c) => [
        c.locale,
        c.total,
        c.translated,
        c.missing,
        c.empty,
        c.outdated,
        c.needsReview,
      ])
    )
  }
  console.log("\nNext: list --code <code>, group --by file|locale|key, show <key>, unused")
}

function cmdList(report, args) {
  const rows = (report.diagnostics ?? []).filter(makeFilter(args)).sort(byLocation)
  if (args.json) return printJson(rows)
  const shown = limitRows(rows, args)
  printTable(
    ["SEVERITY", "CODE", "LOCALE", "KEY", "LOCATION", "MESSAGE"],
    shown.map((d) => [
      d.severity,
      d.code,
      d.locale ?? "-",
      d.key ?? "-",
      location(d),
      args.full ? d.message : clip(d.message, args),
    ])
  )
  printMore(shown, rows)
  console.log(`${rows.length} matching`)
}

function cmdGroup(report, args) {
  const by = args.by ?? "code"
  const pick = GROUP_FIELDS[by]
  if (!pick) throw new Error(`--by must be one of ${Object.keys(GROUP_FIELDS).join(", ")}`)
  const counts = new Map()
  for (const d of (report.diagnostics ?? []).filter(makeFilter(args))) {
    const group = pick(d)
    counts.set(group, (counts.get(group) ?? 0) + 1)
  }
  const rows = [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ [by]: name, count }))
  if (args.json) return printJson(rows)
  const shown = limitRows(rows, args)
  printTable(
    [by.toUpperCase(), "COUNT"],
    shown.map((r) => [r[by], r.count])
  )
  printMore(shown, rows)
}

function describeOp(op) {
  if (op.type === "delete") {
    const locales = Array.isArray(op.locales) ? op.locales.join(",") : op.locales
    return `delete ${op.key} in ${locales}`
  }
  if (op.type === "set") {
    return `set ${op.key} [${op.locale}] = ${JSON.stringify(op.value)}`
  }
  return JSON.stringify(op)
}

function describeFix(fix) {
  const ops = fix.ops ?? []
  const kinds = {}
  for (const op of ops) kinds[op.type] = (kinds[op.type] ?? 0) + 1
  const summary = Object.entries(kinds).map(([type, n]) => `${n} ${type}`).join(", ")
  const sample = ops.slice(0, 2).map(describeOp).join("; ").slice(0, 160)
  const lines = [`    fix (${fix.level ?? "safe"}): ${fix.title}${summary ? ` -- ${summary}` : ""}`]
  if (sample) lines.push(`      e.g. ${sample}`)
  return lines.join("\n")
}

function cmdShow(report, args, [pattern]) {
  if (!pattern) throw new Error("show needs a key or glob, e.g. show views.library.*")
  const keyRe = globToRegex(pattern)
  const rows = (report.diagnostics ?? [])
    .filter((d) => keyRe.test(d.key ?? ""))
    .filter(makeFilter(args))
    .sort((a, b) => (a.key ?? "").localeCompare(b.key ?? "") || byLocation(a, b))
  if (args.json) return printJson(rows)
  if (!rows.length) {
    console.log(`No diagnostics for ${pattern}`)
    return
  }
  let current
  for (const d of rows) {
    const key = d.key ?? "(no key)"
    if (key !== current) {
      current = key
      console.log(`\n${current}`)
    }
    const locale = d.locale ? ` [${d.locale}]` : ""
    console.log(`  ${d.severity.padEnd(7)} ${d.code}${locale}  ${location(d)}`)
    console.log(`    ${d.message}`)
    for (const fix of d.fixes ?? []) console.log(describeFix(fix))
  }
}

// Walk src/ (minus the locale bundles) so `unused` can look for references.
function readSources() {
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (path !== LOCALES_DIR) walk(path)
      } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
        files.push(path)
      }
    }
  }
  walk(SRC)
  return files.map((path) => ({
    file: relative(ROOT, path).split(sep).join("/"),
    text: readFileSync(path, "utf8"),
  }))
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length

// A key written out as a quoted string somewhere in src/.
function findLiteral(key, sources) {
  const re = new RegExp(`(["'\`])${escapeRegExp(key)}\\1`)
  for (const { file, text } of sources) {
    const match = re.exec(text)
    if (match) return { file, line: lineOf(text, match.index) }
  }
  return null
}

// Static prefixes of keys built at runtime: t(`views.channel.${x}`) or "views.sort." + x.
function findDynamicPrefixes(sources) {
  const found = new Map()
  const re = /["'`]([A-Za-z][\w-]*(?:\.[\w-]+)*\.)(?=\$\{|["'`]\s*\+)/g
  for (const { file, text } of sources) {
    for (const match of text.matchAll(re)) {
      if (!found.has(match[1])) {
        found.set(match[1], { file, line: lineOf(text, match.index) })
      }
    }
  }
  return found
}

function classify(key, sources, prefixes) {
  const literal = findLiteral(key, sources)
  if (literal) return { status: "literal", reference: literal }
  for (const [prefix, where] of prefixes) {
    if (key.startsWith(prefix)) return { status: "dynamic", prefix, reference: where }
  }
  return { status: "unreferenced" }
}

function cmdUnused(report, args) {
  const file = args.file ?? "ui.yml"
  if (args.status && !UNUSED_STATUSES.includes(args.status)) {
    throw new Error(`--status must be one of ${UNUSED_STATUSES.join(", ")}`)
  }
  const unused = (report.diagnostics ?? [])
    .filter((d) => d.code === "unused-key" && (d.file ?? "").includes(file))
    .sort((a, b) => a.key.localeCompare(b.key))

  const sources = readSources()
  const prefixes = findDynamicPrefixes(sources)
  const results = unused.map((d) => ({
    key: d.key,
    file: d.file,
    line: d.range?.line,
    ...classify(d.key, sources, prefixes),
  }))
  const counts = Object.fromEntries(
    UNUSED_STATUSES.map((s) => [s, results.filter((r) => r.status === s).length])
  )
  process.exitCode = counts.unreferenced > 0 ? 1 : 0

  if (args.json) {
    const shown = args.status ? results.filter((r) => r.status === args.status) : results
    return printJson({ counts, results: shown })
  }

  console.log(`x18n reports ${results.length} unused keys in ${file || "all files"}:`)
  console.log(`  unreferenced ${counts.unreferenced}  nothing in src/ mentions the key -> safe to delete`)
  console.log(`  dynamic      ${counts.dynamic}  key matches a runtime-built prefix in src/ -> check by hand`)
  console.log(`  literal      ${counts.literal}  key is written out in src/, so x18n missed it -> add to usage.keysInUse`)

  const width = Math.max(0, ...results.map((r) => r.key.length))
  for (const status of args.status ? [args.status] : UNUSED_STATUSES) {
    const group = results.filter((r) => r.status === status)
    if (!group.length) continue
    console.log(`\n== ${status} (${group.length}) ==`)
    for (const r of group) {
      let detail = `${r.file}:${r.line}`
      if (status === "literal") detail = `-> ${r.reference.file}:${r.reference.line}`
      if (status === "dynamic") detail = `prefix "${r.prefix}" at ${r.reference.file}:${r.reference.line}`
      console.log(`  ${r.key.padEnd(width)}  ${detail}`)
    }
  }
}

const COMMANDS = {
  summary: cmdSummary,
  list: cmdList,
  group: cmdGroup,
  show: cmdShow,
  unused: cmdUnused,
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const [command = "summary", ...rest] = args._
  if (args.help || command === "help") {
    console.log(USAGE)
    return
  }
  const run = COMMANDS[command]
  if (!run) throw new Error(`Unknown command "${command}". Run with --help.`)
  run(loadReport(args), args, rest)
}

try {
  main()
} catch (err) {
  console.error(err.message)
  process.exitCode = 2
}
