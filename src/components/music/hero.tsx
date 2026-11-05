import { Link } from "react-router"
import { toast } from "sonner"
import { cn } from "cn"
import { CaretRightIcon, MagnifyingGlassIcon, PlayIcon, PlusIcon } from "@/components/icons"
import { MusicArtwork } from "@/components/music/artwork"
import type { DiscoveryScope } from "@/components/music/discovery/sections"
import { PlayPlaylistButton } from "@/components/music/play-playlist"
import { PauseIcon } from "@/components/music/player/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { ALL_VTUBERS } from "@/lib/consts"
import { formatMusicPlaylist } from "@/lib/musicdex/format"
import type { PlaylistStub, Song } from "@/lib/musicdex/types"
import { useMusicPlayer, type MusicSource } from "@/stores/music-player"
import { useSettings } from "@/stores/settings"

export function PlaySongsButton({
  songs,
  source,
  label = "Play all",
}: {
  songs: Song[]
  source: MusicSource
  label?: string
}) {
  const active = useMusicPlayer(
    (s) => s.source?.id === source.id && !!s.current
  )
  const playing = useMusicPlayer((s) => s.source?.id === source.id && s.playing)
  return (
    <Button
      disabled={!songs.length}
      onClick={() =>
        active
          ? useMusicPlayer.getState().toggle()
          : useMusicPlayer.getState().playSongs(songs, { source })
      }
      className="gap-2"
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
      {playing ? "Pause" : label}
    </Button>
  )
}

export function AddToQueueButton({
  songs,
  label = "Add to queue",
}: {
  songs: Song[]
  label?: string
}) {
  return (
    <Button
      variant="outline"
      disabled={!songs.length}
      onClick={() => {
        useMusicPlayer.getState().addToQueue(songs)
        toast.success(
          songs.length === 1
            ? "Added 1 song to queue"
            : `Added ${songs.length} songs to queue`
        )
      }}
      className="gap-2"
    >
      <PlusIcon /> {label}
    </Button>
  )
}

const heroCover =
  "absolute max-w-[280px] transition-[transform] duration-[0.35s] ease-[ease] motion-reduce:transition-none [&_.music-artwork]:!rounded-[9px] [&_.music-artwork]:border-5 [&_.music-artwork]:border-solid [&_.music-artwork]:border-[color-mix(in_oklch,var(--card)_90%,transparent)] [&_.music-artwork]:shadow-[0_20px_36px_#0004]"
const heroCoverLayout = [
  "top-10 left-[10%] z-3 w-[53%] [transform:rotate(-8deg)] [&:hover]:[transform:rotate(-3deg)_translateY(-5px)] max-md:top-[18px] max-md:left-[18%] max-md:w-[45%]",
  "top-[62px] left-[33%] z-2 w-[48%] [transform:rotate(9deg)] max-md:top-[30px] max-md:left-[40%] max-md:w-[41%]",
  "top-[86px] left-[51%] z-1 w-[40%] opacity-75 [transform:rotate(19deg)] max-md:top-[52px] max-md:left-[58%] max-md:w-[32%]",
]
const heroCaption =
  "absolute z-4 flex min-w-0 items-center gap-2.5 bottom-[23px] left-[7%] right-[8%] text-[12px] font-[550] [&_.music-eyebrow]:shrink-0 [&_.music-eyebrow]:!text-[8px] [&_.music-eyebrow]:!tracking-[0.09em] max-[1101px]:[&_.music-eyebrow]:!hidden max-md:bottom-[15px] max-md:left-[18%]"

