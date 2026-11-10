import { useEffect, useState } from "react"
import { cn } from "cn"

import { ListBulletsIcon } from "@/components/icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useT } from "@/lib/i18n"
import { HashLink } from "./shared"

export interface TocItem {
  id: string
  label: string
}

interface Spy {
  active: string | null
  /** How far down the page the reader is, 0 to 1. */
  progress: number
}

/**
 * The section whose top has passed the reading line, plus overall progress.
 * At the very bottom the last section wins even if it is too short to reach
 * the line.
 */
function useScrollSpy(ids: readonly string[]): Spy {
  const [spy, setSpy] = useState<Spy>({ active: ids[0] ?? null, progress: 0 })

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      const line = Math.max(window.innerHeight * 0.3, 140)
      let active = ids[0] ?? null
      for (const id of ids) {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        if (top !== undefined && top <= line) active = id
      }
      if (max > 0 && y >= max - 4) active = ids.at(-1) ?? active
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0
      setSpy((prev) =>
        prev.active === active && Math.abs(prev.progress - progress) < 0.004
          ? prev
          : { active, progress }
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [ids])

  return spy
}

/**
 * Desktop: a column of ticks on the right edge that unfolds into labelled
 * links under the pointer (always unfolded where the margin has room).
 */
function TocRail({
  items,
  active,
}: {
  items: TocItem[]
  active: string | null
}) {
  const { t } = useT()
  const activeIndex = items.findIndex((item) => item.id === active)
  const unfold =
    "group-hover/toc:max-w-56 group-hover/toc:pr-3 group-hover/toc:pl-1 group-hover/toc:opacity-100 group-focus-within/toc:max-w-56 group-focus-within/toc:pr-3 group-focus-within/toc:pl-1 group-focus-within/toc:opacity-100 min-[1880px]:max-w-56 min-[1880px]:pr-3 min-[1880px]:pl-1 min-[1880px]:opacity-100"

  return (
    <nav
      aria-label={t("about.nav.label")}
      className="group/toc fixed top-1/2 right-2 z-30 hidden -translate-y-1/2 md:pointer-fine:block"
    >
      <ol className="flex flex-col items-end rounded-2xl p-1 transition-[background-color,box-shadow] duration-200 group-focus-within/toc:bg-popover/95 group-focus-within/toc:shadow-xl group-focus-within/toc:ring-1 group-focus-within/toc:ring-foreground/5 group-hover/toc:bg-popover/95 group-hover/toc:shadow-xl group-hover/toc:ring-1 group-hover/toc:ring-foreground/5 group-hover/toc:backdrop-blur-md">
        {items.map((item, index) => {
          const current = index === activeIndex
          return (
            <li key={item.id}>
              <HashLink
                to={item.id}
                aria-current={current ? "location" : undefined}
                className="flex h-7 items-center justify-end rounded-lg px-1 outline-none hover:bg-muted focus-ring"
              >
                <span
                  className={cn(
                    "max-w-0 overflow-hidden text-sm whitespace-nowrap opacity-0 transition-[max-width,opacity,padding] duration-200 motion-reduce:transition-none",
                    unfold,
                    current
                      ? "font-semibold text-brand"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-0.75 shrink-0 rounded-full transition-[width,background-color] duration-200",
                    current
                      ? "w-5 bg-primary"
                      : index < activeIndex
                        ? "w-3 bg-primary/45"
                        : "w-3 bg-muted-foreground/30"
                  )}
                />
              </HashLink>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** A ring that fills as the reader goes down the page. */
function ProgressRing({ progress }: { progress: number }) {
  const r = 14
  const circumference = 2 * Math.PI * r
  return (
    <span className="relative flex size-8 items-center justify-center">
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="16"
          cy="16"
          r={r}
          className="fill-none stroke-muted"
          strokeWidth="3"
        />
        <circle
          cx="16"
          cy="16"
          r={r}
          className="fill-none stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <ListBulletsIcon className="size-4 text-brand" aria-hidden="true" />
    </span>
  )
}

/** Touch and narrow screens: a floating button that opens the index. */
function TocButton({
  items,
  active,
  progress,
}: {
  items: TocItem[]
  active: string | null
  progress: number
}) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const current = items.find((item) => item.id === active)
  // The opening section is its own index; appear once the reader moves on.
  const shown = open || (active !== null && active !== items[0]?.id)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-hidden={!shown || undefined}
        className={cn(
          "fixed right-4 bottom-[calc(var(--music-player-height,0px)+3.5rem+env(safe-area-inset-bottom,0px)+1rem)] z-30 flex h-11 max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border bg-popover/95 pr-4 pl-1.5 shadow-lg backdrop-blur-md transition-[opacity,translate] duration-200 outline-none focus-ring motion-reduce:transition-none md:bottom-[calc(var(--music-player-height,0px)+1.5rem)] md:pointer-fine:hidden",
          !shown && "pointer-events-none translate-y-3 opacity-0"
        )}
        tabIndex={shown ? undefined : -1}
      >
        <ProgressRing progress={progress} />
        <span className="max-w-40 truncate text-sm font-semibold">
          <span className="sr-only">{t("about.nav.label")}: </span>
          {current?.label ?? t("about.nav.label")}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-64 gap-0 p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("about.nav.label")}
        </p>
        <ol>
          {items.map((item, index) => {
            const isCurrent = item.id === active
            return (
              <li key={item.id}>
                <HashLink
                  to={item.id}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent ? "location" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm outline-none hover:bg-muted focus-visible:bg-muted",
                    isCurrent &&
                      "bg-primary/10 font-semibold text-brand hover:bg-primary/15"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "w-5 font-mono text-xs tabular-nums",
                      isCurrent ? "text-brand" : "text-muted-foreground"
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </HashLink>
              </li>
            )
          })}
        </ol>
      </PopoverContent>
    </Popover>
  )
}

/** A floating index for a tall page: a rail on desktop, a button on touch. */
export function AboutToc({ items }: { items: TocItem[] }) {
  const [ids] = useState(() => items.map((item) => item.id))
  const { active, progress } = useScrollSpy(ids)

  return (
    <>
      <TocRail items={items} active={active} />
      <TocButton items={items} active={active} progress={progress} />
    </>
  )
}
