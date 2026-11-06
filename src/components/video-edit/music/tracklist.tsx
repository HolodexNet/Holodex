import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import { cn } from "cn"

import {
  CheckCircleIcon,
  LockSimpleIcon,
  PlayIcon,
  PlusIcon,
  WarningIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useT } from "@/lib/i18n"
import {
  blocksSaving,
  type SongDraft,
  type SongRow,
} from "@/lib/video-edit/songs"
import { formatTimecode } from "@/lib/video-edit/timecode"
import { useSongEditor } from "@/stores/song-editor"
import { TrackArt } from "./song-fields"
import { SongForm, useSongIssues } from "./song-form"
import { focusSongField, useSongWorkspace } from "./workspace"

function RowStatus({ row }: { row: SongRow }) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const saving = useSongEditor((state) => state.saving)
  const result = useSongEditor((state) => state.saveResults[row.song.id])
  const issues = useSongIssues(row.song)
  // Worth a look, though it won't stop the song being saved.
  const caution = issues.length > 0 && (
    <WarningIcon
      className="size-3.5 shrink-0 text-muted-foreground"
      aria-label={t("videoEdit.songs.needsAttention")}
    />
  )
  if (saving && row.state !== "saved") return <Spinner />
  if (row.state === "removed")
    return (
      <span className="text-xs text-destructive">
        {t("videoEdit.songs.states.removed")}
      </span>
    )
  if ((result && result !== "saved") || issues.some(blocksSaving))
    return (
      <WarningIcon
        className="size-4 text-destructive"
        aria-label={t("videoEdit.songs.needsAttention")}
      />
    )
  if (row.song.checked)
    return (
      <span className="flex items-center gap-1">
        {caution}
        <CheckCircleIcon
          className="size-4 text-complement"
          aria-label={t("videoEdit.songs.states.checked")}
        />
      </span>
    )
  if (row.state === "new" || row.state === "edited")
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-brand">
        {caution}
        {t(`videoEdit.songs.states.${row.state}`)}
      </span>
    )
  if (caution) return caution
  if (!workspace.canEdit(row.song))
    return (
      <LockSimpleIcon
        className="size-3.5 text-muted-foreground"
        aria-label={t("videoEdit.songs.locked")}
      />
    )
  return null
}

/** Marks the song the video is in right now, without redrawing the list to do it. */
function NowPlayingMark({ song }: { song: SongDraft }) {
  const { t } = useT()
  const { clock } = useSongWorkspace()
  const here = useSyncExternalStore(clock.subscribeSecond, () => {
    const second = clock.getSecond()
    return second >= song.start && second < song.end
  })
  return here ? (
    <PlayIcon
      className="size-2.5 shrink-0 text-brand"
      aria-label={t("videoEdit.songs.playingNow")}
    />
  ) : null
}

function SongListItem({
  row,
  selected,
  compact,
  doneLabel,
  onDone,
}: {
  row: SongRow
  selected: boolean
  compact?: boolean
  doneLabel?: string
  onDone?: () => void
}) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const item = useRef<HTMLLIElement>(null)
  const { song, state } = row
  const name = song.name.trim() || t("videoEdit.songs.untitled")

  useEffect(() => {
    if (selected) item.current?.scrollIntoView({ block: "nearest" })
  }, [selected])

  return (
    <li
      ref={item}
      className={cn(
        "scroll-mt-[calc(56.25vw+0.5rem)] scroll-mb-2 rounded-xl transition-colors lg:scroll-mt-2",
        selected
          ? "bg-card shadow-sm ring-1 ring-primary/40"
          : "hover:bg-muted/60"
      )}
    >
      <button
        type="button"
        aria-expanded={selected}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={() =>
          selected
            ? useSongEditor.getState().select(null)
            : workspace.openSong(song.id)
        }
      >
        <TrackArt song={song} size={36} />
        <span
          className={cn(
            "min-w-0 flex-1",
            state === "removed" && "line-through opacity-60"
          )}
        >
          <span
            title={song.name.trim() || undefined}
            className={cn(
              "block truncate text-sm",
              !song.name.trim() && "text-muted-foreground italic"
            )}
          >
            {name}
          </span>
          <span
            title={song.original_artist.trim() || undefined}
            className="block truncate text-xs text-muted-foreground"
          >
            {song.original_artist || " "}
          </span>
        </span>
        <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
          <span className="flex items-center justify-end gap-1">
            <NowPlayingMark song={song} />
            {formatTimecode(song.start)} – {formatTimecode(song.end)}
          </span>
          {/* A length that looks wrong is the quickest way to spot a wrong time. */}
          <span className="block opacity-70">
            {formatTimecode(Math.max(0, song.end - song.start))}
          </span>
        </span>
        <span className="flex w-14 shrink-0 justify-end">
          <RowStatus row={row} />
        </span>
      </button>
      {selected && (
        <SongForm
          song={song}
          removed={state === "removed"}
          compact={compact}
          doneLabel={doneLabel}
          onDone={onDone}
        />
      )}
    </li>
  )
}

/** The songs of the video, with the selected one open for editing. */
export function Tracklist({
  compact,
  empty,
  header,
  doneLabel,
  onDone,
  className,
}: {
  compact?: boolean
  empty?: ReactNode
  header?: ReactNode
  doneLabel?: string
  onDone?: () => void
  className?: string
}) {
  const { t, tc } = useT()
  const workspace = useSongWorkspace()
  const load = useSongEditor((state) => state.load)
  const selectedId = useSongEditor((state) => state.selectedId)
  const { rows, songs } = workspace
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <h2 className="text-sm font-semibold">
          {tc("videoEdit.songs.count", songs.length)}
        </h2>
        {header}
        <span className="flex-1" />
        {workspace.canAdd && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              workspace.addAt(workspace.clock.now())
              focusSongField("name")
            }}
          >
            <PlusIcon data-icon="inline-start" />
            {t("videoEdit.songs.add")}
          </Button>
        )}
      </div>
      {load === "error" ? (
        <div role="alert" className="flex flex-wrap items-center gap-2 p-3">
          <p className="text-sm text-destructive">
            {t("videoEdit.songs.loadFailed")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void useSongEditor.getState().reload()}
          >
            {t("curation.tryAgain")}
          </Button>
        </div>
      ) : load === "loading" && !rows.length ? (
        <div role="status" className="flex items-center gap-2 p-3 text-sm">
          <Spinner />
          {t("views.watch.loading")}
        </div>
      ) : rows.length === 0 ? (
        empty
      ) : (
        <ul className="grid min-h-0 flex-1 content-start gap-1 overflow-y-auto px-2 pb-3">
          {rows.map((row) => (
            <SongListItem
              key={row.song.id}
              row={row}
              selected={row.song.id === selectedId}
              compact={compact}
              doneLabel={doneLabel}
              onDone={onDone}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
