import { useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlayIcon,
  TrashIcon,
  StarIcon,
  StarFillIcon,
  CaretRightIcon,
} from "@/components/icons"
import { PauseIcon, ShuffleIcon } from "@/components/music/player/icons"
import { MusicArtwork } from "@/components/music/artwork"
import { AddToQueueButton } from "@/components/music/hero"
import { MusicDetailSkeleton } from "@/components/music/skeletons"
import { formatMusicPlaylist } from "@/lib/musicdex/format"
import { useSettings } from "@/stores/settings"
import { SongList } from "@/components/music/song-list"
import {
  playlistTitle,
  useMusicInvalidation,
  useMusicLibrary,
} from "@/components/music/playlists/shared"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { musicApi } from "@/lib/musicdex/api"
import type { Playlist, Song } from "@/lib/musicdex/types"
import { useAuth } from "@/stores/auth"
import { useMusicPlayer } from "@/stores/music-player"

function playlistSnapshot(playlist: Playlist) {
  return JSON.stringify({
    title: playlist.title,
    description: playlist.description ?? "",
    listed: playlist.listed,
    type: playlist.type,
    updated_at: playlist.updated_at,
    content: (playlist.content ?? []).map((song) => song.id),
  })
}

function PlaylistEditor({
  playlist,
  onDone,
}: {
  playlist: Playlist
  onDone: () => void
}) {
  const [title, setTitle] = useState(playlist.title)
  const [description, setDescription] = useState(playlist.description ?? "")
  const [listed, setListed] = useState(playlist.listed)
  const [songs, setSongs] = useState<Song[]>(playlist.content ?? [])
  const [baseline] = useState(() => playlistSnapshot(playlist))
  const [session] = useState(() => ({
    jwt: useAuth.getState().jwt,
    userId: useAuth.getState().user?.id,
  }))
  const invalidate = useMusicInvalidation()
  const save = useMutation({
    mutationFn: async () => {
      const sameSession = () =>
        !!session.jwt &&
        session.userId !== undefined &&
        useAuth.getState().jwt === session.jwt &&
        useAuth.getState().user?.id === session.userId
      if (!sameSession())
        throw new Error("Your session changed. Your draft has been kept.")
      const current = await musicApi.playlist(playlist.id)
      if (!sameSession())
        throw new Error("Your session changed. Your draft has been kept.")
      if (playlistSnapshot(current) !== baseline)
        throw new Error(
          "This playlist changed since you started editing. Your draft has been kept; cancel and reopen it to see the latest version."
        )
      if (String(current.owner) !== String(session.userId))
        throw new Error(
          "You no longer own this playlist. Your draft has been kept."
        )
      const ids = songs.map((song) => song.id)
      await musicApi.writePlaylist({
        id: playlist.id,
        title: title.trim(),
        description,
        listed,
        owner: session.userId!,
        type: playlist.type,
        content: ids,
        updated_at: current.updated_at,
      })
      if (!sameSession())
        throw new Error("Your session changed. Your draft has been kept.")
      let saved: Playlist
      try {
        saved = await musicApi.playlist(playlist.id)
      } catch {
        throw new Error(
          "The save was sent, but could not be confirmed. Your draft has been kept; check the playlist before retrying."
        )
      }
      if (!sameSession())
        throw new Error("Your session changed. Your draft has been kept.")
      if (
        saved.title !== title.trim() ||
        (saved.description ?? "") !== description ||
        saved.listed !== listed ||
        JSON.stringify((saved.content ?? []).map((song) => song.id)) !==
          JSON.stringify(ids)
      ) {
        throw new Error(
          "The server returned different playlist contents. Your draft has been kept; refresh the playlist to review it."
        )
      }
    },
    onSuccess: async () => {
      await invalidate()
      toast.success("Playlist saved")
      onDone()
    },
  })
  const move = (index: number, direction: number) =>
    setSongs((items) => {
      const next = [...items]
      const target = index + direction
      if (target < 0 || target >= next.length) return items
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (title.trim()) save.mutate()
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={save.isPending} className="space-y-4">
        <div className="grid max-w-2xl gap-3">
          <label htmlFor="music-edit-title" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="music-edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
          <label
            htmlFor="music-edit-description"
            className="text-sm font-medium"
          >
            Description
          </label>
          <Textarea
            id="music-edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={listed} onCheckedChange={setListed} /> Public
            playlist
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending || !title.trim()}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={save.isPending}
          >
            Cancel
          </Button>
        </div>
        {save.isError && (
          <p role="alert" className="text-sm text-destructive">
            {save.error.message ||
              "Could not save playlist. Your draft has been kept."}
          </p>
        )}
        <h2 className="text-lg font-semibold">Songs</h2>
        {!songs.length ? (
          <p className="text-muted-foreground">
            No songs in this playlist yet. Add songs from a song list.
          </p>
        ) : (
          <ol className="divide-y rounded-xl border">
            {songs.map((song, i) => (
              <li
                key={`${song.id}-${i}`}
                className="flex items-center gap-2 p-2"
              >
                <span className="w-7 shrink-0 text-center text-sm text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {song.name}{" "}
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    · {song.channel?.english_name || song.channel?.name}
                  </span>
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Move ${song.name} up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Move ${song.name} down`}
                  disabled={i === songs.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDownIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Remove ${song.name}`}
                  onClick={() =>
                    setSongs((items) => items.filter((_, index) => index !== i))
                  }
                >
                  <TrashIcon />
                </Button>
              </li>
            ))}
          </ol>
        )}
      </fieldset>
    </form>
  )
}

