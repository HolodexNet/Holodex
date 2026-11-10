#!/usr/bin/env node
/**
 * Tabulate JSX `className` attributes that use many Tailwind classes.
 *
 *   npm run tailwind:report                        src/, report > 5 classes, output/tailwind-classes.csv
 *   npm run tailwind:report -- --threshold 8       only attributes with more than 8 classes
 *   npm run tailwind:report -- --out report.json --exclude ""
 *
 * Counting rules:
 *   - Only static text is counted: string literals, the literal parts of template
 *     strings, and string keys of object literals (`{ "bg-red-500": isError }`).
 *   - Expressions are ignored: identifiers, member access, calls to unknown
 *     functions, interpolations, and conditions. A class token that touches an
 *     interpolation is dropped because only part of its name is known.
 *   - Everything else in the value is collected, including both ternary branches,
 *     the right side of `&&`, both sides of `||` / `??`, and every argument of
 *     calls such as cn(...) or clsx(...).
 *   - The count is of distinct class tokens across the whole attribute value.
 *
 * Run with --help for all options.
 */
import ts from "typescript"
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DEFAULTS = {
  root: "src",
  threshold: 5,
  out: "output/tailwind-classes.csv",
  // shadcn-generated primitives (components.json alias "@/components/ui"); not hand-written.
  exclude: ["src/components/ui"],
}
const SOURCE_EXTENSIONS = new Set([".tsx", ".jsx"])
const SKIP_DIRS = new Set(["node_modules", ".git", "dist"])
const COLUMNS = [
  "file",
  "line",
  "end_line",
  "component",
  "element",
  "class_count",
  "classes",
  "expression",
]
// Marks a piece of a string whose value is unknown at parse time (an interpolation or a non-literal operand).
const DYNAMIC = Symbol("dynamic")

const USAGE = `Usage: npm run tailwind:report -- [options]

Lists JSX className attributes that use more than --threshold distinct Tailwind classes.

Options:
  --threshold <n>     report attributes with more than n classes (default ${DEFAULTS.threshold})
  --root <dir>        folder to scan, relative to the repo root (default ${DEFAULTS.root})
  --exclude <a,b>     comma-separated folders to skip (default ${DEFAULTS.exclude.join(",")});
                      pass "" to scan everything
  --out <file>        output file, .csv or .json (default ${DEFAULTS.out})
  -h, --help          show this help
`

// ---------- args ----------

function normalizeRel(path) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "")
}

function parseArgs(argv) {
  const args = { ...DEFAULTS, help: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") {
      args.help = true
      continue
    }
    if (!arg.startsWith("--")) throw new Error(`Unexpected argument: ${arg}`)
    const name = arg.slice(2)
    const value = argv[++i]
    if (value === undefined || value.startsWith("--"))
      throw new Error(`--${name} needs a value`)
    switch (name) {
      case "root":
        args.root = value
        break
      case "out":
        args.out = value
        break
      case "threshold":
        if (!/^\d+$/.test(value))
          throw new Error(`--threshold must be a whole number, got "${value}"`)
        args.threshold = Number(value)
        break
      case "exclude":
        args.exclude = value
          .split(",")
          .map((s) => normalizeRel(s.trim()))
          .filter(Boolean)
        break
      default:
        throw new Error(`Unknown option --${name}`)
    }
  }
  return args
}

// ---------- file discovery ----------

function relPosix(path) {
  return relative(ROOT, path).split(sep).join("/")
}

function isExcluded(relPath, excluded) {
  return excluded.some(
    (prefix) => relPath === prefix || relPath.startsWith(`${prefix}/`)
  )
}

function* walk(dir, excluded) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (isExcluded(relPosix(full), excluded)) continue
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(full, excluded)
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
      yield full
    }
  }
}

// ---------- class extraction ----------

function isStringish(node) {
  return (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateExpression(node) ||
    (ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.PlusToken)
  )
}

function isWrapper(node) {
  return (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  )
}

// Every way a string-valued expression can resolve, each as a list of pieces (literal text or DYNAMIC).
function stringAlternatives(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return [[node.text]]
  if (ts.isTemplateExpression(node)) {
    const parts = [node.head.text]
    for (const span of node.templateSpans)
      parts.push(DYNAMIC, span.literal.text)
    return [parts]
  }
  if (isWrapper(node)) return stringAlternatives(node.expression)
  if (ts.isConditionalExpression(node)) {
    return [
      ...stringAlternatives(node.whenTrue),
      ...stringAlternatives(node.whenFalse),
    ]
  }
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const out = []
    for (const left of stringAlternatives(node.left)) {
      for (const right of stringAlternatives(node.right))
        out.push([...left, ...right])
    }
    return out
  }
  if (
    node.kind === ts.SyntaxKind.NullKeyword ||
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword ||
    (ts.isIdentifier(node) && node.text === "undefined")
  ) {
    return [[]]
  }
  return [[DYNAMIC]]
}

// Splits pieces into class tokens. A token touching a DYNAMIC piece is dropped.
function tokensFromParts(parts) {
  const tokens = []
  let token = ""
  let dirty = false
  const flush = () => {
    if (token && !dirty) tokens.push(token)
    token = ""
    dirty = false
  }
  for (const part of parts) {
    if (part === DYNAMIC) {
      dirty = true
      continue
    }
    for (const ch of part) {
      if (/\s/.test(ch)) flush()
      else token += ch
    }
  }
  flush()
  return tokens
}

