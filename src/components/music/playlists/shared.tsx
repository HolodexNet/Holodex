import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { musicApi } from "@/lib/musicdex/api"
import type { PlaylistStub, Song } from "@/lib/musicdex/types"
import { formatMusicPlaylist } from "@/lib/musicdex/format"
import { useAuth } from "@/stores/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusIcon } from "@/components/icons"

export function useMusicLibrary() {
  const user = useAuth((s) => s.user)
  const jwt = useAuth((s) => s.jwt)
  const key = user?.id ?? "guest"
  const mine = useQuery({
    queryKey: ["musicdex", "myPlaylists", key],
    queryFn: ({ signal }) => musicApi.myPlaylists(signal),
    enabled: !!jwt && !!user,
  })
  const starred = useQuery({
    queryKey: ["musicdex", "starredPlaylists", key],
    queryFn: ({ signal }) => musicApi.starredPlaylists(signal),
    enabled: !!jwt && !!user,
  })
  return { mine, starred, loggedIn: !!jwt, user }
}

export function useMusicInvalidation() {
  const client = useQueryClient()
  return () => client.invalidateQueries({ queryKey: ["musicdex"] })
}

export function playlistHref(playlist: PlaylistStub) {
  return formatMusicPlaylist(playlist).href
}

export function playlistTitle(
  playlist: PlaylistStub & { description?: string | null }
) {
  return formatMusicPlaylist(playlist).title
}

export function AddSongToPlaylist({ song }: { song: Song }) {
  const { mine, loggedIn, user } = useMusicLibrary()
  const invalidate = useMusicInvalidation()
  const add = useMutation({
    mutationFn: async (id: string) => {
      const session = useAuth.getState()
      if (!session.jwt || !user || session.user?.id !== user.id)
        throw new Error("Your session changed")
      const before = await musicApi.playlist(id)
      if (useAuth.getState().jwt !== session.jwt)
        throw new Error("Your session changed")
      if (String(before.owner) !== String(user.id))
        throw new Error("You do not own this playlist")
      const count =
        before.content?.filter((item) => item.id === song.id).length ?? 0
      await musicApi.updatePlaylistSong(id, song.id, "add")
      if (useAuth.getState().jwt !== session.jwt)
        throw new Error("Your session changed")
      const after = await musicApi.playlist(id)
      if (useAuth.getState().jwt !== session.jwt)
        throw new Error("Your session changed")
      if (
        (after.content?.filter((item) => item.id === song.id).length ?? 0) <=
        count
      )
        throw new Error("The server did not add this song")
    },
    onSuccess: async () => {
      await invalidate()
      toast.success("Added to playlist")
    },
    onError: () => {
      void invalidate()
      toast.error(
        "Could not confirm the song was added. Refresh the playlist before trying again."
      )
    },
  })
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add to playlist"
            title="Add to playlist"
          />
        }
      >
        <PlusIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Add to Musicdex playlist</DropdownMenuLabel>
          {!loggedIn ? (
            <DropdownMenuItem disabled>Sign in to add songs</DropdownMenuItem>
          ) : mine.isLoading ? (
            <DropdownMenuItem disabled>Loading playlists…</DropdownMenuItem>
          ) : mine.isError ? (
            <DropdownMenuItem disabled>
              Could not load playlists
            </DropdownMenuItem>
          ) : !mine.data?.length ? (
            <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
          ) : (
            mine.data.map((p) => (
              <DropdownMenuItem
                key={p.id}
                disabled={add.isPending}
                onClick={() => add.mutate(p.id)}
              >
                {playlistTitle(p)}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
