import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { MusicSignInBanner } from "@/components/music/shared"
import { Button } from "@/components/ui/button"
import { EmptyNote } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useMusicInvalidation,
  useMusicLibrary,
} from "@/components/music/playlists/shared"
import { musicApi } from "@/lib/musicdex/api"
import { useAuth } from "@/stores/auth"
import type { PlaylistStub } from "@/lib/musicdex/types"
import { MusicPlaylistCard } from "@/components/music/discovery/sections"
import { MusicArtwork } from "@/components/music/artwork"
import {
  MusicSectionHeading,
  musicCollectionGridClass,
} from "@/components/music/page-header"
import { PlusIcon } from "@/components/icons"

function PlaylistGrid({
  items,
  empty,
}: {
  items: PlaylistStub[]
  empty: string
}) {
  if (!items.length)
    return <EmptyNote className="px-5 py-8 text-left">{empty}</EmptyNote>
  return (
    <div className={musicCollectionGridClass}>
      {items.map((playlist) => (
        <MusicPlaylistCard playlist={playlist} key={playlist.id} />
      ))}
    </div>
  )
}

/** The viewer's own Musicdex playlists, shown as a tab of the main home page. */
export function MusicLibraryTab() {
  const { mine, starred, loggedIn, user } = useMusicLibrary()
  const invalidate = useMusicInvalidation()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const create = useMutation({
    mutationFn: async () => {
      const session = useAuth.getState()
      if (!session.jwt || !user || session.user?.id !== user.id)
        throw new Error("Your session changed")
      const rows = await musicApi.writePlaylist({
        title: title.trim(),
        description: description.trim(),
        owner: user.id,
        type: "ugp",
        listed: false,
        content: [],
      })
      if (useAuth.getState().jwt !== session.jwt)
        throw new Error("Your session changed")
      const id = rows[0]?.id
      if (!id) throw new Error("The server did not return the new playlist ID")
      const canonical = await musicApi.playlist(id)
      if (useAuth.getState().jwt !== session.jwt)
        throw new Error("Your session changed")
      if (
        canonical.title !== title.trim() ||
        String(canonical.owner) !== String(user.id)
      )
        throw new Error("Could not confirm the created playlist")
      return canonical
    },
    onSuccess: async (playlist) => {
      await invalidate()
      toast.success("Playlist created")
      setCreating(false)
      setTitle("")
      setDescription("")
      navigate(`/music/playlist/${encodeURIComponent(playlist.id)}`)
    },
    onError: () => {
      void invalidate()
      toast.error(
        "Could not confirm playlist creation. Check your library before trying again."
      )
    },
  })
  function submit(e: FormEvent) {
    e.preventDefault()
    if (title.trim() && user) create.mutate()
  }
  return (
    <div className="container mx-auto space-y-9 max-md:space-y-7">
      {!loggedIn ? (
        <MusicSignInBanner
          title="A place for your good finds."
          description="Make a mix for the commute, keep a favorite karaoke session, or save an artist radio for later."
          action="Sign in to start collecting"
          art={
            <MusicArtwork
              title="Your collection"
              seed="library"
              label="SIDE A"
              radio
            />
          }
        />
      ) : (
        <>
          {creating && (
            <form
              onSubmit={submit}
              className="max-w-xl space-y-3 rounded-xl border p-4"
            >
              <fieldset disabled={create.isPending} className="space-y-3">
                <label
                  className="block text-sm font-medium"
                  htmlFor="music-new-title"
                >
                  Playlist name
                </label>
                <Input
                  id="music-new-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
                <label
                  className="block text-sm font-medium"
                  htmlFor="music-new-description"
                >
                  Description
                </label>
                <Textarea
                  id="music-new-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={!user || !title.trim() || create.isPending}
                >
                  {create.isPending ? "Creating…" : "Create"}
                </Button>
              </fieldset>
            </form>
          )}
          <section className="space-y-4">
            <MusicSectionHeading
              title="Your Playlists"
              description={
                mine.data?.length
                  ? `${mine.data.length} Musicdex playlists in your collection.`
                  : "It's a blank page right now, go make one!"
              }
            >
              <Button onClick={() => setCreating(!creating)}>
                <PlusIcon />
                {creating ? "Cancel" : "New playlist"}
              </Button>
            </MusicSectionHeading>
            {mine.isLoading ? (
              <p>Loading playlists…</p>
            ) : mine.isError ? (
              <p role="alert" className="text-destructive">
                Could not load your playlists.{" "}
                <button
                  className="underline"
                  onClick={() => void mine.refetch()}
                >
                  Try again
                </button>
              </p>
            ) : (
              <PlaylistGrid
                items={mine.data ?? []}
                empty="You have not created a playlist yet."
              />
            )}
          </section>
          <section className="space-y-4">
            <MusicSectionHeading title="Saved Playlists & Radios" />
            {starred.isLoading ? (
              <p>Loading starred items…</p>
            ) : starred.isError ? (
              <p role="alert" className="text-destructive">
                Could not load starred items.{" "}
                <button
                  className="underline"
                  onClick={() => void starred.refetch()}
                >
                  Try again
                </button>
              </p>
            ) : (
              <PlaylistGrid
                items={starred.data ?? []}
                empty="Star a playlist or radio to find it here."
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}
