import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react"

import { XIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { clampWindow, type Point } from "@/lib/multiview/control"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { ControlPanel, ControlPanelToggles } from "./control-panel"

const viewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

/**
 * The control panel floating above the stage. Unlike a dialog it leaves the view
 * and the keyboard free, so everything can be watched and worked at once.
 */
export function ControlWindow() {
  const open = useMultiviewUi((s) => s.mediaControlsOpen)
  return open ? <FloatingPanel /> : null
}

function FloatingPanel() {
  const { t } = useT()
  const setUi = useMultiviewUi((s) => s.set)
  const panels = useMultiviewUi((s) => s.controlWindowPanels)
  const at = useMultiviewUi((s) => s.controlWindowAt)
  const node = useRef<HTMLElement>(null)
  const grab = useRef<Point | null>(null)
  const [dragging, setDragging] = useState(false)

  const close = () => setUi({ mediaControlsOpen: false })

  // In the tab order right away, and focus goes back where it was on closing.
  useEffect(() => {
    const before = document.activeElement
    node.current?.focus({ preventScroll: true })
    return () => {
      if (before instanceof HTMLElement && before.isConnected) {
        before.focus({ preventScroll: true })
      }
    }
  }, [])

  // A window left near an edge should not end up off screen when that edge moves.
  useEffect(() => {
    const reclamp = () => {
      const current = useMultiviewUi.getState().controlWindowAt
      const bounds = node.current?.getBoundingClientRect()
      if (!current || !bounds) return
      const next = clampWindow(current, bounds, viewport())
      if (next.x !== current.x || next.y !== current.y) {
        useMultiviewUi.getState().set({ controlWindowAt: next })
      }
    }
    window.addEventListener("resize", reclamp)
    return () => window.removeEventListener("resize", reclamp)
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    if ((event.target as HTMLElement).closest("button")) return
    const bounds = node.current?.getBoundingClientRect()
    if (!bounds) return
    grab.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const release = () => {
    grab.current = null
    setDragging(false)
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = node.current?.getBoundingClientRect()
    if (!grab.current || !bounds) return
    setUi({
      controlWindowAt: clampWindow(
        {
          x: event.clientX - grab.current.x,
          y: event.clientY - grab.current.y,
        },
        bounds,
        viewport()
      ),
    })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    // A dialog opened from in here is only inside this in React's tree.
    if (!event.currentTarget.contains(event.target as Node)) return
    event.stopPropagation()
    close()
  }

  return (
    <>
      {/* A pointer that lands on an iframe is gone, capture or no capture. */}
      {dragging && <div className="fixed inset-0 z-30 cursor-grabbing" />}
      <section
        ref={node}
        tabIndex={-1}
        aria-label={t("views.multiview.mediaControls")}
        data-control-window=""
        className="fixed z-40 flex max-h-[calc(100dvh-1rem)] w-[min(26rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/10 outline-none"
        style={
          at ? { left: at.x, top: at.y } : { top: "3.5rem", right: "0.5rem" }
        }
        onKeyDown={onKeyDown}
      >
        <header
          className="flex shrink-0 cursor-grab touch-none items-center gap-0.5 border-b p-1 pl-3 select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={release}
          onPointerCancel={release}
        >
          <h2 className="min-w-0 flex-1 truncate font-medium">
            {t("views.multiview.mediaControls")}
          </h2>
          <ControlPanelToggles
            panels={panels}
            onChange={(next) => setUi({ controlWindowPanels: next })}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("views.multiview.control.close")}
            title={t("views.multiview.control.close")}
            onClick={close}
          >
            <XIcon />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ControlPanel panels={panels} />
        </div>
      </section>
    </>
  )
}