export function MusicPlaylistDetail({ radio = false }: { radio?: boolean }) {
  const { id = "" } = useParams()
  const jwt = useAuth((s) => s.jwt)
  const { user, starred, loggedIn } = useMusicLibrary()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const invalidate = useMusicInvalidation()
  const playSongs = useMusicPlayer((s) => s.playSongs)
  const active = useMusicPlayer((s) => s.source?.id === id && !!s.current)
  const playing = useMusicPlayer((s) => s.source?.id === id && s.playing)
  const english = useSettings((s) => s.useEnglishName)
  const query = useQuery({
    queryKey: [
      "musicdex",
      radio ? "radio" : "playlist",
      id,
      jwt ? (user?.id ?? "pending") : "guest",
    ],
    queryFn: ({ signal }) =>
      radio ? musicApi.radio(id, signal) : musicApi.playlist(id, signal),
    enabled: !!id && (!jwt || !!user),
  })
  useDocumentTitle(
    query.data
      ? playlistTitle(query.data)
      : radio
        ? "Music Radio"
        : "Music Playlist"
  )
  const toggleStar = useMutation({
    mutationFn: (star: boolean) => musicApi.starPlaylist(id, star),
    onSuccess: async () => {
      await invalidate()
    },
    onError: () => toast.error("Could not update star"),
  })
  const remove = useMutation({
    mutationFn: async () => {
      const session = useAuth.getState()
      if (!session.jwt || !user || session.user?.id !== user.id)
        throw new Error("Your session changed")
      const result = await musicApi.deletePlaylist(id)
      if (useAuth.getState().jwt !== session.jwt)
        throw new Error("Your session changed")
      if (typeof result !== "number" || result < 1)
        throw new Error("The playlist was not deleted")
    },
    onSuccess: async () => {
      await invalidate()
      toast.success("Playlist deleted")
      setDeleteOpen(false)
      navigate("/#playlists")
    },
    onError: () => toast.error("Could not delete playlist"),
  })
  if (query.isLoading)
    return (
      <div className="container mx-auto space-y-9 max-md:space-y-7">
        <MusicDetailSkeleton radio={radio} />
      </div>
    )
  if (!query.data)
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">
          Could not load {radio ? "radio" : "playlist"}
        </h1>
        <p className="text-muted-foreground">
          It may be unavailable or private.
        </p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    )
  const playlist = query.data
  const formatted = formatMusicPlaylist(playlist, english)
  const title = formatted.title
  const songs = playlist.content ?? []
  const owner =
    loggedIn && !radio && String(user?.id) === String(playlist.owner)
  const isStarred = starred.data?.some((p) => p.id === id) ?? false
  const source = { id, title, type: playlist.type }
  const description = formatted.description
  const duration = songs.reduce(
    (sum, song) => sum + Math.max(0, song.end - song.start),
    0
  )
  return (
    <div className="container mx-auto space-y-9 max-md:space-y-7">
      {query.isError && (
        <p role="alert" className="text-sm text-destructive">
          Could not refresh this playlist; showing previously loaded data.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      )}
      <header className="relative isolate flex items-center gap-8 overflow-hidden rounded-[20px] bg-[color-mix(in_oklch,var(--complement-soft)_20%,var(--card))] p-8 max-md:block max-md:p-6">
        <div className="w-[clamp(160px,20vw,230px)] shrink-0 rounded-[12px] shadow-[0_12px_30px_#0003] max-md:mx-auto max-md:mb-6.25 max-md:w-42.5">
          <MusicArtwork
            src={formatted.image}
            title={title}
            seed={id}
            radio={radio}
            label={formatted.coverLabel}
            bestOf={formatted.bestOf}
          />
        </div>
        <div className="relative min-w-0">
          <Link to={radio ? "/#radio" : "/#music"} className="music-eyebrow">
            MUSICDEX
            <CaretRightIcon className="size-3" />
            {formatted.kind}
          </Link>
          <h1 className="mt-3.5 text-[clamp(30px,3.5vw,52px)] leading-[1.08] font-[760] tracking-[-0.055em] wrap-anywhere max-md:text-[33px]">
            {title}
          </h1>
          {description && (
            <p className="mt-3.75 max-w-150 text-[13px] leading-[1.7] whitespace-pre-wrap text-muted-foreground max-md:text-[12px]">
              {description}
            </p>
          )}
          <div className="mt-4.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground [&>span+span]:before:mr-2 [&>span+span]:before:opacity-60 [&>span+span]:before:content-['·']">
            <span>
              {songs.length} {radio ? "songs to get you started" : "songs"}
            </span>
            {!radio && duration > 0 && (
              <span>
                {duration >= 3600 ? `${Math.floor(duration / 3600)} hr ` : ""}
                {Math.floor(duration / 60) % 60} min
              </span>
            )}
            {owner && (
              <span>{playlist.listed ? "Public playlist" : "Only you"}</span>
            )}
            {radio && <span>More songs as you listen</span>}
          </div>
        </div>
      </header>
      {editingId === id && owner ? (
        <PlaylistEditor
          key={`${id}-${String(user?.id)}`}
          playlist={playlist}
          onDone={() => setEditingId(null)}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border pt-1 pb-4">
            <Button
              className="h-11 px-6 shadow-[0_4px_16px_color-mix(in_oklch,var(--primary)_16%,transparent)]"
              disabled={!songs.length}
              onClick={() =>
                active
                  ? useMusicPlayer.getState().toggle()
                  : playSongs(songs, { source, radio })
              }
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
              {playing
                ? "Pause"
                : active
                  ? "Keep listening"
                  : radio
                    ? "Start radio"
                    : "Play collection"}
            </Button>
            <Button
              variant="outline"
              disabled={!songs.length}
              onClick={() =>
                playSongs(songs, {
                  index: Math.floor(Math.random() * songs.length),
                  source,
                  radio,
                  shuffle: true,
                })
              }
            >
              <ShuffleIcon /> Shuffle
            </Button>
            <AddToQueueButton songs={songs} />
            {loggedIn && !owner && (
              <Button
                variant="outline"
                disabled={
                  starred.isLoading || starred.isError || toggleStar.isPending
                }
                onClick={() => toggleStar.mutate(!isStarred)}
              >
                {isStarred ? (
                  <StarFillIcon className="text-brand" />
                ) : (
                  <StarIcon />
                )}
                {isStarred ? "Saved" : "Save to library"}
              </Button>
            )}
            {!loggedIn && (
              <Button
                nativeButton={false}
                variant="outline"
                render={<Link to="/login" />}
              >
                <StarIcon /> Save to library
              </Button>
            )}
            {owner && (
              <>
                <Button variant="outline" onClick={() => setEditingId(id)}>
                  Edit playlist
                </Button>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger render={<Button variant="destructive" />}>
                    Delete
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete playlist?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete {title}.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose
                        render={
                          <Button
                            variant="outline"
                            disabled={remove.isPending}
                          />
                        }
                      >
                        Cancel
                      </DialogClose>
                      <Button
                        variant="destructive"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate()}
                      >
                        {remove.isPending ? "Deleting..." : "Delete playlist"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
          {starred.isError && loggedIn && !owner && (
            <p role="alert" className="text-sm text-destructive">
              Could not load star status.{" "}
              <button
                className="underline"
                onClick={() => void starred.refetch()}
              >
                Try again
              </button>
            </p>
          )}
          {songs.length ? (
            <SongList songs={songs} source={source} radio={radio} />
          ) : (
            <p className="rounded-xl border p-6 text-muted-foreground">
              No songs yet.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export function MusicPlaylistPage() {
  return <MusicPlaylistDetail />
}
