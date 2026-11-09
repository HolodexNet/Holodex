/**
 * Reads docs/CHANGELOG.md, which uses `### <version> <name> [*<date>*]` for
 * each release, deeper headings for groups, and `-` lists (indented by two
 * spaces per level) for changes.
 */

export type ChangelogBlock =
  | { kind: "heading"; text: string }
  | { kind: "item"; text: string; depth: number }
  | { kind: "text"; text: string }

export interface Release {
  version: string
  name: string
  date?: string
  blocks: ChangelogBlock[]
}

const RELEASE = /^###\s+(\S+)\s*(.*?)\s*(?:\[\*?([^\]*]+)\*?\])?\s*$/

/** The newest `limit` releases. Images and unreleased notes are skipped. */
export function parseChangelog(markdown: string, limit: number): Release[] {
  const releases: Release[] = []
  let current: Release | null = null

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trimEnd()
    if (!line.trim() || line.includes("![")) continue

    if (/^###\s/.test(line)) {
      const match = RELEASE.exec(line)
      // "### Changelog" is the document title, not a release.
      if (!match || /^changelog$/i.test(match[1])) {
        current = null
        continue
      }
      if (releases.length === limit) break
      current = {
        version: match[1],
        name: match[2],
        date: match[3]?.trim() || undefined,
        blocks: [],
      }
      releases.push(current)
      continue
    }
    if (!current) continue

    const heading = /^#{4,6}\s+(.*)$/.exec(line)
    if (heading) {
      current.blocks.push({ kind: "heading", text: heading[1] })
      continue
    }
    const item = /^(\s*)[-*]\s+(.*)$/.exec(line)
    if (item) {
      current.blocks.push({
        kind: "item",
        text: item[2],
        depth: Math.min(Math.floor(item[1].length / 2), 2),
      })
      continue
    }
    current.blocks.push({ kind: "text", text: line.trim() })
  }
  return releases
}

export type InlineToken =
  | { kind: "text" | "strong" | "em" | "code" | "handle"; text: string }
  | { kind: "link"; text: string; href: string | null }

const INLINE =
  /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|@[\w-]+)/g

/**
 * Bold, italics, code, links and contributor @handles. Links to anything but
 * http(s) keep their text and lose the address.
 */
export function tokenizeInline(text: string): InlineToken[] {
  return text
    .split(INLINE)
    .map((part, i): InlineToken => {
      if (i % 2 === 0) return { kind: "text", text: part }
      if (part.startsWith("**"))
        return { kind: "strong", text: part.slice(2, -2) }
      if (part.startsWith("`")) return { kind: "code", text: part.slice(1, -1) }
      if (part.startsWith("@")) return { kind: "handle", text: part }
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
      if (link)
        return {
          kind: "link",
          text: link[1],
          href: /^https?:\/\//i.test(link[2]) ? link[2] : null,
        }
      return { kind: "em", text: part.slice(1, -1) }
    })
    .filter((token) => token.text !== "")
}