// Adds every static class token reachable from a className value to `into`.
function collectClasses(node, into) {
  if (!node) return
  if (isStringish(node)) {
    for (const parts of stringAlternatives(node)) {
      for (const token of tokensFromParts(parts)) into.add(token)
    }
    return
  }
  if (ts.isJsxExpression(node) || isWrapper(node))
    return collectClasses(node.expression, into)
  if (ts.isConditionalExpression(node)) {
    collectClasses(node.whenTrue, into)
    collectClasses(node.whenFalse, into)
    return
  }
  if (ts.isBinaryExpression(node)) {
    const op = node.operatorToken.kind
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
      collectClasses(node.right, into) // the left side is a condition
    } else if (
      op === ts.SyntaxKind.BarBarToken ||
      op === ts.SyntaxKind.QuestionQuestionToken
    ) {
      collectClasses(node.left, into)
      collectClasses(node.right, into)
    }
    return
  }
  if (ts.isCallExpression(node)) {
    for (const arg of node.arguments) collectClasses(arg, into)
    return
  }
  if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) collectClasses(element, into)
    return
  }
  if (ts.isObjectLiteralExpression(node)) {
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.name)) {
        for (const token of tokensFromParts([prop.name.text])) into.add(token)
      }
    }
  }
  // Identifiers, member access, JSX children, arrow functions, etc. contribute nothing.
}

// ---------- component detection ----------

function declaredName(node) {
  if (
    (ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isClassDeclaration(node) ||
      ts.isClassExpression(node)) &&
    node.name
  ) {
    return node.name.text
  }
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    let parent = node.parent
    // Unwrap memo(...) and forwardRef(...) so `const Card = memo(() => ...)` is named Card.
    if (
      ts.isCallExpression(parent) &&
      /(^|\.)(memo|forwardRef)$/.test(parent.expression.getText())
    ) {
      parent = parent.parent
    }
    if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name))
      return parent.name.text
    if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name))
      return parent.name.text
  }
  return undefined
}

// Nearest enclosing name that looks like a React component (capitalized), else the nearest name, else "(module)".
function enclosingComponent(node) {
  let fallback
  for (let cur = node.parent; cur; cur = cur.parent) {
    const name = declaredName(cur)
    if (!name) continue
    if (/^[A-Z]/.test(name)) return name
    fallback ??= name
  }
  return fallback ?? "(module)"
}

// ---------- analysis ----------

function analyzeFile(file, threshold) {
  const text = readFileSync(file, "utf8")
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const rows = []
  let attributes = 0

  const visit = (node) => {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "className" &&
      node.initializer
    ) {
      attributes++
      const classes = new Set()
      collectClasses(node.initializer, classes)
      if (classes.size > threshold) {
        const start =
          sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
        const end = sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1
        const opening = node.parent.parent
        const source = ts.isJsxExpression(node.initializer)
          ? (node.initializer.expression?.getText(sf) ?? "")
          : node.initializer.getText(sf)
        rows.push({
          file: relPosix(file),
          line: start,
          end_line: end,
          component: enclosingComponent(node),
          element:
            ts.isJsxOpeningElement(opening) ||
            ts.isJsxSelfClosingElement(opening)
              ? opening.tagName.getText(sf)
              : "?",
          class_count: classes.size,
          classes: [...classes].join(" "),
          expression: source.replace(/\s*\r?\n\s*/g, " ").trim(),
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return { attributes, rows }
}

// ---------- output ----------

function toCsv(rows) {
  const cell = (value) => {
    const text = String(value)
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = [
    COLUMNS,
    ...rows.map((row) => COLUMNS.map((column) => row[column])),
  ]
  return lines.map((line) => line.map(cell).join(",")).join("\n") + "\n"
}

function writeReport(outPath, rows) {
  const ext = extname(outPath).toLowerCase()
  if (ext !== ".csv" && ext !== ".json")
    throw new Error(`--out must end in .csv or .json, got "${outPath}"`)
  mkdirSync(dirname(outPath), { recursive: true })
  const body =
    ext === ".json" ? JSON.stringify(rows, null, 2) + "\n" : toCsv(rows)
  writeFileSync(outPath, body, "utf8")
}

// ---------- main ----------

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(USAGE)
    return
  }

  const rootPath = resolve(ROOT, args.root)
  const outPath = resolve(ROOT, args.out)
  const files = [...walk(rootPath, args.exclude)]
  const rows = []
  let attributes = 0
  for (const file of files) {
    const result = analyzeFile(file, args.threshold)
    attributes += result.attributes
    rows.push(...result.rows)
  }
  rows.sort(
    (a, b) =>
      b.class_count - a.class_count ||
      a.file.localeCompare(b.file) ||
      a.line - b.line
  )
  writeReport(outPath, rows)

  const excluded = args.exclude.length
    ? `, excluding ${args.exclude.join(", ")}`
    : ""
  console.log(
    `Scanned ${files.length} files in ${args.root}${excluded}: ${attributes} className attributes.`
  )
  console.log(
    `${rows.length} with more than ${args.threshold} distinct classes. Wrote ${relPosix(outPath)}`
  )
  for (const row of rows.slice(0, 10)) {
    console.log(
      `  ${String(row.class_count).padStart(3)}  ${row.file}:${row.line}  ${row.component}  <${row.element}>`
    )
  }
}

try {
  main()
} catch (err) {
  console.error(err.message)
  process.exitCode = 2
}
