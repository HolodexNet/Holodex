import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { cn } from "cn"

import { parseRichText, type RichNode } from "@/lib/rich-text"

export const LINKS = {
  discord: "https://discord.gg/jctkgHBt4b",
  twitter: "https://twitter.com/holodex",
  twitterDm:
    "https://twitter.com/messages/compose?recipient_id=1320894663084048384",
  github: "https://github.com/HolodexNet/Holodex",
  issues: "https://github.com/HolodexNet/Holodex/issues",
  apiDocs: "https://docs.holodex.net/",
  kofi: "https://ko-fi.com/holodex",
  crowdin: "https://crwd.in/holodex",
  changelog: "https://github.com/HolodexNet/Holodex/blob/dev/docs/CHANGELOG.md",
} as const

/** The id a section is reached by; also its hash, e.g. `/about#faq`. */
export type SectionId =
  | "numbers"
  | "thanks"
  | "pitch-in"
  | "extras"
  | "faq"
  | "updates"
  | "fine-print"

export function AboutSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: SectionId
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      // Clears the sticky header.
      className={cn(
        "scroll-mt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)]",
        className
      )}
    >
      <h2
        id={`${id}-title`}
        className="text-2xl font-bold tracking-tight text-balance md:text-3xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function ExternalLink({
  href,
  className,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    />
  )
}

/** Scrolls to an element on this page, unfolding it if it is a disclosure. */
export function revealOnPage(id: string, smooth = true): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  if (el instanceof HTMLDetailsElement) el.open = true
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  el.scrollIntoView({
    behavior: smooth && !reduced ? "smooth" : "auto",
    block: "start",
  })
  return true
}

/**
 * An in-page link. It scrolls itself and records the hash without a router
 * navigation, which would otherwise jump the page through scroll restoration.
 */
export function HashLink({
  to,
  onClick,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { to: string }) {
  return (
    <a
      href={`#${to}`}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        if (!revealOnPage(to)) return
        event.preventDefault()
        window.history.replaceState(window.history.state, "", `#${to}`)
      }}
      {...props}
    />
  )
}

/** Inline link styling used inside running text on this page. */
export const textLink =
  "font-medium text-complement underline decoration-complement/40 underline-offset-2 hover:decoration-complement"

/** Splits a message around `{0}` so a React node can stand in for it. */
export function withSlot(message: string, slot: ReactNode): ReactNode {
  const [before, after = ""] = message.split("{0}")
  return (
    <>
      {before}
      {slot}
      {after}
    </>
  )
}

function renderRich(nodes: RichNode[]): ReactNode[] {
  return nodes.map((node, i) => {
    if (typeof node === "string") return node
    if (node.tag === "br") return <br key={i} />
    const children = renderRich(node.children)
    if (node.tag === "a")
      return node.href ? (
        <ExternalLink key={i} href={node.href} className={textLink}>
          {children}
        </ExternalLink>
      ) : (
        <span key={i}>{children}</span>
      )
    return node.tag === "strong" ? (
      <strong key={i}>{children}</strong>
    ) : (
      <em key={i}>{children}</em>
    )
  })
}

/** A translation that embeds a little HTML; see parseRichText. */
export function RichText({ html }: { html: string }) {
  return <>{renderRich(parseRichText(html))}</>
}

/** True once the element has scrolled into view; never flips back. */
export function useSeenOnce<T extends Element>(): [
  (el: T | null) => void,
  boolean,
] {
  // State, not a ref object, so the observer attaches when the element mounts
  // late (e.g. after data loads) instead of only on the first render.
  const [el, setEl] = useState<T | null>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    if (!el || seen) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true)
      },
      { rootMargin: "0px 0px -10% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [el, seen])

  return [setEl, seen]
}
