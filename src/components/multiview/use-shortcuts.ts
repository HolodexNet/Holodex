import { useEffect } from "react"

import {
  commandFor,
  isCharacterKey,
  keyFromEvent,
  runsWhile,
  shortcutRepeats,
  targetOwnsKey,
  type ShortcutId,
} from "@/lib/multiview/shortcuts"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewShortcuts } from "@/stores/multiview-shortcuts"
import { useMultiviewUi } from "@/stores/multiview-ui"
import {
  catchUp,
  moveSound,
  nudgeVolume,
  reloadAll,
  SEEK_SECONDS,
  seekBack,
  seekForward,
  stepSyncRate,
  syncSeekBy,
  toggleAudioFocus,
  togglePlayback,
  toggleSound,
  toggleSyncPlayback,
  unmuteAll,
} from "./media-actions"
import { useMultiviewCommands } from "./use-commands"
import { toggleFullscreen } from "./use-fullscreen"

/** Anything open that takes the keyboard for itself while it is up. */
const OVERLAY =
  '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"]'

/** Every key the multiview answers to, while nothing else has claimed it. */
export function useShortcuts() {
  const { addCell } = useMultiviewCommands()

  useEffect(() => {
    const multiview = () => useMultiview.getState()
    const ui = () => useMultiviewUi.getState()

    const run: Record<ShortcutId, () => void> = {
      "play-pause": togglePlayback,
      "seek-back": seekBack,
      "seek-forward": seekForward,
      "catch-up": catchUp,
      "reload-all": reloadAll,

      mute: toggleSound,
      "unmute-all": unmuteAll,
      "audio-focus": toggleAudioFocus,
      "hear-previous": () => moveSound(-1),
      "hear-next": () => moveSound(1),
      "volume-up": () => nudgeVolume(1),
      "volume-down": () => nudgeVolume(-1),

      edit: () =>
        multiview().editing
          ? multiview().exitEditing()
          : multiview().enterEditing(),
      undo: () => multiview().undo(),
      redo: () => multiview().redo(),
      "add-video": () => ui().set({ picker: { kind: "auto" } }),
      "add-cell": addCell,
      presets: () => ui().set({ presetDialogOpen: true }),
      "media-controls": () =>
        ui().set({ mediaControlsOpen: !ui().mediaControlsOpen }),
      fullscreen: toggleFullscreen,
      toolbar: () => ui().set({ toolbarCollapsed: !ui().toolbarCollapsed }),
      help: () => ui().set({ helpOpen: true }),

      "sync-bar": () => ui().set({ syncBarOpen: !ui().syncBarOpen }),
      "sync-play-pause": toggleSyncPlayback,
      "sync-back": () => syncSeekBy(-SEEK_SECONDS),
      "sync-forward": () => syncSeekBy(SEEK_SECONDS),
      "sync-slower": () => stepSyncRate(-1),
      "sync-faster": () => stepSyncRate(1),
    }

    const onKey = (event: KeyboardEvent) => {
      // Something handled it already, such as arrow keys on a cell being edited.
      if (event.defaultPrevented || event.isComposing) return
      const key = keyFromEvent(event)
      if (!key) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (targetOwnsKey(target, key)) return
      if (document.querySelector(OVERLAY)) return

      const { editing, exitEditing } = multiview()
      if (key === "Escape") {
        if (editing) exitEditing()
        return
      }

      const { overrides, characterKeys } = useMultiviewShortcuts.getState()
      if (!characterKeys && isCharacterKey(key)) return
      const command = commandFor(key, overrides)
      if (!command || !runsWhile(command, editing)) return
      event.preventDefault()
      if (event.repeat && !shortcutRepeats(command)) return
      run[command]()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [addCell])
}
