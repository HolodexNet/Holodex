import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "cn"
import { ChannelAvatar } from "@/components/common/channel-avatar"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  CaretLeftIcon,
  CaretRightIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  PlaylistIcon,
} from "@/components/icons"
import { MusicArtwork } from "@/components/music/artwork"
import {
  MusicPlaylistCard,
  musicArtistCardClass,
  musicArtistPhotoClass,
  musicCardCaptionClass,
  musicCardPlayClass,
  musicCardTitleClass,
} from "@/components/music/discovery/sections"
import { MusicSectionHeading } from "@/components/music/page-header"
import { PlayPlaylistButton } from "@/components/music/play-playlist"
import {
  ChannelDiscoverySkeleton,
  PopularSkeleton,
} from "@/components/music/skeletons"
import { SongList } from "@/components/music/song-list"
import { Button } from "@/components/ui/button"
import { intlLocale } from "@/lib/i18n"
import { musicApi } from "@/lib/musicdex/api"
import { formatMusicPlaylist } from "@/lib/musicdex/format"
import { useMusicDiscovery, useMusicTrending } from "@/lib/musicdex/queries"
import type { Channel } from "@/lib/types"
import { channelName } from "@/lib/video"
import { useMusicPlayer } from "@/stores/music-player"
import { useSettings } from "@/stores/settings"
import "./channel-music.css"

/** Channels use an artist overview, rather than the organization's discovery feed. */
export function ChannelMusic({ channel }: { channel: Channel }) {
  const [params] = useSearchParams()
  return params.get("songs") === "all" ? (
    <ChannelSongs key={channel.id} channel={channel} />
  ) : (
    <ChannelMusicOverview key={channel.id} channel={channel} />
  )
}

/** Show carousel controls only when this particular shelf actually overflows. */
function ChannelShelf({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  const rail = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ back: false, forward: false })
  useEffect(() => {
    const element = rail.current
    if (!element) return
    const update = () => {
      const back = element.scrollLeft > 2
      const forward =
        element.scrollWidth - element.clientWidth - element.scrollLeft > 2
      setEdges((previous) =>
        previous.back === back && previous.forward === forward
          ? previous
          : { back, forward }
      )
    }
    const observer = new ResizeObserver(update)
    observer.observe(element)
    for (const child of element.children) observer.observe(child)
    element.addEventListener("scroll", update, { passive: true })
    return () => {
      observer.disconnect()
      element.removeEventListener("scroll", update)
    }
  }, [count])
  const scroll = (direction: number) =>
    rail.current?.scrollBy({
      left: direction * rail.current.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  return (
    <section className="music-channel-shelf">
      <MusicSectionHeading title={title}>
        {(edges.back || edges.forward) && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Scroll ${title} left`}
              disabled={!edges.back}
              onClick={() => scroll(-1)}
            >
              <CaretLeftIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Scroll ${title} right`}
              disabled={!edges.forward}
              onClick={() => scroll(1)}
            >
              <CaretRightIcon />
            </Button>
          </div>
        )}
      </MusicSectionHeading>
      <div ref={rail} className="music-channel-rail">
        {children}
      </div>
    </section>
  )
}

