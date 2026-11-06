import { cn } from "cn"

import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  LockSimpleIcon,
  SparkleIcon,
  TrashIcon,
  WarningIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { useT } from "@/lib/i18n"
import { hintsNear, splitTitleArtist } from "@/lib/video-edit/setlist"
import { SONG_SHORTCUT_KEYS } from "@/lib/video-edit/shortcuts"
import {
  blocksSaving,
  firstOverlap,
  hasTrack,
  NO_TRACK,
  overlapSeconds,
  songFix,
  songIssues,
  type SongDraft,
  type SongFix,
  type SongIssue,
  type Track,
} from "@/lib/video-edit/songs"
import { formatTimecode } from "@/lib/video-edit/timecode"
import { useSongEditor } from "@/stores/song-editor"
import {
  EdgeControl,
  LengthField,
  SongArtistField,
  SongNameField,
  TrackArt,
} from "./song-fields"
import { useSongWorkspace } from "./workspace"

/** What's wrong with a song right now, leaving out what isn't worth saying yet. */
export function useSongIssues(song: SongDraft): SongIssue[] {
  const workspace = useSongWorkspace()
  const attemptedSave = useSongEditor((state) => state.attemptedSave)
  // A brand-new song having no name yet isn't a problem until someone tries to
  // save it, whereas bad times come from an edit and are worth saying at once.
  return songIssues(song, workspace.songs, workspace.duration).filter(
    (issue) => issue !== "name" || attemptedSave
  )
}

function fixLabel(fix: SongFix, t: ReturnType<typeof useT>["t"]): string {
  switch (fix.kind) {
    case "length":
      return t("videoEdit.songs.fixes.length", {
        time: formatTimecode(fix.seconds),
      })
    case "video-end":
      return t("videoEdit.songs.fixes.videoEnd", {
        time: formatTimecode(fix.end),
      })
    case "before-next":
      return t("videoEdit.songs.fixes.beforeNext", {
        time: formatTimecode(fix.end),
      })
    case "after-previous":
      return t("videoEdit.songs.fixes.afterPrevious", {
        time: formatTimecode(fix.start),
      })
  }
}

/**
 * A problem, in a sentence, with the obvious way out of it right there. Saying
 * "overlaps another song" and leaving someone to work out which, by how much and
 * what to type instead isn't much help.
 */
function SongNotes({ song, locked }: { song: SongDraft; locked: boolean }) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const issues = useSongIssues(song)
  const result = useSongEditor((state) => state.saveResults[song.id])
  const failed = result && result !== "saved"
  if (!issues.length && !failed) return null

  const message = (issue: SongIssue) => {
    switch (issue) {
      case "name":
        return t("videoEdit.songs.issues.name")
      case "order":
        return t("videoEdit.songs.issues.order")
      case "short":
        return t("videoEdit.songs.issues.short")
      case "past-end":
        return t("videoEdit.songs.issues.pastEnd")
      case "overlap": {
        const other = firstOverlap(song, workspace.songs)
        return t("videoEdit.songs.issues.overlap", {
          name: other?.name.trim() || t("videoEdit.songs.untitled"),
          time: formatTimecode(other ? overlapSeconds(song, other) : 0),
        })
      }
    }
  }

  return (
    <ul className="grid gap-1 text-xs text-destructive">
      {issues.map((issue) => {
        const fix = locked
          ? null
          : songFix(issue, song, workspace.songs, workspace.duration)
        const other = issue === "overlap" && firstOverlap(song, workspace.songs)
        return (
          <li
            key={issue}
            className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
          >
            <WarningIcon className="size-3.5 shrink-0" />
            <span className="min-w-0">{message(issue)}</span>
            {fix && (
              <button
                type="button"
                className="cursor-pointer rounded-sm font-medium underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() =>
                  "start" in fix
                    ? workspace.commitEdge(song.id, "start", fix.start, "enter")
                    : workspace.commitEdge(song.id, "end", fix.end, "enter")
                }
              >
                {fixLabel(fix, t)}
              </button>
            )}
            {other && (
              <button
                type="button"
                className="cursor-pointer rounded-sm text-muted-foreground underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => workspace.openSong(other.id)}
              >
                {t("videoEdit.songs.goToOther")}
              </button>
            )}
          </li>
        )
      })}
      {failed && (
        <li className="flex items-center gap-1.5">
          <WarningIcon className="size-3.5 shrink-0" />
          {t(`videoEdit.songs.saveResults.${result}`)}
        </li>
      )}
    </ul>
  )
}

