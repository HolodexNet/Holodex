/**
 * A few inherited translations embed HTML (links, line breaks, emphasis).
 * This reads exactly that subset into a tree; every other tag is dropped and
 * its text kept, so a translation can never inject markup or a script URL.
 */

export type RichNode =
  | string
  | { tag: "br" }
  | { tag: "a"; href: string | null; children: RichNode[] }
  | { tag: "strong" | "em"; children: RichNode[] }

type Open = { tag: "a" | "strong" | "em"; href: string | null }

const TAG = /<\s*(\/?)\s*([a-z]+)\b([^>]*)>/gi

const NAMES: Record<string, Open["tag"] | "br"> = {
  a: "a",
  b: "strong",
  strong: "strong",
  i: "em",
  em: "em",
  br: "br",
}

/** Only absolute http(s) links survive. */
function safeHref(attrs: string): string | null {
  const href = /\bhref\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1]?.trim()
  return href && /^https?:\/\//i.test(href) ? href : null
}

export function parseRichText(html: string): RichNode[] {
  const root: RichNode[] = []
  const stack: (Open & { children: RichNode[] })[] = []
  const out = () => stack.at(-1)?.children ?? root
  let last = 0

  for (const match of html.matchAll(TAG)) {
    const [whole, closing, rawName, attrs] = match
    if (match.index > last) out().push(html.slice(last, match.index))
    last = match.index + whole.length

    const tag = NAMES[rawName.toLowerCase()]
    if (!tag) continue
    if (tag === "br") {
      out().push({ tag: "br" })
    } else if (!closing) {
      stack.push({
        tag,
        href: tag === "a" ? safeHref(attrs) : null,
        children: [],
      })
    } else if (stack.at(-1)?.tag === tag) {
      const node = stack.pop()!
      out().push(
        node.tag === "a"
          ? { tag: "a", href: node.href, children: node.children }
          : { tag: node.tag, children: node.children }
      )
    }
  }
  if (last < html.length) out().push(html.slice(last))
  // Unclosed tags keep their text rather than dropping it. Pop before
  // asking for the parent: out() reads the top of the stack.
  while (stack.length) {
    const node = stack.pop()!
    out().push(...node.children)
  }
  return root
}
