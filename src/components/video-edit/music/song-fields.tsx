import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { cn } from "cn"

import {
  ArrowsLeftRightIcon,
  CrosshairSimpleIcon,
  EarIcon,
  MusicNoteIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { useDebounced } from "@/hooks/use-debounced"
import { useT } from "@/lib/i18n"
import type { PlayerClock } from "@/lib/video-edit/player-clock"
import { readPastedSong } from "@/lib/video-edit/setlist"
import {
  SONG_SHORTCUT_KEYS,
  type SongShortcut,
} from "@/lib/video-edit/shortcuts"
import {
  artistSuggestions,
  type SongDraft,
  type Track,
} from "@/lib/video-edit/songs"
import { formatTimecode } from "@/lib/video-edit/timecode"
import { dedupeTracks, isSearchable } from "@/lib/video-edit/track-match"
import {
  searchItunesTracks,
  searchMusicdexTracks,
} from "@/lib/video-edit/track-search"
import { useSongEditor } from "@/stores/song-editor"
import { SuggestField } from "../suggest-field"
import { TimeField } from "./time-field"
import { usePlayheadSecond, useSongWorkspace, type SongEdge } from "./workspace"

/** Long enough to finish a thought, short enough to feel like it's listening. */
const SEARCH_DEBOUNCE_MS = 350

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
  // Covers are hotlinked and old ones disappear, which shouldn't leave a broken image.
  const [failed, setFailed] = useState<string | null>(null)
  const art = song.art && song.art !== failed ? song.art : null
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground",
        className
      )}
      style={{ width: size, height: size }}
    >
      {art ? (
        <img
          src={art}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailed(art)}
        />
      ) : searching ? (
        <Spinner />
      ) : (
        <MusicNoteIcon className="size-1/2" />
      )}
    </span>
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
 * Asks each source on its own, so that Holodex's answer doesn't wait for Apple's,
 * which a rate limit can hold back for a minute. Later results only ever add to the
 * end of the list, so nothing moves under the pointer or the highlight.
 */
function useTrackSearch(query: string, active: boolean) {
  const enabled = active && isSearchable(query)
  const shared = {
    enabled,
    staleTime: 10 * 60_000,
    retry: false,
    placeholderData: keepPreviousData,
  }
  const musicdex = useQuery({
    queryKey: ["track-search", "musicdex", query],
    queryFn: ({ signal }) => searchMusicdexTracks(query, signal),
    ...shared,
  })
  const itunes = useQuery({
    queryKey: ["track-search", "itunes", query],
    queryFn: ({ signal }) => searchItunesTracks(query, signal),
    ...shared,
  })
  const tracks = useMemo(
    () =>
      isSearchable(query)
        ? dedupeTracks([...(musicdex.data ?? []), ...(itunes.data ?? [])])
        : [],
    [query, musicdex.data, itunes.data]
  )
  return {
    tracks,
    busy: enabled && (musicdex.isFetching || itunes.isFetching),
    partial: enabled && (musicdex.isError || itunes.isError),
    outdated: musicdex.isPlaceholderData || itunes.isPlaceholderData,
  }
}

/**
 * The song's name doubles as the search for it: start typing and real tracks are
 * offered, take one and everything else fills itself in, or ignore them and what
 * you typed is the name. Originals that were never released work the same way.
 *
 * A name that was typed and never taken from the list still gets looked up on the
 * way out of the field, the same as a line from a comment would. A whole line
 * pasted in, time and artist included, fills in what it can.
 */