/** Everything about one song, used wherever one is being worked on. */
export function SongForm({
  song,
  removed,
  compact,
  doneLabel,
  onDone,
}: {
  song: SongDraft
  removed?: boolean
  compact?: boolean
  /** For a step that Enter also takes, which is said on the button. */
  doneLabel?: string
  onDone?: () => void
}) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const candidates = useSongEditor(
    (state) => state.matches[song.id]?.candidates ?? NO_TRACKS
  )
  const issues = useSongIssues(song)
  const locked = !workspace.canEdit(song)
  const nearby = hintsNear(workspace.hints, song.start)
    .filter(
      (hint) =>
        hint.title.toLowerCase() !== song.name.trim().toLowerCase() &&
        hint.text !== song.fromText
    )
    .slice(0, 3)
  const update = useSongEditor((state) => state.update)
  const badLength = issues.some(
    (issue) => blocksSaving(issue) && issue !== "name"
  )

  if (removed)
    return (
      <div className="flex items-center justify-between gap-2 p-3 text-sm text-muted-foreground">
        {t("videoEdit.songs.markedForRemoval")}
        <Button
          variant="outline"
          size="sm"
          onClick={() => useSongEditor.getState().restore(song.id)}
        >
          <ArrowCounterClockwiseIcon data-icon="inline-start" />
          {t("videoEdit.songs.restore")}
        </Button>
      </div>
    )

  return (
    <div className="grid gap-2.5 p-3">
      {locked && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <LockSimpleIcon className="size-3.5 shrink-0" />
          {t("videoEdit.songs.locked")}
        </p>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <TrackArt song={song} size={52} />
        <SongNameField song={song} disabled={locked} />
        <SongArtistField song={song} disabled={locked} />
      </div>

      {!locked && candidates.length > 0 && !song.art && (
        <div className="grid gap-1">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <SparkleIcon className="size-3.5" />
            {t("videoEdit.songs.didYouMean")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidates.map((track) => (
              <button
                key={track.key}
                type="button"
                title={[track.name, track.artist].filter(Boolean).join(" · ")}
                className="flex max-w-full cursor-pointer items-center gap-2 rounded-lg border bg-background py-1 pr-2.5 pl-1 text-left text-xs transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => workspace.pickTrack(song.id, track)}
              >
                <TrackArt song={{ id: track.key, art: track.art }} size={28} />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {track.name}
                  </span>
                  <span className="block truncate text-muted-foreground">
                    {track.artist}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!locked &&
        song.fromText &&
        song.name.trim() !== splitTitleArtist(song.fromText).title && (
          <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
            <span className="min-w-0 truncate" title={song.fromText}>
              {t("videoEdit.songs.writtenAs", { text: song.fromText })}
            </span>
            <button
              type="button"
              className="cursor-pointer underline underline-offset-2 outline-none hover:text-foreground focus-visible:text-foreground"
              onClick={() => {
                const written = splitTitleArtist(song.fromText!)
                update(song.id, {
                  ...NO_TRACK,
                  name: written.title,
                  original_artist: written.artist,
                  matchPending: false,
                  matchDeclined: true,
                })
              }}
            >
              {t("videoEdit.songs.useWritten")}
            </button>
          </p>
        )}

      {!locked && nearby.length > 0 && (
        <div className="grid gap-1">
          <p className="text-xs text-muted-foreground">
            {t("videoEdit.songs.commentsSay", {
              time: formatTimecode(song.start),
            })}
          </p>
          <ul className="grid gap-0.5">
            {nearby.map((hint) => (
              <li key={hint.start}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-baseline gap-2 rounded-md px-1.5 py-0.5 text-left text-xs transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  title={`${t("videoEdit.songs.useThis")}: ${hint.text}`}
                  onClick={() => workspace.applyHint(song.id, hint)}
                >
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatTimecode(hint.start)}
                  </span>
                  <span className="min-w-0 truncate">{hint.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <EdgeControl
          song={song}
          edge="start"
          disabled={locked}
          compact={compact}
        />
        <EdgeControl
          song={song}
          edge="end"
          disabled={locked}
          invalid={badLength || issues.includes("past-end")}
          compact={compact}
        />
        <LengthField song={song} disabled={locked} invalid={badLength} />
      </div>

      {!locked && (song.trackSeconds || song.endSource === "estimate") && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {song.endSource === "estimate" && (
            <span>{t("videoEdit.songs.endIsGuess")}</span>
          )}
          {!!song.trackSeconds &&
            Math.round(song.end - song.start) !== song.trackSeconds && (
              <button
                type="button"
                className="cursor-pointer underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:underline"
                onClick={() => {
                  update(song.id, {
                    end: song.start + song.trackSeconds!,
                    endSource: "track",
                  })
                  workspace.clock.hearUntil(song.start + song.trackSeconds!, 5)
                }}
              >
                {t("videoEdit.songs.useTrackLength", {
                  time: formatTimecode(song.trackSeconds),
                })}
              </button>
            )}
        </p>
      )}

      <SongNotes song={song} locked={locked} />

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {!locked && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => workspace.removeSong(song.id)}
          >
            <TrashIcon data-icon="inline-start" />
            {t("videoEdit.songs.remove")}
          </Button>
        )}
        {song.amUrl && (
          <a
            href={song.amUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {t("videoEdit.songs.openTrack")}
          </a>
        )}
        {!locked && hasTrack(song) && (
          <button
            type="button"
            title={t("videoEdit.songs.unlinkHint")}
            className="ml-2 cursor-pointer text-xs text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:underline"
            onClick={() => workspace.unlinkTrack(song.id)}
          >
            {t("videoEdit.songs.unlink")}
          </button>
        )}
        <span className="flex-1" />
        {onDone && (
          <Button size="sm" onClick={onDone}>
            <CheckIcon data-icon="inline-start" />
            {doneLabel ?? t("videoEdit.songs.done")}
            {doneLabel && (
              <Kbd
                className={cn(
                  "ml-1 hidden bg-primary-foreground/20 text-primary-foreground lg:inline-flex"
                )}
              >
                {SONG_SHORTCUT_KEYS.confirm}
              </Kbd>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

const NO_TRACKS: Track[] = []
