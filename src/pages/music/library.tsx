import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useMusicInvalidation,
  useMusicLibrary,
} from "@/components/music/playlists/shared"
import { musicApi } from "@/lib/musicdex/api"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useAuth } from "@/stores/auth"
import type { PlaylistStub } from "@/lib/musicdex/types"
import { MusicPlaylistCard } from "@/components/music/discovery/sections"
import { MusicArtwork } from "@/components/music/artwork"
import {
  MusicNavigation,
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
    return (
      <p className="rounded-xl border border-dashed px-5 py-8 text-sm text-muted-foreground">
        {empty}
      </p>
    )
  return (
    <div className={musicCollectionGridClass}>
      {items.map((playlist) => (
        <MusicPlaylistCard playlist={playlist} key={playlist.id} />
      ))}
    </div>
  )
}

export function MusicLibraryPage() {
  useDocumentTitle("Musicdex Playlists")
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
    <main className="mx-auto w-full max-w-370 min-w-0 space-y-9 px-[clamp(16px,3vw,44px)] pt-6 pb-14 max-md:space-y-7 max-md:p-4 max-md:pb-9">
      <MusicNavigation />
      {!loggedIn ? (
        <div className="relative flex min-h-72.5 items-center justify-between gap-9 overflow-hidden rounded-2xl border border-border bg-[color-mix(in_oklch,var(--complement-soft)_13%,var(--card))] p-[clamp(24px,4vw,48px)] max-md:min-h-70 max-md:p-6.5">
          <div className="max-md:relative max-md:z-1">
            <h2 className="text-[clamp(24px,3vw,36px)] leading-[1.2] font-bold tracking-tighter">
              A place for your good finds.
            </h2>
            <p className="mt-3 mb-6 max-w-97.5 text-[13px] leading-[1.8] text-muted-foreground">
              Make a mix for the commute, keep a favorite karaoke session, or
              save an artist radio for later.
            </p>
            <Button nativeButton={false} render={<Link to="/login" />}>
              Sign in to start collecting
            </Button>
          </div>
          <div className="mr-6 w-[220px] shrink-0 rotate-[9deg] max-md:pointer-events-none max-md:absolute max-md:-right-[115px] max-md:-bottom-[30px] max-md:w-[250px] max-md:opacity-15">
            <MusicArtwork
              title="Your collection"
              seed="library"
              label="SIDE A"
              radio
            />
          </div>
        </div>
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
    </main>
  )
}
