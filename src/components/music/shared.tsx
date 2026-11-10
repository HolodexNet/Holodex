import type { ReactNode } from "react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

/*
 * Class strings the real music pages and their skeletons both render, so a
 * restyle can't leave the loading state looking different from the page.
 */

/** Playlist / radio hero strip. */
export const musicDetailHeaderClass =
  "relative isolate flex items-center gap-8 overflow-hidden rounded-[20px] bg-[color-mix(in_oklch,var(--complement-soft)_20%,var(--card))] p-8 max-md:block max-md:p-6"

/** Cover art frame inside the hero strip. */
export const musicDetailCoverClass =
  "w-[clamp(160px,20vw,230px)] shrink-0 rounded-[12px] shadow-[0_12px_30px_#0003] max-md:mx-auto max-md:mb-6.25 max-md:w-42.5"

/** Row of play/shuffle/etc. buttons under the hero. */
export const musicActionBarClass =
  "flex flex-wrap items-center gap-2.5 border-b border-border pt-1 pb-4"

/** Small "view all" style link. */
export const musicTextLinkClass =
  "inline-flex items-center gap-1.75 text-[12px] font-semibold text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-brand"

/** Rotated artwork that sits beside (or behind, on mobile) banner copy. */
export const musicBannerArtClass =
  "mr-6 w-55 shrink-0 rotate-[9deg] max-md:pointer-events-none max-md:absolute max-md:-right-28.75 max-md:-bottom-7.5 max-md:w-62.5 max-md:opacity-15"

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

/** Escapes a dynamic value before it is placed into a translated markup string. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => htmlEntities[char])
}

/** Logged-out call to action shown in place of a music tab's content. */
export function MusicSignInBanner({
  title,
  description,
  action,
  art,
}: {
  title: string
  description: string
  action: string
  art: ReactNode
}) {
  return (
    <div className="relative flex min-h-72.5 items-center justify-between gap-9 overflow-hidden rounded-2xl border border-border bg-[color-mix(in_oklch,var(--complement-soft)_13%,var(--card))] p-[clamp(24px,4vw,48px)] max-md:min-h-70 max-md:p-6.5">
      <div className="max-md:relative max-md:z-1">
        <h2 className="text-[clamp(24px,3vw,36px)] leading-[1.2] font-bold tracking-tighter">
          {title}
        </h2>
        <p className="mt-3 mb-6 max-w-97.5 text-[13px] leading-[1.8] text-muted-foreground">
          {description}
        </p>
        <Button nativeButton={false} render={<Link to="/login" />}>
          {action}
        </Button>
      </div>
      <div className={musicBannerArtClass}>{art}</div>
    </div>
  )
}
