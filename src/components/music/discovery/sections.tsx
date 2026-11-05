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
import {
  MusicSectionHeading,
  musicCollectionGridClass,
} from "@/components/music/page-header"
import { PlayPlaylistButton } from "@/components/music/play-playlist"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMusicPlaylist } from "@/lib/musicdex/format"
import type { MusicDiscovery, PlaylistStub } from "@/lib/musicdex/types"
import { useSettings } from "@/stores/settings"

const railClass =
  "flex min-w-0 max-w-full snap-x snap-proximity scrollbar-none gap-5 overflow-x-auto px-px pt-[5px] pb-3 [&::-webkit-scrollbar]:hidden"
const collectionRailCardClass =
  "w-[clamp(160px,16vw,206px)] shrink-0 snap-start max-md:w-[150px]"

export const musicCardTitleClass =
  "line-clamp-2 mt-[13px] text-[13px] font-semibold leading-normal tracking-[-0.015em] transition-colors duration-200 ease-[ease] max-md:mt-2.5 max-md:text-[12px]"

export const musicCardCaptionClass =
  "flex items-center gap-1.5 mt-1 text-[11px] leading-[1.6] text-muted-foreground max-md:text-[10px]"

export const musicCardPlayClass =
  "absolute bottom-3 right-3 z-4 size-[42px] translate-y-2 opacity-0 shadow-[0_5px_16px_#0005] transition-[opacity,translate] duration-200 ease-[ease] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:right-[9px] [@media(hover:none)]:bottom-[9px] [@media(hover:none)]:size-[34px] [@media(hover:none)]:translate-none [@media(hover:none)]:opacity-100"

export const musicArtistCardClass =
  "group/artist flex w-[136px] shrink-0 flex-col items-center py-1 text-center"

export const musicArtistPhotoClass =
  "shadow-[0_0_0_5px_color-mix(in_oklch,var(--foreground)_3%,transparent)] transition-[box-shadow,translate] duration-250 ease-[ease] group-hover/artist:-translate-y-[3px] group-hover/artist:shadow-[0_0_0_5px_color-mix(in_oklch,var(--primary)_18%,transparent)] motion-reduce:transition-none"

export function MusicPlaylistCard({
  playlist,
  className,
}: {
  playlist: PlaylistStub
  className?: string
}) {
  const english = useSettings((s) => s.useEnglishName)
  const formatted = formatMusicPlaylist(playlist, english)
  return (
    <article
      className={cn(
        "music-collection-card group min-w-0",
        className,
        formatted.radio && "music-radio-card"
      )}
    >
      <div className="relative">
        <Link
          to={formatted.href}
          className="block rounded-[12px] outline-offset-4"
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
        <PlayPlaylistButton
          playlist={playlist}
          className={musicCardPlayClass}
        />
      </div>
      <Link
        to={formatted.href}
        className={cn(musicCardTitleClass, "hover:text-brand")}
      >
        {formatted.title}
      </Link>
      <p className={musicCardCaptionClass}>
        {formatted.radio && (
          <BroadcastIcon className="size-3 flex-none text-brand" aria-hidden />
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
      <Link
        to={seeAll}
        className="inline-flex items-center gap-1.75 text-[12px] font-semibold text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-brand"
      >
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
          <Link
            className="inline-flex items-center gap-1.75 text-[12px] font-semibold text-muted-foreground transition-[color] duration-200 ease-[ease] hover:text-brand"
            to={seeAll}
          >
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
        className={
          grid
            ? musicCollectionGridClass
            : cn(
                railClass,
                "max-md:-mr-4 max-md:max-w-[calc(100%_+_16px)] max-md:gap-4 max-md:pr-4"
              )
        }
      >
        {loading
          ? Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  "music-collection-card min-w-0",
                  !grid && collectionRailCardClass
                )}
                aria-hidden="true"
              >
                <Skeleton className="aspect-square rounded-xl" />
                <div className={musicCardTitleClass}>
                  <Skeleton className="h-[1.5em] w-4/5" />
                </div>
                <div className={musicCardCaptionClass}>
                  <Skeleton className="h-[1.6em] w-1/2" />
                </div>
              </div>
            ))
          : visible.map((playlist) => (
              <MusicPlaylistCard
                key={playlist.id}
                playlist={playlist}
                className={!grid ? collectionRailCardClass : undefined}
              />
            ))}
      </div>
    </section>
  )
}