function ChannelMusicOverview({ channel }: { channel: Channel }) {
  const [expanded, setExpanded] = useState(false)
  const english = useSettings((s) => s.useEnglishName)
  const lang = useSettings((s) => s.lang)
  const blocked = useSettings((s) => s.blockedChannels)
  const discovery = useMusicDiscovery({ channelId: channel.id })
  const trending = useMusicTrending({ channel_id: channel.id })
  const name = channelName(channel, english)
  const base = `/channel/${encodeURIComponent(channel.id)}/music`
  const search = `/music/search?${new URLSearchParams({ channelId: channel.id })}`
  const popular = (trending.data ?? []).filter(
    (song) => !blocked.some((item) => item.id === song.channel_id)
  )
  const streams = (discovery.data?.recentSingingStreams ?? []).filter(
    ({ video, playlist }) =>
      playlist?.content?.length &&
      !blocked.some((item) => item.id === video.channel?.id)
  )
  const collections = [
    ...new Map(
      (discovery.data?.recommended?.playlists ?? []).map((playlist) => [
        playlist.id,
        playlist,
      ])
    ).values(),
  ].filter(
    (playlist) =>
      !playlist.art_context?.channels?.some((id) =>
        blocked.some((item) => item.id === id)
      )
  )
  const related = (discovery.data?.channels ?? [])
    .filter(
      (item) =>
        item.id !== channel.id &&
        !blocked.some((blocked) => blocked.id === item.id)
    )
    .slice(0, 10)
  const popularCount = Math.min(popular.length, 10)
  const noMusic =
    trending.isSuccess &&
    discovery.isSuccess &&
    !popular.length &&
    !streams.length &&
    !collections.length
  const date = (value: string | number | null | undefined) => {
    if (value == null) return null
    const parsed = new Date(value)
    return Number.isFinite(parsed.getTime())
      ? parsed.toLocaleDateString(intlLocale(lang), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null
  }
  return (
    <div className="music-channel-overview">
      {(trending.isPending || trending.isError || popular.length > 0) && (
        <section className="music-channel-popular">
          <MusicSectionHeading title="Popular">
            {!!popular.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  useMusicPlayer.getState().queueSongs(popular)
                  toast.success(`Added ${popular.length} songs to the queue`)
                }}
              >
                <PlaylistIcon />
                Queue ({popular.length})
              </Button>
            )}
          </MusicSectionHeading>
          {trending.isPending ? (
            <PopularSkeleton />
          ) : trending.isError ? (
            <ErrorMessage
              error={trending.error}
              onRetry={() => void trending.refetch()}
            />
          ) : (
            <SongList
              songs={popular}
              preview={expanded ? popularCount : Math.min(5, popularCount)}
              previewLayout="list"
              contextChannelId={channel.id}
              source={{
                id: `channel:${channel.id}:popular`,
                title: `${name} · Popular`,
              }}
            />
          )}
          <div className="music-channel-popular-footer">
            {popularCount > 5 && (
              <Button
                size="sm"
                variant="ghost"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            )}
            <div className="music-channel-catalog-links">
              <Link
                to={search}
                className="music-text-link inline-flex items-center gap-1.75 text-[12px] font-semibold text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-brand"
              >
                <MagnifyingGlassIcon className="size-4" />
                Search songs
              </Link>
              <Link
                to={`${base}?songs=all`}
                className="music-text-link inline-flex items-center gap-1.75 text-[12px] font-semibold text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-brand"
              >
                <ListBulletsIcon className="size-4" />
                See all songs
              </Link>
            </div>
          </div>
        </section>
      )}
      {noMusic && (
        <StateMessage
          title="No music indexed yet"
          description={`Indexed performances from ${name} will appear here.`}
        />
      )}
      {discovery.isPending ? (
        <ChannelDiscoverySkeleton />
      ) : discovery.isError ? (
        <ErrorMessage
          error={discovery.error}
          onRetry={() => void discovery.refetch()}
        />
      ) : (
        <>
          {!!streams.length && (
            <ChannelShelf title="Latest streams" count={streams.length}>
              {streams.map(({ video, playlist }) => {
                const formatted = formatMusicPlaylist(playlist!, english)
                const performed = date(video.available_at ?? video.published_at)
                const count = playlist!.content!.length
                return (
                  <article
                    key={video.id}
                    className="music-collection-card music-channel-stream group min-w-0"
                  >
                    <div className="relative">
                      <Link
                        to={formatted.href}
                        className="block rounded-[12px] outline-offset-4"
                        aria-label={video.title || formatted.title}
                      >
                        <MusicArtwork
                          src={`https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`}
                          title={video.title || formatted.title}
                          seed={video.id}
                        />
                        <span className="music-channel-stream-count">
                          {count} {count === 1 ? "song" : "songs"}
                        </span>
                      </Link>
                      <PlayPlaylistButton
                        playlist={playlist!}
                        className={musicCardPlayClass}
                      />
                    </div>
                    <Link
                      to={formatted.href}
                      className={cn(musicCardTitleClass, "hover:text-brand")}
                    >
                      {video.title || formatted.title}
                    </Link>
                    {performed && (
                      <p className={musicCardCaptionClass}>
                        Performed {performed}
                      </p>
                    )}
                  </article>
                )
              })}
            </ChannelShelf>
          )}
          {!!collections.length && (
            <ChannelShelf
              title={`Featuring ${name}`}
              count={collections.length}
            >
              {collections.map((playlist) => (
                <MusicPlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </ChannelShelf>
          )}
          {!!related.length && (
            <ChannelShelf
              title={
                channel.org
                  ? `Discover more from ${channel.org}`
                  : "Discover more artists"
              }
              count={related.length}
            >
              {related.map((artist) => (
                <Link
                  to={`/channel/${encodeURIComponent(artist.id)}/music`}
                  key={artist.id}
                  className={cn("music-artist-card", musicArtistCardClass)}
                >
                  <ChannelAvatar
                    channel={artist}
                    size={100}
                    className={musicArtistPhotoClass}
                  />
                  <span className={musicCardTitleClass}>
                    {channelName(artist, english)}
                  </span>
                  <span className={musicCardCaptionClass}>
                    {artist.song_count.toLocaleString()} performances
                  </span>
                </Link>
              ))}
            </ChannelShelf>
          )}
        </>
      )}
    </div>
  )
}

function ChannelSongs({ channel }: { channel: Channel }) {
  const [params, setParams] = useSearchParams()
  const english = useSettings((s) => s.useEnglishName)
  const blocked = useSettings((s) => s.blockedChannels)
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1)
  const name = channelName(channel, english)
  const query = useQuery({
    queryKey: ["musicdex", "latest", channel.id, page - 1],
    queryFn: ({ signal }) =>
      musicApi.latest(
        {
          channel_id: channel.id,
          paginated: true,
          limit: 24,
          offset: (page - 1) * 24,
        },
        signal
      ),
  })
  const changePage = (next: number) => {
    const updated = new URLSearchParams(params)
    if (next === 1) updated.delete("page")
    else updated.set("page", String(next))
    setParams(updated, { preventScrollReset: true })
  }
  return (
    <section className="music-channel-catalog space-y-5">
      <Link
        to={`/channel/${encodeURIComponent(channel.id)}/music`}
        className="inline-flex items-center gap-1.75 text-[12px] font-semibold text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-brand"
      >
        <CaretLeftIcon className="size-4" />
        Back to music overview
      </Link>
      <MusicSectionHeading
        title="All songs"
        description={
          query.data
            ? `${Number(query.data.total).toLocaleString()} indexed performances from ${name}.`
            : undefined
        }
      >
        <Link
          className="inline-flex items-center gap-1.75 text-[12px] font-semibold text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-brand"
          to={`/music/search?${new URLSearchParams({ channelId: channel.id })}`}
        >
          <MagnifyingGlassIcon className="size-4" />
          Search songs
        </Link>
      </MusicSectionHeading>
      {query.isPending ? (
        <PopularSkeleton />
      ) : query.isError ? (
        <ErrorMessage
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <>
          <SongList
            songs={query.data.items.filter(
              (song) => !blocked.some((item) => item.id === song.channel_id)
            )}
            contextChannelId={channel.id}
            indexOffset={(page - 1) * 24}
            source={{
              id: `channel:${channel.id}:songs:${page}`,
              title: `${name} · All songs`,
            }}
          />
          <nav
            aria-label="Song pages"
            className="flex items-center justify-between gap-3 border-t pt-4"
          >
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => changePage(page - 1)}
            >
              <CaretLeftIcon />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page}
              {Number(query.data.total) > 0
                ? ` of ${Math.ceil(Number(query.data.total) / 24)}`
                : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 24 >= Number(query.data.total)}
              onClick={() => changePage(page + 1)}
            >
              Next
              <CaretRightIcon />
            </Button>
          </nav>
        </>
      )}
    </section>
  )
}
