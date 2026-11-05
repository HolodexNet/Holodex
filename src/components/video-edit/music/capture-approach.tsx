import { useState, useSyncExternalStore } from "react"
import { cn } from "cn"

import {
  EarIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SkipForwardIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { useT } from "@/lib/i18n"
import { hintsNear } from "@/lib/video-edit/setlist"
import { SONG_SHORTCUT_KEYS } from "@/lib/video-edit/shortcuts"
import { formatTimecode } from "@/lib/video-edit/timecode"
import { useSongEditor } from "@/stores/song-editor"
import { SongForm, SongNameField, TimeField } from "./song-form"
import { Tracklist } from "./tracklist"
import {
  usePlayheadSecond,
  useSongShortcuts,
  useSongWorkspace,
} from "./workspace"

/** Nobody presses a key the instant a song starts. */
const REACTION_SECONDS = 1
/** How far before the track's expected end "skip to the end" lands. */
const END_LEAD_SECONDS = 20
/** A comment this close to the start is taken to be about the same song. */
const HINT_WINDOW_SECONDS = 30

type Step = "singing" | "wrapping"

function Transport() {
  const { t } = useT()
  const { clock, duration } = useSongWorkspace()
  const second = usePlayheadSecond(clock)
  const status = useSyncExternalStore(clock.subscribeStatus, clock.getStatus)
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      <span className="mr-1 text-sm font-medium tabular-nums">
        {formatTimecode(second)}
        {duration > 0 && (
          <span className="font-normal text-muted-foreground">
            {" "}
            / {formatTimecode(duration)}
          </span>
        )}
      </span>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("videoEdit.capture.skip", { seconds: -30 })}
        onClick={() => clock.skip(-30)}
      >
        <RewindIcon data-icon="inline-start" />
        −30
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("videoEdit.capture.skip", { seconds: -5 })}
        onClick={() => clock.skip(-5)}
      >
        −5
      </Button>
      <Button
        variant="secondary"
        size="icon"
        aria-label={t("videoEdit.keys.toggle")}
        title={t("videoEdit.keys.toggle")}
        onClick={() => clock.toggle()}
      >
        {status.state === "playing" ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("videoEdit.capture.skip", { seconds: 5 })}
        onClick={() => clock.skip(5)}
      >
        +5
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("videoEdit.capture.skip", { seconds: 30 })}
        onClick={() => clock.skip(30)}
      >
        +30
        <FastForwardIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}

/**
 * Watching along and tapping: S when a song starts, say what it is, E when it ends,
 * and on to the next. One decision on screen at a time and big enough for a thumb,
 * so it also works on a phone. The comments help by skipping the talking between
 * songs and naming what's playing, but it needs nothing except a pair of ears.
 *
 * Best when nobody has written a setlist yet, such as a stream that's just ended.
 */
