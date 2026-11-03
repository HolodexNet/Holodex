import { getT } from "@/lib/i18n"
import { audibleCells, mainVideoCell, videoCells } from "@/lib/multiview/cells"
import { PLAYBACK_RATES } from "@/lib/multiview/sync"
import type { CellId, VideoCell } from "@/lib/multiview/types"
import { channelName } from "@/lib/video"
import { useMultiview } from "@/stores/multiview"
import { playbackHub } from "@/stores/multiview-playback"
import { useSettings } from "@/stores/settings"
import { archiveClock, currentTimeline } from "@/stores/multiview-sync"
import { useMultiviewUi } from "@/stores/multiview-ui"

/** What the control surfaces and the keyboard both do to the streams. */

export const SEEK_SECONDS = 10
const VOLUME_STEP = 5
export const FAST_RATE = 2

const multiview = () => useMultiview.getState()
const ui = () => useMultiviewUi.getState()
const videos = () => videoCells(multiview().cells)
const player = (cell: VideoCell) => playbackHub.controller(cell.id)

const isPlaying = (cell: VideoCell) => {
  const state = playbackHub.getStatus(cell.id)?.state
  return state === "playing" || state === "buffering"
}

/** The timeline, but only while the clock is actually driving the players. */
const runningTimeline = () =>
  archiveClock.running ? currentTimeline(multiview().cells) : null

/**
 * While the clock runs it decides for the archives. Moving those players directly
 * would only have it seek them straight back.
 */
function setAllPlaying(playing: boolean) {
  const timeline = runningTimeline()
  if (timeline) archiveClock.setPaused(!playing)
  const onTimeline = new Set(timeline?.videos.map((video) => video.id))
  for (const cell of videos()) {
    if (onTimeline.has(cell.content.video.id)) continue
    if (playing) player(cell)?.play()
    else player(cell)?.pause()
  }
}

export const playAll = () => setAllPlaying(true)
export const pauseAll = () => setAllPlaying(false)

export function togglePlayback() {
  setAllPlaying(
    runningTimeline()
      ? archiveClock.getSnapshot().paused
      : !videos().some(isPlaying)
  )
}

export function seekBy(seconds: number) {
  if (runningTimeline()) {
    archiveClock.seek(archiveClock.getSnapshot().currentTs + seconds)
    return
  }
  for (const cell of videos()) {
    const time = playbackHub.getStatus(cell.id)?.currentTime
    if (time !== undefined) player(cell)?.seekTo(Math.max(time + seconds, 0))
  }
}

export const seekBack = () => seekBy(-SEEK_SECONDS)
export const seekForward = () => seekBy(SEEK_SECONDS)

/**
 * Live streams catch up at double speed until they hit the live edge; anything
 * else simply toggles between speeds.
 */
export function catchUp() {
  for (const cell of videos()) {
    const rate = playbackHub.getStatus(cell.id)?.playbackRate ?? 1
    const live = cell.content.video.status === "live"
    player(cell)?.setPlaybackRate(live || rate === 1 ? FAST_RATE : 1)
  }
}

export const reloadAll = () => ui().reload(videos().map((cell) => cell.id))

/** Who to bring back when the sound is switched on again. */
let silenced: CellId[] = []

/** Silence everything at a stroke, and put back exactly what was on before. */
export function toggleSound() {
  const store = multiview()
  const { t } = getT()
  const audible = audibleCells(store.cells)
  if (audible.length) {
    silenced = audible.map((cell) => cell.id)
    store.setAllMuted(true)
    ui().showNotice({
      cellId: null,
      icon: "muted",
      text: t("views.multiview.audioFocus.soundOff"),
    })
    return
  }
  const remembered = videos().filter((cell) => silenced.includes(cell.id))
  const main = mainVideoCell(store.cells)
  const targets = remembered.length ? remembered : main ? [main] : []
  if (!targets.length) return
  if (store.muteOthers) store.muteAllExcept(targets[0].id)
  else targets.forEach((cell) => store.setMuted(cell.id, false))
  ui().showNotice({
    cellId: null,
    icon: "sound",
    text: t("views.multiview.audioFocus.soundOn"),
  })
}

/** Audio Focus keeps to one stream, so there is no "everyone" to unmute. */
export function unmuteAll() {
  if (!multiview().muteOthers) multiview().setAllMuted(false)
}

export const toggleAudioFocus = () =>
  multiview().setMuteOthers(!multiview().muteOthers)

/** Steps the sound through the streams, which is what Audio Focus is for. */
export function moveSound(direction: -1 | 1) {
  const store = multiview()
  const cells = videos()
  if (!cells.length) return
  const from = cells.findIndex(
    (cell) => cell.id === audibleCells(store.cells)[0]?.id
  )
  const start = from < 0 ? (direction > 0 ? -1 : 0) : from
  const next = cells[(start + direction + cells.length) % cells.length]
  if (!store.muteOthers) store.setMuteOthers(true)
  store.muteAllExcept(next.id)
}

export function nudgeVolume(direction: -1 | 1) {
  const cell = mainVideoCell(multiview().cells)
  const controller = cell && playbackHub.controller(cell.id)
  if (!cell || !controller) return
  const current = playbackHub.getStatus(cell.id)?.volume ?? 100
  const volume = Math.min(Math.max(current + direction * VOLUME_STEP, 0), 100)
  controller.setVolume(volume)
  playbackHub.refresh(cell.id)
  const name = channelName(
    cell.content.video.channel,
    useSettings.getState().useEnglishName
  )
  ui().showNotice({
    cellId: cell.id,
    icon: volume === 0 ? "muted" : "sound",
    text: getT().t("views.multiview.audioFocus.volume", [name, volume]),
  })
}

/** Sync commands need a clock to act on, so the first one opens the bar for it. */
function onClock(action: () => void) {
  if (!archiveClock.running) ui().set({ syncBarOpen: true })
  else action()
}

export const toggleSyncPlayback = () =>
  onClock(() => archiveClock.setPaused(!archiveClock.getSnapshot().paused))

export const syncSeekBy = (seconds: number) =>
  onClock(() =>
    archiveClock.seek(archiveClock.getSnapshot().currentTs + seconds)
  )

export function stepSyncRate(direction: -1 | 1) {
  onClock(() => {
    const index = PLAYBACK_RATES.indexOf(
      archiveClock.getSnapshot().rate as (typeof PLAYBACK_RATES)[number]
    )
    const next = PLAYBACK_RATES[index + direction]
    if (next !== undefined) archiveClock.setRate(next)
  })
}
