import type { ReactNode } from "react"
import { Link, useLocation } from "react-router"
import { cn } from "cn"
import { MagnifyingGlassIcon, MusicNotesFillIcon } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

const navLinkClass =
  "relative inline-flex items-center py-[5px] whitespace-nowrap text-[12px] font-[550] text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-foreground max-md:text-[11px]"
const navLinkActiveClass =
  "text-foreground after:absolute after:-bottom-4.5 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-[''] max-md:after:-bottom-3"

export const musicCollectionGridClass =
  "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-5 gap-y-7 max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-6"

export function MusicNavigation() {
  const { pathname } = useLocation()
  const items = [
    ["Discover", "/#music"],
    ["Favorites", "/favorites#music"],
    ["Radio", "/music/radios"],
    ["Musicdex Playlists", "/music/playlists"],
  ]
  return (
    <nav
      aria-label="Musicdex navigation"
      className="flex min-w-0 items-center gap-6 border-b border-border pb-4.5 max-[1101px]:gap-4 max-md:block max-md:pb-0"
    >
      <Link
        to="/#music"
        aria-label="Musicdex home"
        className="inline-flex items-center gap-2 text-[18px] font-[750] tracking-tighter max-[1101px]:text-[16px] max-md:mb-3.75"
      >
        <MusicNotesFillIcon className="size-4 text-brand" />
        <span>
          musicdex<span className="text-brand">.</span>
        </span>
      </Link>
      <div className="ml-auto flex scrollbar-none items-center gap-6 overflow-x-auto max-[1101px]:gap-4.5 max-md:m-0 max-md:gap-6 max-md:pb-3">
        {items.map(([label, to]) => {
          const active =
            to === "/music"
              ? pathname === to ||
                pathname.startsWith("/music/org/") ||
                pathname.startsWith("/music/browse/")
              : pathname === to ||
                (to === "/music/radios" &&
                  pathname.startsWith("/music/radio/")) ||
                (to === "/music/playlists" &&
                  pathname.startsWith("/music/playlist/"))
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(navLinkClass, active && navLinkActiveClass)}
            >
              {label}
            </Link>
          )
        })}
        <Link
          to="/music/search"
          aria-label="Search music"
          className={cn(
            navLinkClass,
            pathname === "/music/search" && navLinkActiveClass
          )}
        >
          <MagnifyingGlassIcon className="size-4" />
        </Link>
      </div>
    </nav>
  )
}

export function MusicSectionHeading({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="music-section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  )
}

export function MusicLoading({ label = "Loading music" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-6 w-44" />
      <div className={musicCollectionGridClass}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
