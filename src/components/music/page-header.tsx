import type { ReactNode } from "react"
import { Link, useLocation } from "react-router"
import { cn } from "cn"
import { MagnifyingGlassIcon, MusicalNotesIcon } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

export function MusicNavigation() {
  const { pathname } = useLocation()
  const items = [
    ["Discover", "/music"],
    ["Favorites", "/music/favorites"],
    ["Radio", "/music/radios"],
    ["Musicdex Playlists", "/music/playlists"],
  ]
  return (
    <nav aria-label="Musicdex navigation" className="music-navigation">
      <Link to="/music" aria-label="Musicdex home" className="music-wordmark">
        <MusicalNotesIcon className="size-4 text-brand" />
        <span>
          musicdex<span className="text-brand">.</span>
        </span>
      </Link>
      <div className="music-navigation-links">
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
              className={cn("music-navigation-link", active && "is-active")}
            >
              {label}
            </Link>
          )
        })}
        <Link
          to="/music/search"
          aria-label="Search music"
          className={cn(
            "music-navigation-link",
            pathname === "/music/search" && "is-active"
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
      <div className="music-collection-grid">
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
