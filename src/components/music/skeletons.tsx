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
      <header className="music-detail-hero" aria-hidden="true">
        <div className="music-detail-cover">
          <Skeleton className="music-skeleton-cover" />
        </div>
        <div className="music-detail-copy music-skeleton-copy">
          <Skeleton className="music-skeleton-eyebrow" />
          <Skeleton className="music-skeleton-title" />
          <Skeleton className="music-skeleton-line-long" />
          <Skeleton className="music-skeleton-line-short" />
          <Skeleton className="music-skeleton-meta" />
        </div>
      </header>
      <div className="music-detail-controls" aria-hidden="true">
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
      <div className="music-detail-controls" aria-hidden="true">
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
