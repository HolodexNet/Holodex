import { useState } from "react"
import { cn } from "cn"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router"
import { toast } from "sonner"
import {
  HeartFillIcon,
  HeartIcon,
  PlayIcon,
  PlaylistIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AddSongToPlaylist } from "@/components/music/playlists/shared"
import { musicApi } from "@/lib/musicdex/api"
import type { Song } from "@/lib/musicdex/types"
import { useAuth } from "@/stores/auth"
import { useMusicPlayer, type MusicSource } from "@/stores/music-player"
import { useSettings } from "@/stores/settings"

function SongRow({
  song,
  index,
  onPlay,
  liked,
  contextChannelId,
}: {
  song: Song
  index: number
  onPlay: () => void
  liked: boolean
  contextChannelId?: string
}) {
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const loggedIn = useAuth((s) => !!s.jwt)
  const queryClient = useQueryClient()
  const current = useMusicPlayer((s) => s.current?.id === song.id)
  const playing = useMusicPlayer((s) => s.current?.id === song.id && s.playing)
  const [saving, setSaving] = useState(false)
  const duration = Math.max(0, song.end - song.start)
  const performed = song.available_at ? new Date(song.available_at) : null
  const sourceUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(song.video_id)}&t=${Math.max(0, Math.floor(song.start || 0))}`
  const toggleLike = async () => {
    if (!loggedIn) {
      toast.error("Sign in to like songs")
      return
    }
    setSaving(true)
    try {
      await musicApi.likeSong(song.id, !liked)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["musicdex", "liked"] }),
        queryClient.invalidateQueries({ queryKey: ["musicdex", "like-check"] }),
      ])
    } catch {
      toast.error("Could not update liked song")
    } finally {
      setSaving(false)
    }
  }
  return (
    <div
      className={cn(
        "music-track-row group flex items-center gap-3",
        current && "is-current"
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden sm:inline-flex"
        aria-label={`Play ${song.name}`}
        onClick={onPlay}
      >
        <span className="text-xs text-muted-foreground group-hover:hidden">
          {playing ? (
            <span className="music-equalizer" aria-label="Now playing">
              <i />
              <i />
              <i />
            </span>
          ) : (
            index + 1
          )}
        </span>
        <PlayIcon className="hidden group-hover:block" />
      </Button>
      <img
        src={
          song.art || `https://i.ytimg.com/vi/${song.video_id}/mqdefault.jpg`
        }
        alt=""
        loading="lazy"
        className="music-track-art object-cover"
      />
      <div className="min-w-0 flex-1">
        <button
          className="music-song-title block max-w-full truncate text-left text-sm font-medium hover:underline"
          onClick={onPlay}
        >
          {song.name}
        </button>
        <div className="truncate text-xs text-muted-foreground">
          {song.original_artist && (
            <span>
              {song.original_artist}
              {contextChannelId === song.channel_id ? "" : " · "}
            </span>
          )}
          {contextChannelId !== song.channel_id ? (
            <Link
              className="hover:underline"
              to={`/channel/${encodeURIComponent(song.channel_id)}/music`}
            >
              {(preferEnglish && song.channel?.english_name) ||
                song.channel?.name ||
                song.channel_id}
            </Link>
          ) : !song.original_artist ? (
            song.is_mv ? (
              "Music video"
            ) : (
              "Singing stream"
            )
          ) : null}
        </div>
      </div>
      {performed && Number.isFinite(performed.getTime()) && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="music-track-date hidden shrink-0 text-xs text-muted-foreground hover:underline lg:block"
          title="Open this performance on YouTube"
        >
          <time dateTime={performed.toISOString()}>
            {performed.toLocaleDateString()}
          </time>
        </a>
      )}
      {duration > 0 && (
        <span className="hidden text-xs text-muted-foreground tabular-nums sm:block">
          {Math.floor(duration / 60)}:
          {String(Math.floor(duration % 60)).padStart(2, "0")}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={liked ? "Unlike song" : "Like song"}
        disabled={saving}
        onClick={() => void toggleLike()}
      >
        {liked ? <HeartFillIcon className="text-primary" /> : <HeartIcon />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="music-track-secondary-action"
        aria-label="Add to queue"
        onClick={() => {
          useMusicPlayer.getState().queueSongs([song])
          toast.success("Added to queue")
        }}
      >
        <PlaylistIcon />
      </Button>
      <AddSongToPlaylist song={song} />
    </div>
  )
}

export function SongListSkeleton() {
  return (
    <div role="status" aria-label="Loading songs">
      <span className="sr-only">Loading songs</span>
      <div
        className="music-track-list music-track-list-preview"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="music-track-row flex items-center gap-3">
            <Skeleton className="hidden size-7 shrink-0 sm:block" />
            <Skeleton className="music-track-art" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="hidden h-3 w-8 sm:block" />
            <Skeleton className="size-7 shrink-0" />
            <Skeleton className="size-8 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SongList({
  songs,
  source,
  radio = false,
  preview,
  previewLayout = "grid",
  contextChannelId,
  indexOffset = 0,
}: {
  songs: Song[]
  source?: MusicSource
  radio?: boolean
  preview?: number
  previewLayout?: "grid" | "list"
  contextChannelId?: string
  indexOffset?: number
}) {
  const user = useAuth((s) => s.user)
  const loggedIn = useAuth((s) => !!s.jwt)
  const [visibleCount, setVisibleCount] = useState(100)
  const visible = songs.slice(0, preview ?? visibleCount)
  const ids = visible.map((song) => song.id)
  const checks = useQuery({
    queryKey: ["musicdex", "like-check", user?.id, ids.join(",")],
    enabled: loggedIn && ids.length > 0,
    queryFn: async ({ signal }) => {
      const chunks: boolean[][] = []
      for (let i = 0; i < ids.length; i += 100)
        chunks.push(await musicApi.checkLikes(ids.slice(i, i + 100), signal))
      return chunks.flat()
    },
    staleTime: 30 * 60 * 1000,
  })
  if (!songs.length)
    return <p className="py-6 text-sm text-muted-foreground">No songs found.</p>
  return (
    <div>
      {!preview && (
        <div className="music-track-head" aria-hidden="true">
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Track / Artist</span>
          <span className="music-track-date hidden lg:block">Performed</span>
          <span className="hidden w-12 text-right sm:block">Time</span>
          <span className="w-28" />
        </div>
      )}
      <div
        className={cn(
          "music-track-list",
          preview && previewLayout === "grid" && "music-track-list-preview"
        )}
      >
        {visible.map((song, index) => (
          <SongRow
            key={`${song.id}-${index}`}
            song={song}
            index={index + indexOffset}
            liked={checks.data?.[index] ?? !!song.liked}
            contextChannelId={contextChannelId}
            onPlay={() =>
              useMusicPlayer
                .getState()
                .playSongs(songs, { index, source, radio })
            }
          />
        ))}
      </div>
      {!preview && visibleCount < songs.length && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setVisibleCount((count) => count + 100)}
        >
          Show more songs ({visible.length} of {songs.length})
        </Button>
      )}
    </div>
  )
}
