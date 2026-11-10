import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useT } from "@/lib/i18n"
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
  const { t } = useT()
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
      toast.success(t("musicdex.playlists.songAdded"))
    },
    onError: () => {
      void invalidate()
      toast.error(t("musicdex.playlists.addFailed"))
    },
  })
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("musicdex.playlists.addToPlaylist")}
            title={t("musicdex.playlists.addToPlaylist")}
          />
        }
      >
        <PlusIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t("musicdex.playlists.addMenuLabel")}
          </DropdownMenuLabel>
          {!loggedIn ? (
            <DropdownMenuItem disabled>
              {t("musicdex.playlists.signInToAdd")}
            </DropdownMenuItem>
          ) : mine.isLoading ? (
            <DropdownMenuItem disabled>
              {t("musicdex.playlists.loadingPlaylists")}
            </DropdownMenuItem>
          ) : mine.isError ? (
            <DropdownMenuItem disabled>
              {t("musicdex.playlists.loadPlaylistsFailed")}
            </DropdownMenuItem>
          ) : !mine.data?.length ? (
            <DropdownMenuItem disabled>
              {t("musicdex.playlists.noPlaylists")}
            </DropdownMenuItem>
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
