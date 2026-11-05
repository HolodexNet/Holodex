import { useId, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "cn"

import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  CrosshairSimpleIcon,
  EarIcon,
  LockSimpleIcon,
  MinusIcon,
  MusicNoteIcon,
  PlusIcon,
  SparkleIcon,
  TrashIcon,
  WarningIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { useDebounced } from "@/hooks/use-debounced"
import { useT } from "@/lib/i18n"
import { hintsNear, splitTitleArtist } from "@/lib/video-edit/setlist"
import {
  SONG_SHORTCUT_KEYS,
  type SongShortcut,
} from "@/lib/video-edit/shortcuts"
import {
  songIssues,
  type SongDraft,
  type SongIssue,
  type Track,
} from "@/lib/video-edit/songs"
import { formatTimecode, parseTimecode } from "@/lib/video-edit/timecode"
import { searchTracks } from "@/lib/video-edit/track-search"
import { useSongEditor } from "@/stores/song-editor"
import { SuggestField } from "../suggest-field"
import { usePlayheadSecond, useSongWorkspace, type SongEdge } from "./workspace"

/** A track's cover, or something honest in its place. */
export function TrackArt({
  song,
  size = 40,
  className,
}: {
  song: Pick<SongDraft, "art" | "id">
  size?: number
  className?: string
}) {
  const searching = useSongEditor(
    (state) => state.matches[song.id]?.state === "searching"
  )
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground",
        className
      )}
      style={{ width: size, height: size }}
    >
      {song.art ? (
        <img
          src={song.art}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
        />
      ) : searching ? (
        <Spinner />
      ) : (
        <MusicNoteIcon className="size-1/2" />
      )}
    </span>
  )
}

/** Accepts anything `parseTimecode` can read, and only commits a time it could. */
export function TimeField({
  value,
  onCommit,
  disabled,
  invalid,
  id,
  className,
  "aria-label": ariaLabel,
}: {
  value: number
  onCommit: (seconds: number) => void
  disabled?: boolean
  invalid?: boolean
  id?: string
  className?: string
  "aria-label"?: string
}) {
  const [typed, setTyped] = useState<string | null>(null)
  const commit = () => {
    if (typed === null) return
    const parsed = parseTimecode(typed, value)
    if (parsed !== null) onCommit(parsed)
    setTyped(null)
  }
  return (
    <Input
      id={id}
      value={typed ?? formatTimecode(value)}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      className={cn("h-8 w-20 px-2 text-center tabular-nums", className)}
      onFocus={(event) => event.target.select()}
      onChange={(event) => setTyped(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return
        if (event.key === "Enter") {
          event.preventDefault()
          commit()
          event.currentTarget.blur()
        } else if (event.key === "Escape") {
          event.preventDefault()
          setTyped(null)
          event.currentTarget.blur()
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault()
          const step =
            (event.shiftKey ? 5 : 1) * (event.key === "ArrowUp" ? 1 : -1)
          setTyped(null)
          onCommit(Math.max(0, value + step))
        }
      }}
    />
  )
}

