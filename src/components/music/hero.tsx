import { Link } from "react-router"
import { toast } from "sonner"
import { CaretRightIcon, PlayIcon, PlusIcon } from "@/components/icons"
import { MusicArtwork } from "@/components/music/artwork"
import { PlayPlaylistButton } from "@/components/music/play-playlist"
import { PauseIcon } from "@/components/music/player/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
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

export function MusicHero({
  scope,
  playlists,
  favorites = false,
  songs = [],
  loading = false,
}: {
  scope: string
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
  return (
    <section className="music-hero">
      <div className="music-hero-copy">
        <h1>
          {favorites
            ? "Your favorites"
            : scope === "All Vtubers"
              ? "The whole scene"
              : scope}
          <span>on repeat.</span>
        </h1>
        <p className="music-hero-description">
          {favorites
            ? "Familiar voices. Favorite performances. A little more of what you love."
            : "The covers, originals, and late-night karaoke that stay with you."}
        </p>
        <div className="music-hero-actions">
          {favorites && songs.length ? (
            <PlaySongsButton
              songs={songs}
              source={{ id: "liked", title: "Liked songs" }}
              label="Play your favorites"
            />
          ) : featured ? (
            <PlayPlaylistButton
              playlist={featured}
              label={formatted?.radio ? "Start radio" : "Play the mix"}
            />
          ) : loading ? (
            <Button disabled>
              <Spinner /> Finding your mix
            </Button>
          ) : (
            <Button nativeButton={false} render={<Link to="/music/search" />}>
              <PlayIcon /> Find your first song
            </Button>
          )}
          <Link
            to={favorites ? "/music/liked" : "/music/radios"}
            className="music-text-link"
          >
            {favorites ? "Your liked songs" : "Find a radio"}
            <CaretRightIcon className="size-4" />
          </Link>
        </div>
      </div>
      <div className="music-hero-records">
        <div className="music-hero-orbit" aria-hidden="true" />
        {covers.length ? (
          covers.map((playlist, index) => {
            const cover = formatMusicPlaylist(playlist, english)
            return (
              <Link
                to={cover.href}
                key={playlist.id}
                className={`music-hero-cover music-hero-cover-${index}`}
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
                className={`music-hero-cover music-hero-cover-${index}`}
              >
                <Skeleton className="aspect-square rounded-lg border-5 border-card/90 shadow-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="music-hero-cover music-hero-cover-0">
            <MusicArtwork
              title="Your next favorite"
              seed={scope}
              label="MUSICDEX"
            />
          </div>
        )}
        {formatted ? (
          <Link to={formatted.href} className="music-hero-caption">
            <span className="music-eyebrow">IN THE SPOTLIGHT</span>
            <span className="truncate">{formatted.title}</span>
            <CaretRightIcon className="size-4 shrink-0" />
          </Link>
        ) : loading ? (
          <div className="music-hero-caption" aria-hidden="true">
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : null}
      </div>
    </section>
  )
}
