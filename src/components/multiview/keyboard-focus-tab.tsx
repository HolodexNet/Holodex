import { useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { KeyboardIcon } from "@/components/icons"
import { useT } from "@/lib/i18n"
import { localDay } from "@/lib/multiview/shortcuts"
import { useMultiviewShortcuts } from "@/stores/multiview-shortcuts"

/** Long enough to read, without sitting over the video for the whole stream. */
const ADVERT_MS = 10_000
/** A player can take focus without the page being told, so check now and then. */
const RECHECK_MS = 1000

const frameHasFocus = () => document.activeElement?.tagName === "IFRAME"

function subscribe(listener: () => void) {
  // Focus entering a frame looks like the window blurring, and the active element
  // can still be the old one while that event runs.
  const afterBlur = () => setTimeout(listener)
  window.addEventListener("blur", afterBlur)
  window.addEventListener("focus", listener)
  document.addEventListener("focusin", listener)
  const timer = setInterval(listener, RECHECK_MS)
  return () => {
    window.removeEventListener("blur", afterBlur)
    window.removeEventListener("focus", listener)
    document.removeEventListener("focusin", listener)
    clearInterval(timer)
  }
}

/** Takes focus back from a player, for browsers where a click alone does not. */
function restoreKeyboard() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  window.focus()
}

/**
 * Keys pressed while a player has focus go to the player, and the page cannot even
 * tell. Clicking a video is the usual way to get here, so say so, and offer the
 * way back: this is often the only part of the interface left on screen.
 */
export function KeyboardFocusTab() {
  const lost = useSyncExternalStore(subscribe, frameHasFocus)
  return <AnimatePresence>{lost && <Tab key="tab" />}</AnimatePresence>
}

function Tab() {
  const { t } = useT()
  const setAdvertDay = useMultiviewShortcuts((s) => s.setFocusAdvertDay)
  const [today] = useState(() => localDay(new Date()))
  const [advertising, setAdvertising] = useState(
    () => useMultiviewShortcuts.getState().focusAdvertDay !== today
  )

  useEffect(() => {
    if (!advertising) return
    setAdvertDay(today)
    const timer = setTimeout(() => setAdvertising(false), ADVERT_MS)
    return () => clearTimeout(timer)
  }, [advertising, setAdvertDay, today])

  return (
    <m.div
      data-keyboard-tab=""
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col items-center px-2"
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.15 }}
    >
      <button
        type="button"
        className="pointer-events-auto flex max-w-full cursor-pointer items-center gap-1.5 rounded-b-lg bg-popover px-3 py-1 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none hover:bg-accent hover:text-accent-foreground focus-ring-sm"
        onClick={restoreKeyboard}
      >
        <KeyboardIcon className="size-4 shrink-0" />
        <span className="truncate">
          {t("views.multiview.keyboardFocus.tab")}
        </span>
      </button>
      <AnimatePresence>
        {advertising && (
          <m.div
            role="status"
            className="pointer-events-auto mt-2 max-w-sm"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="block cursor-pointer rounded-lg bg-popover p-3 text-left text-sm text-popover-foreground shadow-xl ring-1 ring-primary outline-none focus-visible:ring-2"
              onClick={restoreKeyboard}
            >
              <span className="block font-medium">
                {t("views.multiview.keyboardFocus.advertTitle")}
              </span>
              <span className="block text-muted-foreground">
                {t("views.multiview.keyboardFocus.advertDetail")}
              </span>
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}