export function SongNameField({
  song,
  disabled,
  autoFocus,
  autoHighlight,
}: {
  song: SongDraft
  disabled?: boolean
  autoFocus?: boolean
  /** Enter takes the first match, for tapping along with no time to look. */
  autoHighlight?: boolean
}) {
  const { t } = useT()
  const fieldId = useId()
  const workspace = useSongWorkspace()
  // Only for someone actively looking: a name that's just sitting there, or
  // that matching already filled in, shouldn't spend Apple's search allowance.
  const [looking, setLooking] = useState(false)
  const edited = useRef(false)
  const attemptedSave = useSongEditor((state) => state.attemptedSave)
  const name = song.name.trim()
  const query = useDebounced(name, SEARCH_DEBOUNCE_MS)
  const search = useTrackSearch(query, looking)
  const stale = name !== query || search.outdated
  return (
    <div className="grid min-w-40 flex-1 gap-1">
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
        items={search.tracks}
        itemKey={(track) => track.key}
        itemText={(track) => track.name}
        renderItem={(track) => <TrackOption track={track} />}
        placeholder={t("videoEdit.songs.namePlaceholder")}
        disabled={disabled}
        autoFocus={autoFocus}
        autoHighlight={autoHighlight}
        stale={stale}
        busy={search.busy}
        searchLabel={t("videoEdit.songs.searchTracks")}
        leaveOnSettle
        invalid={attemptedSave && !name}
        className="h-8 pointer-coarse:h-9"
        marker="song-name-field"
        onOpenChange={setLooking}
        onBlur={() => {
          setLooking(false)
          workspace.settleText(song.id, "name", edited.current)
          edited.current = false
        }}
        // Nothing at all on a first letter, rather than a popup flashing up to
        // say that there's nothing to say yet.
        empty={
          !name
            ? t("component.search.typeToSearch")
            : !isSearchable(name)
              ? undefined
              : search.busy || stale
                ? t("component.search.searching")
                : search.partial
                  ? t("videoEdit.songs.searchPartial")
                  : t("videoEdit.songs.noTracks")
        }
        footer={
          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
            <span className="flex items-center gap-1 pointer-coarse:hidden">
              <Kbd>{SONG_SHORTCUT_KEYS.confirm}</Kbd>
              {t(
                autoHighlight
                  ? "videoEdit.songs.enterTakes"
                  : "videoEdit.songs.enterKeeps"
              )}
            </span>
            {search.partial && (
              <span>{t("videoEdit.songs.searchPartial")}</span>
            )}
          </span>
        }
        onValueChange={(next) => {
          edited.current = true
          setLooking(true)
          workspace.rename(song.id, next)
        }}
        onPick={(track) => {
          edited.current = false
          setLooking(false)
          workspace.pickTrack(song.id, track)
        }}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text")
          const pasted = readPastedSong(text, workspace.duration || undefined)
          if (pasted.kind === "plain") return
          const { value, selectionStart, selectionEnd } = event.currentTarget
          const replacesAll =
            !value.trim() ||
            (selectionStart === 0 && selectionEnd === value.length)
          // Into the middle of a name, it's only ever more of the name.
          if (pasted.kind === "one" && !replacesAll) return
          event.preventDefault()
          edited.current = pasted.kind === "one"
          workspace.applyPaste(song.id, text, pasted)
        }}
      />
    </div>
  )
}

/**
 * Offers the artists already on this video, because a stream tends to return to the
 * same few and one spelled two ways is two artists on Musicdex. "Artist - Song" is
 * common in comments too, and nothing can tell without real track data, so anything
 * that came out backwards is one click from being put right.
 */