export function MusicHero({
  scope,
  playlists,
  favorites = false,
  songs = [],
  loading = false,
}: {
  scope: Extract<DiscoveryScope, { type: "org" | "favorites" }>
  playlists: PlaylistStub[]
  favorites?: boolean
  songs?: Song[]
  loading?: boolean
}) {
  const english = useSettings((s) => s.useEnglishName)
  const blocked = useSettings((s) => s.blockedChannels)
  const picks = playlists.filter(
    (playlist) =>
      playlist.type !== "ugp" &&
      !playlist.art_context?.channels?.some((id) =>
        blocked.some((channel) => channel.id === id)
      )
  )
  const featured =
    picks.find(
      (playlist) =>
        playlist.id.startsWith(":mv[") && playlist.id.includes("random")
    ) ||
    picks.find((playlist) => playlist.id.startsWith(":weekly")) ||
    picks[0]
  const formatted = featured ? formatMusicPlaylist(featured, english) : null
  const covers = featured
    ? [
      featured,
      ...picks.filter((playlist) => playlist.id !== featured.id),
    ].slice(0, 3)
    : []
  const label = scope.type === "org" ? scope.name : "Favorites"
  return (
    <section className="relative isolate grid min-h-87.5 grid-cols-[1.1fr_1fr] overflow-clip rounded-[22px] border border-[color-mix(in_oklch,var(--complement)_13%,var(--border))] bg-[color-mix(in_oklch,var(--complement-soft)_22%,var(--card))] before:absolute before:right-[-8%] before:bottom-[-65%] before:-z-1 before:aspect-square before:w-[45%] before:rounded-full before:bg-primary before:opacity-[0.14] before:blur-[100px] before:content-[''] max-md:grid-cols-[minmax(0,1fr)]">
      <div className="relative z-5 flex flex-col items-start px-[clamp(24px,3vw,48px)] py-12 max-md:px-6">
        {/* Bold Title */}
        <h1 className="mt-4 max-w-2xl text-[clamp(36px,4.5vw,64px)] font-black tracking-tight leading-[1.05] text-balance">
          Music<span className="text-brand">dex</span> is all about <span className="text-brand">{
            favorites ? "your oshis" : label
          }</span>
        </h1>

        {/* Detailed Metadata Subtext */}
        <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground/90 max-md:hidden">
          {favorites
            ? "Jump straight into your bookmarked performances, saved karaoke streams, and favorite VTuber tracks."
            : "Listen and assemble playlists from their singing streams and YouTube uploads, thanks to our community-submitted tags."}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {favorites && songs.length ? (
            <PlaySongsButton
              songs={songs}
              source={{ id: "liked", title: "Liked songs" }}
              label="Queue Saved Tracks"
            />
          ) : featured ? (
            <PlayPlaylistButton
              playlist={featured}
              label={formatted?.radio ? "Launch Talent Radio" : "Play Curator Mix"}
            />
          ) : loading ? (
            <Button disabled className="gap-2">
              <Spinner /> Indexing tracks...
            </Button>
          ) : (
            <Button nativeButton={false} render={<Link to="/music/search" />}>
              <MagnifyingGlassIcon className="size-4" /> Search VTubers or MVs
            </Button>
          )}

          <Link
            to={favorites ? "/music/liked" : "/#radio"}
            className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            {favorites ? "Manage Library" : "Explore Radios & Tags"}
            <CaretRightIcon className="size-4 opacity-70" />
          </Link>
        </div>
      </div>
      <div className="relative min-h-85 min-w-0 max-md:mx-4 max-md:min-h-50">
        <div
          className="absolute top-[-15%] left-[10%] aspect-square w-[85%] rounded-full border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] shadow-[0_0_0_38px_color-mix(in_oklch,var(--foreground)_2%,transparent),0_0_0_76px_color-mix(in_oklch,var(--foreground)_2%,transparent)] max-md:-top-6.25 max-md:left-[20%] max-md:w-[75%]"
          aria-hidden="true"
        />
        {covers.length ? (
          covers.map((playlist, index) => {
            const cover = formatMusicPlaylist(playlist, english)
            return (
              <Link
                to={cover.href}
                key={playlist.id}
                className={cn(heroCover, heroCoverLayout[index])}
                aria-label={
                  index === 0
                    ? `Featured collection: ${cover.title}`
                    : cover.title
                }
                tabIndex={index === 0 ? undefined : -1}
              >
                <MusicArtwork
                  src={cover.image}
                  title={cover.title}
                  seed={playlist.id}
                  label={cover.coverLabel}
                  radio={cover.radio}
                  priority={index === 0}
                />
              </Link>
            )
          })
        ) : loading ? (
          <div aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(heroCover, heroCoverLayout[index])}
              >
                <Skeleton className="aspect-square rounded-lg border-5 border-card/90 shadow-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(heroCover, heroCoverLayout[0])}>
            <MusicArtwork
              title="Your next favorite"
              seed={label}
              label="MUSICDEX"
            />
          </div>
        )}
        {formatted ? (
          <Link to={formatted.href} className={heroCaption}>
            <span className="music-eyebrow">IN THE SPOTLIGHT</span>
            <span className="truncate">{formatted.title}</span>
            <CaretRightIcon className="size-4 shrink-0" />
          </Link>
        ) : loading ? (
          <div className={heroCaption} aria-hidden="true">
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : null}
      </div>
    </section>
  )
}