export type DiscoveryScope =
  { type: "org"; name: string } | { type: "favorites" }

export function DiscoverySections({
  discovery,
  scope,
  browse = false,
  loading = false,
}: {
  discovery?: MusicDiscovery
  scope: DiscoveryScope
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
    <div className="grid min-w-0 gap-11 max-md:gap-8" aria-busy={loading}>
      {loading && (
        <span role="status" className="sr-only">
          Loading music discovery
        </span>
      )}
      <PlaylistCards
        title={
          scope.type === "favorites" ? "Oshi Mixes" : `${scope.name} Mixes`
        }
        seeAll={browse ? "/music/browse/sgp" : undefined}
        playlists={playlists.filter(
          (p) => p.type !== "ugp" && !p.type?.startsWith("radio")
        )}
        loading={loading}
      />
      <PlaylistCards
        title={
          scope.type === "favorites" ? "Oshi Radios" : `${scope.name} Radios`
        }
        seeAll={browse ? "/#radio" : undefined}
        playlists={playlists.filter((p) => p.type?.startsWith("radio"))}
        loading={loading}
      />
      {(loading || !!streams.length) && (
        <section className="min-w-0 space-y-5">
          <MusicSectionHeading
            title="Fresh from the stage"
            description="Latest songs"
          />
          <div className={railClass}>
            {loading &&
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="w-[min(340px,80%)] shrink-0 snap-start"
                  aria-hidden="true"
                >
                  <Skeleton className="aspect-video rounded-xl" />
                  <div className={musicCardTitleClass}>
                    <Skeleton className="h-[1.5em] w-4/5" />
                  </div>
                  <div className="mt-2 flex items-center gap-1.75 text-[11px] text-muted-foreground">
                    <Skeleton className="size-5 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            {streams.map(({ video, playlist }) => {
              const formatted = formatMusicPlaylist(playlist!, english)
              return (
                <article
                  className="group w-[min(340px,80%)] shrink-0 snap-start"
                  key={video.id}
                >
                  <div className="relative">
                    <Link
                      to={formatted.href}
                      className="relative block aspect-video overflow-hidden rounded-[12px] bg-muted"
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 ease-[ease] group-hover:scale-[1.035]"
                        loading="lazy"
                      />
                      <span className="absolute bottom-[10px] left-[10px] flex items-center gap-[5px] rounded-[5px] bg-[#0009] px-[7px] py-[5px] text-[9px] font-semibold text-white backdrop-blur-[10px]">
                        <PlayIcon className="size-3" />
                        {playlist!.content!.length}{" "}
                        {playlist!.content!.length === 1
                          ? "performance"
                          : "performances"}
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
                  {video.channel && (
                    <Link
                      to={`/channel/${encodeURIComponent(video.channel.id)}/music`}
                      className="mt-2 flex items-center gap-1.75 text-[11px] text-muted-foreground"
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
        title="From the community"
        description="Fan-curated collections."
        seeAll={browse ? "/music/browse/ugp" : undefined}
        playlists={playlists.filter((p) => p.type === "ugp")}
        loading={loading}
      />
      {(loading || !!channels.length) && (
        <section className="min-w-0 space-y-5">
          <MusicSectionHeading title="Meet your next favorite voice" />
          <div className={railClass}>
            {loading &&
              Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className={cn("music-artist-card", musicArtistCardClass)}
                  aria-hidden="true"
                >
                  <Skeleton
                    className={cn(
                      musicArtistPhotoClass,
                      "size-25 rounded-full"
                    )}
                  />
                  <div className={cn(musicCardTitleClass, "w-4/5")}>
                    <Skeleton className="h-[1.5em] w-full" />
                  </div>
                  <div className={cn(musicCardCaptionClass, "w-3/5")}>
                    <Skeleton className="h-[1.6em] w-full" />
                  </div>
                </div>
              ))}
            {channels.map((channel) => (
              <Link
                to={`/channel/${encodeURIComponent(channel.id)}/music`}
                key={channel.id}
                className={cn("music-artist-card", musicArtistCardClass)}
              >
                <ChannelAvatar
                  channel={channel}
                  size={100}
                  className={musicArtistPhotoClass}
                />
                <span className={musicCardTitleClass}>
                  {(english && channel.english_name) || channel.name}
                </span>
                <span className={musicCardCaptionClass}>
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