export function CaptureApproach() {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const { clock, hints, rows, songs, canAdd } = workspace
  const second = usePlayheadSecond(clock)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("singing")
  const current = rows.find(
    (row) => row.song.id === currentId && row.state !== "removed"
  )?.song
  const nextHint = workspace.nextHint(second + 2)
  const store = () => useSongEditor.getState()

  const startSong = () => {
    if (!canAdd) return
    const at = Math.max(0, clock.now() - REACTION_SECONDS)
    const hint = hintsNear(hints, at, HINT_WINDOW_SECONDS)[0]
    const id = workspace.addAt(
      at,
      hint
        ? {
            name: hint.title,
            original_artist: hint.artist,
            fromText: hint.text,
            matchPending: true,
          }
        : {}
    )
    // The song being captured gets the main card, not an open row in the list.
    store().select(null)
    setCurrentId(id)
    setStep("singing")
    if (clock.getStatus().state !== "playing") clock.play()
  }

  const endSong = () => {
    if (!current) return
    workspace.setEdge(current.id, "end", clock.now())
    setStep("wrapping")
  }

  const finish = () => {
    if (current) store().update(current.id, { checked: true }, { silent: true })
    setCurrentId(null)
    setStep("singing")
  }

  useSongShortcuts({
    markStart: () => {
      if (!current) startSong()
      else workspace.setEdge(current.id, "start", clock.now())
    },
    markEnd: endSong,
    confirm: () => {
      if (current && step === "wrapping") finish()
      else if (current) endSong()
      else startSong()
    },
    cancel: () => {
      // Backing out of a song in progress; one that's finished is simply left be.
      if (current && step === "singing") store().remove(current.id)
      else if (!current) store().select(null)
      setCurrentId(null)
      setStep("singing")
    },
    // Acts on the song being captured, while there is one.
    ...(current
      ? {
          hearStart: () => workspace.hear("start", current),
          hearEnd: () => workspace.hear("end", current),
          startEarlier: () => workspace.nudge("start", -1, current),
          startLater: () => workspace.nudge("start", 1, current),
          endEarlier: () => workspace.nudge("end", -1, current),
          endLater: () => workspace.nudge("end", 1, current),
        }
      : {}),
  })

  return (
    <>
      <div
        className={cn(
          "sticky top-[56.25vw] z-10 grid content-start gap-3 border-t bg-card p-3 lg:static lg:[grid-area:transport]"
        )}
      >
        <Transport />
        {!current ? (
          <div className="grid gap-2">
            <Button
              size="lg"
              className="h-14 w-full text-base"
              disabled={!canAdd}
              onClick={startSong}
            >
              {t("videoEdit.capture.songStarted")}
              <Kbd className="ml-1 bg-primary-foreground/20 text-primary-foreground">
                {SONG_SHORTCUT_KEYS.markStart}
              </Kbd>
            </Button>
            {nextHint && (
              <Button
                variant="outline"
                className="h-auto w-full justify-start py-1.5"
                onClick={() => clock.hearFrom(Math.max(0, nextHint.start - 3))}
              >
                <SkipForwardIcon data-icon="inline-start" />
                <span className="min-w-0 flex-1 truncate text-left">
                  {t("videoEdit.capture.skipTo", {
                    time: formatTimecode(nextHint.start),
                    text: nextHint.text,
                  })}
                </span>
                <Kbd className="hidden lg:inline-flex">
                  {SONG_SHORTCUT_KEYS.nextHint}
                </Kbd>
              </Button>
            )}
          </div>
        ) : step === "singing" ? (
          <div className="grid gap-2">
            <div className="flex flex-wrap items-end gap-2">
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">
                  {t("editor.music.startInput")}
                </span>
                <TimeField
                  value={current.start}
                  aria-label={t("editor.music.startInput")}
                  onCommit={(seconds) =>
                    workspace.setEdge(current.id, "start", seconds)
                  }
                />
              </div>
              {/* Not focused on its own: E has to end the song, not type an "e". */}
              <SongNameField song={current} autoHighlight />
              <div className="grid min-w-32 flex-1 gap-1">
                <label
                  htmlFor="capture-artist"
                  className="text-xs text-muted-foreground"
                >
                  {t("editor.music.originalArtistInput")}
                </label>
                <Input
                  id="capture-artist"
                  value={current.original_artist}
                  className="h-8"
                  placeholder={t("videoEdit.songs.artistPlaceholder")}
                  onChange={(event) =>
                    store().update(
                      current.id,
                      {
                        original_artist: event.target.value,
                        matchPending: false,
                      },
                      { group: `artist:${current.id}` }
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
            <div className="flex flex-wrap gap-2">
              <Button
                size="lg"
                className="h-14 min-w-48 flex-1 text-base"
                onClick={endSong}
              >
                {t("videoEdit.capture.songEnded")}
                <Kbd className="ml-1 bg-primary-foreground/20 text-primary-foreground">
                  {SONG_SHORTCUT_KEYS.markEnd}
                </Kbd>
              </Button>
              {!!current.trackSeconds && (
                <Button
                  variant="outline"
                  className="h-14"
                  onClick={() =>
                    clock.hearFrom(
                      current.start + current.trackSeconds! - END_LEAD_SECONDS
                    )
                  }
                >
                  <SkipForwardIcon data-icon="inline-start" />
                  {t("videoEdit.capture.skipToEnd", {
                    time: formatTimecode(current.trackSeconds),
                  })}
                </Button>
              )}
              <Button
                variant="ghost"
                className="h-14"
                onClick={() => workspace.hear("start", current)}
              >
                <EarIcon data-icon="inline-start" />
                {t("videoEdit.songs.hearStart")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="-m-3 lg:max-h-[45dvh] lg:overflow-y-auto">
            <SongForm
              song={current}
              compact
              doneLabel={t("videoEdit.capture.nextSong")}
              onDone={finish}
            />
          </div>
        )}
      </div>
      <Tracklist
        compact
        className="border-t lg:overflow-hidden lg:border-t-0 lg:border-l lg:[grid-area:rail]"
        empty={
          <p className="p-6 text-center text-sm text-muted-foreground">
            {canAdd ? t("videoEdit.capture.empty") : t("videoEdit.songs.none")}
          </p>
        }
        header={
          songs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("videoEdit.capture.tapToChange")}
            </span>
          )
        }
      />
    </>
  )
}
