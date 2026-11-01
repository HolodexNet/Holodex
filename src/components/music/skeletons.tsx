import { cn } from "cn"
import { Skeleton } from "@/components/ui/skeleton"
import "./skeletons.css"

function TrackRowsSkeleton({
  label,
  rows = 8,
  popular = false,
}: {
  label: string
  rows?: number
  popular?: boolean
}) {
  return (
    <div role="status" aria-label={label} className="music-skeleton-tracks">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={cn(
            "music-skeleton-track",
            popular && "music-skeleton-track-popular"
          )}
        >
          <Skeleton className="music-skeleton-index" />
          <Skeleton className="music-skeleton-art" />
          <div className="music-skeleton-track-meta">
            <Skeleton className="music-skeleton-track-title" />
            <Skeleton className="music-skeleton-track-artist" />
          </div>
          <Skeleton className="music-skeleton-track-time" />
        </div>
      ))}
    </div>
  )
}

/** Playlist and radio pages: hero, action row, then the track list. */
export function MusicDetailSkeleton({ radio = false }: { radio?: boolean }) {
  return (
    <>
      <header
        className="relative isolate flex items-center gap-8 overflow-hidden rounded-[20px] bg-[color-mix(in_oklch,var(--complement-soft)_20%,var(--card))] p-8 max-md:block max-md:p-6"
        aria-hidden="true"
      >
        <div className="w-[clamp(160px,20vw,230px)] shrink-0 rounded-[12px] shadow-[0_12px_30px_#0003] max-md:mx-auto max-md:mb-6.25 max-md:w-42.5">
          <Skeleton className="music-skeleton-cover" />
        </div>
        <div className="music-skeleton-copy relative min-w-0">
          <Skeleton className="music-skeleton-eyebrow" />
          <Skeleton className="music-skeleton-title" />
          <Skeleton className="music-skeleton-line-long" />
          <Skeleton className="music-skeleton-line-short" />
          <Skeleton className="music-skeleton-meta" />
        </div>
      </header>
      <div
        className="flex flex-wrap items-center gap-2.5 border-b border-border pt-1 pb-4"
        aria-hidden="true"
      >
        <Skeleton className="music-skeleton-button-primary" />
        <Skeleton className="music-skeleton-button-secondary" />
      </div>
      <TrackRowsSkeleton label={radio ? "Loading radio" : "Loading playlist"} />
    </>
  )
}

/** Liked songs page: play-all row, then the track list. */
export function MusicLikedSkeleton() {
  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2.5 border-b border-border pt-1 pb-4"
        aria-hidden="true"
      >
        <Skeleton className="music-skeleton-button-primary" />
      </div>
      <TrackRowsSkeleton label="Loading liked songs" />
    </>
  )
}

/** Popular songs on a channel's music tab. */
export function PopularSkeleton() {
  return <TrackRowsSkeleton label="Loading popular songs" rows={5} popular />
}

/** Artist shelves on a channel's music tab. */
export function ChannelDiscoverySkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading artist collections"
      className="music-skeleton-stack"
    >
      <span className="sr-only">Loading artist collections</span>
      {Array.from({ length: 2 }, (_, shelf) => (
        <section
          key={shelf}
          className="music-skeleton-shelf"
          aria-hidden="true"
        >
          <Skeleton className="music-skeleton-heading" />
          <div className="music-skeleton-rail">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="music-skeleton-card" key={index}>
                <Skeleton className="music-skeleton-card-art" />
                <Skeleton className="music-skeleton-card-title" />
                <Skeleton className="music-skeleton-card-caption" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** Channel music tab while its overview loads, before the lazy chunk arrives. */
export function ChannelMusicSkeleton() {
  return (
    <div className="music-skeleton-stack">
      <section className="music-skeleton-shelf">
        <Skeleton className="music-skeleton-heading" aria-hidden="true" />
        <PopularSkeleton />
      </section>
      <ChannelDiscoverySkeleton />
    </div>
  )
}
