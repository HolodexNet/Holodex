import { useRef } from "react"
import { Link } from "react-router"
import { cn } from "cn"
import { ChannelAvatar } from "@/components/common/channel-avatar"
import {
  BroadcastIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PlayIcon,
} from "@/components/icons"
import { MusicArtwork } from "@/components/music/artwork"
import { MusicSectionHeading } from "@/components/music/page-header"
import { PlayPlaylistButton } from "@/components/music/play-playlist"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMusicPlaylist } from "@/lib/musicdex/format"
import type { MusicDiscovery, PlaylistStub } from "@/lib/musicdex/types"
import { useSettings } from "@/stores/settings"

export function MusicPlaylistCard({ playlist }: { playlist: PlaylistStub }) {
  const english = useSettings((s) => s.useEnglishName)
  const formatted = formatMusicPlaylist(playlist, english)
  return (
    <article
      className={cn(
        "music-collection-card group",
        formatted.radio && "music-radio-card"
      )}
    >
      <div className="relative">
        <Link
          to={formatted.href}
          className="music-cover-link"
          aria-label={formatted.title}
        >
          <MusicArtwork
            src={formatted.image}
            radio={formatted.radio}
            title={formatted.title}
            seed={playlist.id}
            label={formatted.coverLabel}
          />
        </Link>
        <PlayPlaylistButton playlist={playlist} className="music-card-play" />
      </div>
      <Link to={formatted.href} className="music-card-title">
        {formatted.title}
      </Link>
      <p className="music-card-caption">
        {formatted.radio && (
          <BroadcastIcon className="music-radio-icon" aria-hidden />
        )}
        {formatted.kind}
      </p>
    </article>
  )
}