export function SongArtistField({
  song,
  disabled,
  className,
}: {
  song: SongDraft
  disabled?: boolean
  className?: string
}) {
  const { t } = useT()
  const fieldId = useId()
  const workspace = useSongWorkspace()
  const edited = useRef(false)
  const { songs } = workspace
  const options = useMemo(
    () =>
      artistSuggestions(
        song.original_artist,
        songs.filter((other) => other.id !== song.id)
      ),
    [song.original_artist, song.id, songs]
  )
  const update = (original_artist: string) =>
    useSongEditor
      .getState()
      .update(
        song.id,
        { original_artist, matchPending: false },
        { group: `artist:${song.id}` }
      )
  return (
    <div className={cn("grid min-w-40 flex-1 gap-1", className)}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <label htmlFor={fieldId}>{t("editor.music.originalArtistInput")}</label>
        {!disabled && (song.name.trim() || song.original_artist.trim()) && (
          <button
            type="button"
            // The next stop after the name should be the artist, not this.
            tabIndex={-1}
            title={t("videoEdit.songs.swapHint")}
            className="flex cursor-pointer items-center gap-1 rounded-sm outline-none hover:text-foreground"
            onClick={() => workspace.swapNameArtist(song.id)}
          >
            <ArrowsLeftRightIcon className="size-3" />
            {t("videoEdit.songs.swap")}
          </button>
        )}
      </div>
      <SuggestField
        id={fieldId}
        value={song.original_artist}
        items={options}
        itemKey={(artist) => artist}
        itemText={(artist) => artist}
        renderItem={(artist) => (
          <span className="min-w-0 truncate">{artist}</span>
        )}
        placeholder={t("videoEdit.songs.artistPlaceholder")}
        disabled={disabled}
        leaveOnSettle
        className="h-8 pointer-coarse:h-9"
        onBlur={() => {
          workspace.settleText(song.id, "artist", edited.current)
          edited.current = false
        }}
        onValueChange={(next) => {
          edited.current = true
          update(next)
        }}
        onPick={(artist) => {
          edited.current = true
          update(artist)
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

const withKey = (label: string, shortcut: SongShortcut) =>
  `${label} (${SONG_SHORTCUT_KEYS[shortcut]})`

/**
 * Fills the "hear ending" button over the run-up to a song's end, and stays full
 * once playback has stopped there. It goes as soon as the playhead is moved away.
 */
function HearProgress({ clock, end }: { clock: PlayerClock; end: number }) {
  const bar = useRef<HTMLSpanElement>(null)
  const { state } = useSyncExternalStore(clock.subscribeStatus, clock.getStatus)
  const playing = state === "playing"
  // A seek while paused changes nothing else, and should still clear the bar.
  const second = usePlayheadSecond(clock)

  useEffect(() => {
    const draw = () => {
      const element = bar.current
      if (!element) return
      const window = clock.hearing
      const now = clock.now()
      const active =
        window?.to === end && now >= window.from - 0.5 && now <= end + 0.5
      element.style.transform = active
        ? `scaleX(${Math.min(1, Math.max(0, (now - window.from) / (window.to - window.from)))})`
        : "scaleX(0)"
    }
    draw()
    if (!playing) return
    let frame = requestAnimationFrame(function tick() {
      draw()
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [clock, end, playing, second])

  return (
    <span
      ref={bar}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 origin-left bg-primary/25"
      // Not a `scale-x-*` class: Tailwind sets the separate `scale` property, which
      // would multiply with this transform and keep the bar at nothing.
      style={{ transform: "scaleX(0)" }}
    />
  )
}

/** One end of a song: type it, nudge it, take it from the playhead, or hear it. */
export function EdgeControl({
  song,
  edge,
  disabled,
  invalid,
  compact,
}: {
  song: SongDraft
  edge: SongEdge
  disabled?: boolean
  invalid?: boolean
  compact?: boolean
}) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const second = usePlayheadSecond(workspace.clock)
  const isStart = edge === "start"
  const usePlayhead = t("videoEdit.songs.usePlayhead", {
    time: formatTimecode(second),
  })
  const hearLabel = t(
    isStart ? "videoEdit.songs.hearStart" : "videoEdit.songs.hearEnd"
  )
  return (
    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
      <TimeField
        label={t(
          isStart ? "editor.music.startInput" : "videoEdit.songs.endLabel"
        )}
        value={song[edge]}
        disabled={disabled}
        invalid={invalid}
        max={workspace.duration}
        marker={isStart ? undefined : "song-end-field"}
        // An end can't come before the start.
        after={isStart ? undefined : song.start}
        stepLabels={
          isStart
            ? {
                earlier: withKey(
                  t("videoEdit.keys.startEarlier"),
                  "startEarlier"
                ),
                later: withKey(t("videoEdit.keys.startLater"), "startLater"),
              }
            : {
                earlier: withKey(t("videoEdit.keys.endEarlier"), "endEarlier"),
                later: withKey(t("videoEdit.keys.endLater"), "endLater"),
              }
        }
        onStepButton={(delta) => workspace.nudge(edge, delta, song)}
        onCommit={(seconds, how) =>
          workspace.commitEdge(song.id, edge, seconds, how)
        }
      />
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label={usePlayhead}
          title={withKey(usePlayhead, isStart ? "markStart" : "markEnd")}
          onClick={() =>
            workspace.commitEdge(song.id, edge, workspace.clock.now(), "blur")
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
          className="relative overflow-hidden"
          aria-label={hearLabel}
          title={withKey(hearLabel, isStart ? "hearStart" : "hearEnd")}
          onClick={() => workspace.hear(edge, song)}
        >
          {!isStart && <HearProgress clock={workspace.clock} end={song.end} />}
          <EarIcon data-icon="inline-start" />
          <span className={cn(compact && "sr-only")}>{hearLabel}</span>
        </Button>
      </div>
    </div>
  )
}

/** How long it runs, for when that's what you know: "it's about four minutes". */
export function LengthField({
  song,
  disabled,
  invalid,
}: {
  song: SongDraft
  disabled?: boolean
  invalid?: boolean
}) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  return (
    <TimeField
      label={t("videoEdit.songs.lengthLabel")}
      value={Math.max(0, song.end - song.start)}
      disabled={disabled}
      invalid={invalid}
      max={workspace.duration ? workspace.duration - song.start : undefined}
      onCommit={(seconds, how) =>
        workspace.commitEdge(song.id, "end", song.start + seconds, how)
      }
    />
  )
}
