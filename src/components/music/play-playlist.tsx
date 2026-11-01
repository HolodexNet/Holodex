import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "cn"
import { PlayIcon } from "@/components/icons"
import { PauseIcon } from "@/components/music/player/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { musicApi } from "@/lib/musicdex/api"
import { formatMusicPlaylist } from "@/lib/musicdex/format"
import type { PlaylistStub } from "@/lib/musicdex/types"
import { useAuth } from "@/stores/auth"
import { useMusicPlayer } from "@/stores/music-player"
import { useSettings } from "@/stores/settings"

/** A real play action on discovery artwork, with shared playlist caching. */
export function PlayPlaylistButton({
  playlist,
  className,
  label,
}: {
  playlist: PlaylistStub
  className?: string
  label?: string
}) {
  const client = useQueryClient()
  const english = useSettings((s) => s.useEnglishName)
  const active = useMusicPlayer(
    (s) => s.source?.id === playlist.id && !!s.current
  )
  const playing = useMusicPlayer(
    (s) => s.source?.id === playlist.id && s.playing
  )
  const formatted = formatMusicPlaylist(playlist, english)
  const play = useMutation({
    mutationFn: async () => {
      if (active) {
        useMusicPlayer.getState().toggle()
        return
      }
      const user = useAuth.getState().user?.id ?? "guest"
      const result = await client.fetchQuery({
        queryKey: [
          "musicdex",
          formatted.radio ? "radio" : "playlist",
          playlist.id,
          user,
        ],
        queryFn: ({ signal }) =>
          formatted.radio
            ? musicApi.radio(playlist.id, signal)
            : musicApi.playlist(playlist.id, signal),
        staleTime: formatted.radio ? 0 : 60_000,
      })
      if ((useAuth.getState().user?.id ?? "guest") !== user) return
      const blocked = useSettings.getState().blockedChannels
      const songs =
        result.content?.filter(
          (song) => !blocked.some((channel) => channel.id === song.channel_id)
        ) ?? []
      if (!songs.length)
        throw new Error("No playable songs in this collection yet.")
      useMusicPlayer.getState().playSongs(songs, {
        source: {
          id: playlist.id,
          title: formatted.title,
          type: playlist.type,
        },
        radio: formatted.radio,
      })
    },
    onError: (error) =>
      toast.error(error.message || "Could not start this collection."),
  })
  return (
    <Button
      size={label ? "lg" : "icon-lg"}
      className={cn("music-play-button", className)}
      disabled={play.isPending}
      onClick={() => play.mutate()}
      aria-label={`${playing ? "Pause" : "Play"} ${formatted.title}`}
      title={`${playing ? "Pause" : "Play"} ${formatted.title}`}
    >
      {play.isPending ? <Spinner /> : playing ? <PauseIcon /> : <PlayIcon />}
      {label && (
        <span>{playing ? "Pause" : active ? "Keep listening" : label}</span>
      )}
    </Button>
  )
}