export function PlaylistCards({
  title,
  playlists,
  grid = false,
  seeAll,
  description,
  loading = false,
}: {
  title: string
  playlists: PlaylistStub[]
  grid?: boolean
  seeAll?: string
  description?: string
  loading?: boolean
}) {
  const blocked = useSettings((s) => s.blockedChannels)
  const rail = useRef<HTMLDivElement>(null)
  const visible = [
    ...new Map(playlists.map((playlist) => [playlist.id, playlist])).values(),
  ].filter(
    (playlist) =>
      !playlist.art_context?.channels?.some((id) =>
        blocked.some((channel) => channel.id === id)
      )
  )
  if (!loading && !visible.length)
    return seeAll ? (
      <Link to={seeAll} className="music-text-link">
        Explore {title.toLowerCase()}
        <CaretRightIcon className="size-4" />
      </Link>
    ) : null
  const scroll = (direction: number) =>
    rail.current?.scrollBy({
      left: direction * rail.current.clientWidth * 0.85,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  return (
    <section className="min-w-0 space-y-5" aria-busy={loading}>
      <MusicSectionHeading title={title} description={description}>
        {seeAll && (
          <Link className="music-see-all" to={seeAll}>
            See all
            <CaretRightIcon className="size-3.5" />
          </Link>
        )}
        {!grid && (
          <div className="hidden gap-1 sm:flex">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Scroll ${title} left`}
              disabled={loading}
              onClick={() => scroll(-1)}
            >
              <CaretLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Scroll ${title} right`}
              disabled={loading}
              onClick={() => scroll(1)}
            >
              <CaretRightIcon />
            </Button>
          </div>
        )}
      </MusicSectionHeading>
      <div
        ref={rail}
        className={grid ? "music-collection-grid" : "music-collection-rail"}
      >
        {loading
          ? Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="music-collection-card"
                aria-hidden="true"
              >
                <Skeleton className="aspect-square rounded-xl" />
                <div className="music-card-title">
                  <Skeleton className="h-[1.5em] w-4/5" />
                </div>
                <div className="music-card-caption">
                  <Skeleton className="h-[1.6em] w-1/2" />
                </div>
              </div>
            ))
          : visible.map((playlist) => (
              <MusicPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
      </div>
    </section>
  )
}

export function DiscoverySections({
  discovery,
  scope,
  browse = false,
  loading = false,
}: {
  discovery?: MusicDiscovery
  scope: string
  browse?: boolean
  loading?: boolean
}) {
  const blocked = useSettings((s) => s.blockedChannels)
  const english = useSettings((s) => s.useEnglishName)
  const channels = (discovery?.channels ?? []).filter(
    (channel) => !blocked.some((item) => item.id === channel.id)
  )
  const playlists = discovery?.recommended?.playlists ?? []
  const streams = (discovery?.recentSingingStreams ?? []).filter(
    (stream) =>
      stream.playlist?.content?.length &&
      !blocked.some((channel) => channel.id === stream.video.channel?.id)
  )
  return (
    <div className="music-discovery-sections" aria-busy={loading}>
      {loading && (
        <span role="status" className="sr-only">
          Loading music discovery
        </span>
      )}
      <PlaylistCards
        title="Musicdex Mixes"
        description={
          scope === "this channel"
            ? "More of the voice you came for."
            : `A different way into ${scope === "Favorites" ? "your favorite voices" : scope}.`
        }
        seeAll={browse ? "/music/browse/sgp" : undefined}
        playlists={playlists.filter(
          (p) => p.type !== "ugp" && !p.type?.startsWith("radio")
        )}
        loading={loading}
      />
      <PlaylistCards
        title="Musicdex Radios"
        seeAll={browse ? "/music/radios" : undefined}
        playlists={playlists.filter((p) => p.type?.startsWith("radio"))}
        loading={loading}
      />
      {(loading || !!streams.length) && (
        <section className="min-w-0 space-y-5">
          <MusicSectionHeading
            title="Fresh from the stage"
            description="Latest songs"
          />
          <div className="music-session-rail">
            {loading &&
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="music-session-card"
                  aria-hidden="true"
                >
                  <Skeleton className="aspect-video rounded-xl" />
                  <div className="music-card-title">
                    <Skeleton className="h-[1.5em] w-4/5" />
                  </div>
                  <div className="music-session-artist">
                    <Skeleton className="size-5 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            {streams.map(({ video, playlist }) => {
              const formatted = formatMusicPlaylist(playlist!, english)
              return (
                <article className="music-session-card group" key={video.id}>
                  <div className="relative">
                    <Link to={formatted.href} className="music-session-image">
                      <img
                        src={`https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                      />
                      <span className="music-session-badge">
                        <PlayIcon className="size-3" />
                        {playlist!.content!.length}{" "}
                        {playlist!.content!.length === 1
                          ? "performance"
                          : "performances"}
                      </span>
                    </Link>
                    <PlayPlaylistButton
                      playlist={playlist!}
                      className="music-card-play"
                    />
                  </div>
                  <Link to={formatted.href} className="music-card-title">
                    {video.title || formatted.title}
                  </Link>
                  {video.channel && (
                    <Link
                      to={`/channel/${encodeURIComponent(video.channel.id)}/music`}
                      className="music-session-artist"
                    >
                      <ChannelAvatar channel={video.channel} size={20} />
                      <span>
                        {(english && video.channel.english_name) ||
                          video.channel.name}
                      </span>
                    </Link>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}
      <PlaylistCards
        title="From one fan to another"
        description="Fan-curated collections."
        seeAll={browse ? "/music/browse/ugp" : undefined}
        playlists={playlists.filter((p) => p.type === "ugp")}
        loading={loading}
      />
      {(loading || !!channels.length) && (
        <section className="min-w-0 space-y-5">
          <MusicSectionHeading title="Meet your next favorite voice" />
          <div className="music-artist-rail">
            {loading &&
              Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className="music-artist-card"
                  aria-hidden="true"
                >
                  <Skeleton className="music-artist-photo size-25 rounded-full" />
                  <div className="music-card-title w-4/5">
                    <Skeleton className="h-[1.5em] w-full" />
                  </div>
                  <div className="music-card-caption w-3/5">
                    <Skeleton className="h-[1.6em] w-full" />
                  </div>
                </div>
              ))}
            {channels.map((channel) => (
              <Link
                to={`/channel/${encodeURIComponent(channel.id)}/music`}
                key={channel.id}
                className="music-artist-card"
              >
                <ChannelAvatar
                  channel={channel}
                  size={100}
                  className="music-artist-photo"
                />
                <span className="music-card-title">
                  {(english && channel.english_name) || channel.name}
                </span>
                <span className="music-card-caption">
                  {channel.song_count.toLocaleString()} performances
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