function TrackOption({ track }: { track: Track }) {
  const { t } = useT()
  const details = [track.album, track.year].filter(Boolean).join(" · ")
  return (
    <>
      <TrackArt song={{ id: track.key, art: track.art }} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{track.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {[track.artist, details].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted-foreground">
        {track.seconds ? (
          <span className="tabular-nums">{formatTimecode(track.seconds)}</span>
        ) : null}
        <span className="text-[0.65rem] opacity-70">
          {track.source === "musicdex"
            ? t("videoEdit.songs.onHolodex")
            : "iTunes"}
        </span>
      </span>
    </>
  )
}

/**
 * The song's name doubles as the search for it: start typing and real tracks are
 * offered, take one and everything else fills itself in, or ignore them and what
 * you typed is the name. Originals that were never released work the same way.
 */
export function SongNameField({
  song,
  disabled,
  autoFocus,
  autoHighlight,
  onCommitted,
}: {
  song: SongDraft
  disabled?: boolean
  autoFocus?: boolean
  autoHighlight?: boolean
  /** Enter or a picked track: the name is settled, so move along. */
  onCommitted?: () => void
}) {
  const { t } = useT()
  const fieldId = useId()
  const workspace = useSongWorkspace()
  // Only for someone actively looking: a name that's just sitting there, or
  // that matching already filled in, shouldn't spend Apple's search allowance.
  const [looking, setLooking] = useState(false)
  const query = useDebounced(song.name.trim(), 350)
  const results = useQuery({
    queryKey: ["track-search", query],
    queryFn: ({ signal }) => searchTracks(query, signal),
    enabled: looking && query.length >= 2,
    staleTime: 10 * 60_000,
    retry: false,
    placeholderData: (previous) => previous,
  })
  const tracks = query.length >= 2 ? (results.data?.tracks ?? []) : []
  return (
    <div className="grid min-w-0 flex-1 gap-1">
      <label
        htmlFor={fieldId}
        className="flex items-center gap-1 text-xs text-muted-foreground"
      >
        {t("editor.music.trackNameInput")}
        <ShortcutHint shortcut="search" />
      </label>
      <SuggestField
        id={fieldId}
        value={song.name}
        items={tracks}
        itemKey={(track) => track.key}
        itemText={(track) => track.name}
        renderItem={(track) => <TrackOption track={track} />}
        placeholder={t("videoEdit.songs.namePlaceholder")}
        disabled={disabled}
        autoFocus={autoFocus}
        autoHighlight={autoHighlight}
        invalid={!song.name.trim()}
        className="h-8"
        marker="song-name-field"
        onOpenChange={(open) => {
          if (open) setLooking(true)
        }}
        onBlur={() => setLooking(false)}
        empty={
          results.isFetching
            ? t("component.search.searching")
            : query.length >= 2
              ? results.data?.partial
                ? t("videoEdit.songs.searchPartial")
                : t("videoEdit.songs.noTracks")
              : undefined
        }
        onValueChange={(name) => {
          setLooking(true)
          useSongEditor.getState().update(
            song.id,
            {
              name,
              matchPending: false,
              // A new name no longer goes with the old track's details.
              ...(song.itunesid
                ? { itunesid: null, art: null, amUrl: null, trackSeconds: null }
                : {}),
            },
            { group: `name:${song.id}` }
          )
        }}
        onPick={(track) => {
          workspace.pickTrack(song.id, track)
          onCommitted?.()
        }}
        onKeyDown={(event) => {
          // Enter also confirms a Japanese conversion, which isn't "I'm done".
          if (event.nativeEvent.isComposing) return
          if (event.key === "Enter" || event.key === "Escape") {
            // Lets the shortcuts work again, once the popup has had the key.
            const input = event.currentTarget
            requestAnimationFrame(() => input.blur())
            if (event.key === "Enter") onCommitted?.()
          }
        }}
      />
    </div>
  )
}

function ShortcutHint({ shortcut }: { shortcut: SongShortcut }) {
  return (
    <Kbd className="hidden h-4 min-w-4 text-[0.65rem] lg:inline-flex">
      {SONG_SHORTCUT_KEYS[shortcut]}
    </Kbd>
  )
}

/** One end of a song: type it, nudge it, take it from the playhead, or hear it. */
export function EdgeControl({
  song,
  edge,
  disabled,
  compact,
}: {
  song: SongDraft
  edge: SongEdge
  disabled?: boolean
  compact?: boolean
}) {
  const { t } = useT()
  const fieldId = useId()
  const workspace = useSongWorkspace()
  const second = usePlayheadSecond(workspace.clock)
  const isStart = edge === "start"
  return (
    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
      <div className="grid gap-1">
        <label htmlFor={fieldId} className="text-xs text-muted-foreground">
          {t(isStart ? "editor.music.startInput" : "videoEdit.songs.endLabel")}
        </label>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={t(
              isStart
                ? "videoEdit.keys.startEarlier"
                : "videoEdit.keys.endEarlier"
            )}
            title={t(
              isStart
                ? "videoEdit.keys.startEarlier"
                : "videoEdit.keys.endEarlier"
            )}
            onClick={() => workspace.nudge(edge, -1)}
          >
            <MinusIcon />
          </Button>
          <TimeField
            id={fieldId}
            value={song[edge]}
            disabled={disabled}
            onCommit={(seconds) => workspace.setEdge(song.id, edge, seconds)}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={t(
              isStart ? "videoEdit.keys.startLater" : "videoEdit.keys.endLater"
            )}
            title={t(
              isStart ? "videoEdit.keys.startLater" : "videoEdit.keys.endLater"
            )}
            onClick={() => workspace.nudge(edge, 1)}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          title={t("videoEdit.songs.usePlayhead", {
            time: formatTimecode(second),
          })}
          onClick={() =>
            workspace.setEdge(song.id, edge, workspace.clock.now())
          }
        >
          <CrosshairSimpleIcon data-icon="inline-start" />
          <span className={cn("tabular-nums", compact && "sr-only")}>
            {formatTimecode(second)}
          </span>
          <ShortcutHint shortcut={isStart ? "markStart" : "markEnd"} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          title={t(
            isStart ? "videoEdit.keys.hearStart" : "videoEdit.keys.hearEnd"
          )}
          onClick={() => workspace.hear(edge, song)}
        >
          <EarIcon data-icon="inline-start" />
          <span className={cn(compact && "sr-only")}>
            {t(
              isStart ? "videoEdit.songs.hearStart" : "videoEdit.songs.hearEnd"
            )}
          </span>
        </Button>
      </div>
    </div>
  )
}

const ISSUE_KEYS: Record<SongIssue, string> = {
  name: "videoEdit.songs.issues.name",
  order: "videoEdit.songs.issues.order",
  short: "videoEdit.songs.issues.short",
  "past-end": "videoEdit.songs.issues.pastEnd",
  overlap: "videoEdit.songs.issues.overlap",
}

/** What could be better about a song right now, in a sentence each. */
export function useSongNotes(song: SongDraft): {
  issues: SongIssue[]
  messages: string[]
} {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const result = useSongEditor((state) => state.saveResults[song.id])
  const issues = songIssues(song, workspace.songs, workspace.duration)
  return {
    issues,
    messages: [
      ...issues.map((issue) => t(ISSUE_KEYS[issue])),
      ...(result && result !== "saved"
        ? [t(`videoEdit.songs.saveResults.${result}`)]
        : []),
    ],
  }
}

/** Everything about one song, used wherever one is being worked on. */
export function SongForm({
  song,
  removed,
  autoFocusName,
  autoHighlightName,
  compact,
  doneLabel,
  onDone,
  onNameCommitted,
}: {
  song: SongDraft
  removed?: boolean
  autoFocusName?: boolean
  autoHighlightName?: boolean
  compact?: boolean
  doneLabel?: string
  onDone?: () => void
  onNameCommitted?: () => void
}) {
  const { t } = useT()
  const artistId = useId()
  const workspace = useSongWorkspace()
  const candidates = useSongEditor(
    (state) => state.matches[song.id]?.candidates ?? NO_TRACKS
  )
  const { messages } = useSongNotes(song)
  const locked = !workspace.canEdit(song)
  const nearby = hintsNear(workspace.hints, song.start)
    .filter(
      (hint) =>
        hint.title.toLowerCase() !== song.name.trim().toLowerCase() &&
        hint.text !== song.fromText
    )
    .slice(0, 3)
  const update = useSongEditor((state) => state.update)

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
        <SongNameField
          song={song}
          disabled={locked}
          autoFocus={autoFocusName}
          autoHighlight={autoHighlightName}
          onCommitted={onNameCommitted}
        />
        <div className="grid min-w-40 flex-1 gap-1">
          <label htmlFor={artistId} className="text-xs text-muted-foreground">
            {t("editor.music.originalArtistInput")}
          </label>
          <Input
            id={artistId}
            value={song.original_artist}
            disabled={locked}
            className="h-8"
            placeholder={t("videoEdit.songs.artistPlaceholder")}
            onChange={(event) =>
              update(
                song.id,
                {
                  original_artist: event.target.value,
                  matchPending: false,
                },
                { group: `artist:${song.id}` }
              )
            }
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return
              if (event.key === "Enter" || event.key === "Escape")
                event.currentTarget.blur()
            }}
          />
        </div>
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
            <span className="min-w-0 truncate">
              {t("videoEdit.songs.writtenAs", { text: song.fromText })}
            </span>
            <button
              type="button"
              className="cursor-pointer underline underline-offset-2 outline-none hover:text-foreground focus-visible:text-foreground"
              onClick={() => {
                const written = splitTitleArtist(song.fromText!)
                update(song.id, {
                  name: written.title,
                  original_artist: written.artist,
                  itunesid: null,
                  art: null,
                  amUrl: null,
                  trackSeconds: null,
                  matchPending: false,
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
                  title={t("videoEdit.songs.useThis")}
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

      <div className="flex flex-wrap gap-x-4 gap-y-2">
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
          compact={compact}
        />
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

      {messages.length > 0 && (
        <ul className="grid gap-0.5 text-xs text-destructive">
          {messages.map((message) => (
            <li key={message} className="flex items-center gap-1.5">
              <WarningIcon className="size-3.5 shrink-0" />
              {message}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
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
        <span className="flex-1" />
        <span className="text-xs text-muted-foreground tabular-nums">
          {t("videoEdit.songs.length", {
            time: formatTimecode(Math.max(0, song.end - song.start)),
          })}
        </span>
        {onDone && (
          <Button size="sm" onClick={onDone}>
            <CheckIcon data-icon="inline-start" />
            {doneLabel ?? t("videoEdit.songs.done")}
          </Button>
        )}
      </div>
    </div>
  )
}

const NO_TRACKS: Track[] = []
