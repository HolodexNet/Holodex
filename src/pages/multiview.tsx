import { useEffect, useRef } from "react"
import { useParams, useSearchParams } from "react-router"
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  MotionConfig,
} from "motion/react"

import { AudioFocusLayer } from "@/components/multiview/audio-focus-layer"
import { EditLayer } from "@/components/multiview/edit-layer"
import { DropShield } from "@/components/multiview/drop-shield"
import { FrameLayer, HighlightLayer } from "@/components/multiview/frame-layer"
import { Hints } from "@/components/multiview/hints"
import { KeyboardFocusTab } from "@/components/multiview/keyboard-focus-tab"
import { MediaControls } from "@/components/multiview/media-controls"
import {
  LayoutPromptDialog,
  PresetDialog,
  SaveLayoutDialog,
} from "@/components/multiview/preset-menu"
import { ShortcutHelp } from "@/components/multiview/shortcut-help"
import { StageSizeProvider } from "@/components/multiview/stage-size"
import { SyncBar } from "@/components/multiview/sync-bar"
import { Toolbar } from "@/components/multiview/toolbar"
import { requestLayout } from "@/components/multiview/use-commands"
import { useShortcuts } from "@/components/multiview/use-shortcuts"
import { useVideoDetails } from "@/components/multiview/use-video-details"
import { VideoPickerDialog } from "@/components/multiview/video-picker-dialog"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { decodeLayout, encodeLayout } from "@/lib/multiview/codec"
import { instantiateSlots } from "@/lib/multiview/cells"
import { useMusicPlayer } from "@/stores/music-player"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewUi } from "@/stores/multiview-ui"
import "@/stores/multiview-playback"

/** Opens a shared layout, asking first if that would replace anything. */
function usePermalink(encoded: string | undefined) {
  const [params] = useSearchParams()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    if (!encoded || handled.current === encoded) return
    handled.current = encoded

    const layout = decodeLayout(encoded)
    if (!layout) return
    // Counts one visit, which is why strict mode's second run stops above.
    api.trackMultiviewLink(encoded).catch(() => {})

    if (params.has("t") || params.has("offsets")) {
      useMultiviewUi.getState().set({ syncBarOpen: true })
    }

    // Reloading a link that is already what is on screen is not a replacement.
    const current = useMultiview.getState().cells
    const same =
      encodeLayout(current, { includeVideo: true }) ===
      encodeLayout(instantiateSlots(layout.slots), { includeVideo: true })
    if (same) return

    requestLayout(layout, {
      // Declined: drop the link quietly so that a reload will not ask again.
      onCancel: () => window.history.pushState({}, "", "/multiview"),
    })
  }, [encoded, params])
}

export default function MultiviewPage() {
  const { t } = useT()
  const { layout } = useParams()
  const editing = useMultiview((s) => s.editing)
  const isEmpty = useMultiview((s) => s.cells.length === 0)
  const exitEditing = useMultiview((s) => s.exitEditing)
  const syncBarOpen = useMultiviewUi((s) => s.syncBarOpen)

  useDocumentTitle(t("component.mainNav.multiview"))
  usePermalink(layout)
  useVideoDetails({ refreshLive: !layout })
  useShortcuts()

  // Streams have audio of their own; music should not play over them.
  useEffect(() => {
    useMusicPlayer.getState().pause()
    return exitEditing
  }, [exitEditing])

  // Nothing scrolls here, so the width kept aside for a scrollbar would be wasted.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.fullWindow = ""
    return () => {
      delete root.dataset.fullWindow
    }
  }, [])

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="fixed inset-0 flex flex-col bg-background">
          <Toolbar />
          <StageSizeProvider className="relative min-h-0 flex-1 overflow-hidden">
            {isEmpty && !editing && <Hints />}
            <FrameLayer />
            <HighlightLayer />
            <AudioFocusLayer />
            <AnimatePresence>
              {editing && <EditLayer key="edit" />}
            </AnimatePresence>
            <DropShield />
            <KeyboardFocusTab />
          </StageSizeProvider>
          {syncBarOpen && <SyncBar />}
        </div>
        <VideoPickerDialog />
        <PresetDialog />
        <SaveLayoutDialog />
        <LayoutPromptDialog />
        <MediaControls />
        <ShortcutHelp />
      </MotionConfig>
    </LazyMotion>
  )
}
