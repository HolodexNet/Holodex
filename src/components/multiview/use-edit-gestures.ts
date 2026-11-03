import {
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { useReducedMotion } from "motion/react"

import { isVideoCell } from "@/lib/multiview/cells"
import {
  planDraw,
  planMove,
  planResize,
  resizeChanges,
  toGridPoint,
  type ResizeHandle,
  type ResizePlan,
} from "@/lib/multiview/gestures"
import { cellAt, rectsEqual } from "@/lib/multiview/grid"
import type { Cell, CellId, GridPoint, Rect } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { cellMotion, settleCell } from "./cell-motion"
import { useEditGesture } from "./gesture-store"

/** Pointer travel before a press on a cell counts as dragging it. */
const DRAG_THRESHOLD_PX = 4

export type GestureStart =
  | { kind: "move"; cell: Cell }
  | { kind: "resize"; cell: Cell; handle: ResizeHandle }
  | { kind: "draw" }
  | { kind: "bind"; cell: Cell }

/** One gesture's reaction to the pointer. */
interface Session {
  move(event: PointerEvent, point: GridPoint): void
  /** The pointer was released normally. */
  commit(): void
  /** Escape, or the browser took the pointer away. */
  cancel(): void
}

const pointIn = (rect: Rect): GridPoint => ({
  x: rect.x + rect.w / 2,
  y: rect.y + rect.h / 2,
})

/**
 * Runs layout gestures on the edit layer, which sits above every iframe. Each
 * gesture captures the pointer, so nothing a drag passes over can take its
 * events away. What a gesture would do comes from the planners in
 * lib/multiview/gestures; this only wires them to the pointer and the store.
 */
export function useEditGestures() {
  const layer = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion() ?? false

  const moveSession = useCallback(
    (cell: Cell, start: PointerEvent, startPoint: GridPoint): Session => {
      const { setActive } = useEditGesture.getState()
      const cells = useMultiview.getState().cells
      const motion = cellMotion(cell.id)
      const grab = {
        x: startPoint.x - cell.rect.x,
        y: startPoint.y - cell.rect.y,
      }
      let dragging = false
      let plan: ReturnType<typeof planMove> | null = null

      return {
        move(event, point) {
          const dx = event.clientX - start.clientX
          const dy = event.clientY - start.clientY
          if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
          dragging = true
          // Straight to the transform; dragging renders nothing per event.
          motion.x.set(dx)
          motion.y.set(dy)
          plan = planMove(cells, cell.id, cell.rect, grab, point)
          const current = useEditGesture.getState().active
          if (
            current?.kind !== "move" ||
            current.swapWith !== plan.swapWith ||
            !rectsEqual(current.target, plan.rect)
          ) {
            setActive({
              kind: "move",
              cellId: cell.id,
              origin: cell.rect,
              target: plan.rect,
              swapWith: plan.swapWith,
            })
          }
        },
        commit() {
          const store = useMultiview.getState()
          if (plan?.swapWith) store.swap(cell.id, plan.swapWith)
          else if (plan && !rectsEqual(plan.rect, cell.rect)) {
            store.setRects(new Map([[cell.id, plan.rect]]))
          } else if (dragging) settleCell(motion, reducedMotion)
        },
        cancel() {
          if (dragging) settleCell(motion, reducedMotion)
        },
      }
    },
    [reducedMotion]
  )

  const resizeSession = useCallback(
    (cell: Cell, handle: ResizeHandle): Session => {
      const { setActive } = useEditGesture.getState()
      const cells = useMultiview.getState().cells
      let plan: ResizePlan = { rect: cell.rect, pushed: new Map() }
      return {
        move(_event, point) {
          const next = planResize(cells, cell.id, cell.rect, handle, point)
          if (rectsEqual(next.rect, plan.rect)) return
          plan = next
          setActive({ kind: "resize", cellId: cell.id, ...plan })
        },
        commit() {
          if (!rectsEqual(plan.rect, cell.rect)) {
            useMultiview.getState().setRects(resizeChanges(cell.id, plan))
          }
        },
        cancel() {},
      }
    },
    []
  )

  const drawSession = useCallback((anchor: GridPoint): Session => {
    const { setActive } = useEditGesture.getState()
    const cells = useMultiview.getState().cells
    let rect: Rect | null = null
    return {
      move(_event, point) {
        rect = planDraw(cells, anchor, point)
        setActive({ kind: "draw", rect })
      },
      commit() {
        if (rect) useMultiview.getState().addCellAt(rect)
      },
      cancel() {},
    }
  }, [])

  const bindSession = useCallback((cell: Cell): Session => {
    const { setActive } = useEditGesture.getState()
    const cells = useMultiview.getState().cells
    let over: CellId | null = null
    setActive({
      kind: "bind",
      cellId: cell.id,
      pointer: pointIn(cell.rect),
      over,
    })
    return {
      move(_event, point) {
        const hit = cellAt(cells, point, cell.id)
        over = hit && isVideoCell(hit) ? hit.id : null
        setActive({ kind: "bind", cellId: cell.id, pointer: point, over })
      },
      commit() {
        if (over) {
          useMultiview
            .getState()
            .setChatTarget(cell.id, { kind: "cell", cellId: over })
        }
      },
      cancel() {},
    }
  }, [])

  const begin = useCallback(
    (event: ReactPointerEvent, start: GestureStart) => {
      const node = layer.current
      if (!node || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()

      const bounds = node.getBoundingClientRect()
      const toPoint = (e: PointerEvent): GridPoint =>
        toGridPoint(
          e.clientX - bounds.left,
          e.clientY - bounds.top,
          bounds.width,
          bounds.height
        )

      const native = event.nativeEvent
      const point = toPoint(native)
      let session: Session
      switch (start.kind) {
        case "move":
          session = moveSession(start.cell, native, point)
          break
        case "resize":
          session = resizeSession(start.cell, start.handle)
          break
        case "bind":
          session = bindSession(start.cell)
          break
        case "draw":
          session = drawSession(point)
          break
      }

      const { pointerId } = event
      node.setPointerCapture(pointerId)

      const finish = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        window.removeEventListener("pointercancel", onCancel)
        window.removeEventListener("keydown", onKey, { capture: true })
        node.removeEventListener("lostpointercapture", onLostCapture)
        if (node.hasPointerCapture(pointerId)) {
          node.releasePointerCapture(pointerId)
        }
        useEditGesture.getState().setActive(null)
      }
      const onMove = (e: PointerEvent) => {
        if (e.pointerId === pointerId) session.move(e, toPoint(e))
      }
      const onUp = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return
        session.move(e, toPoint(e))
        // In the same tick as clearing the gesture, so one render sees both:
        // the swap partner's preview becomes its real position with no flicker.
        session.commit()
        finish()
      }
      const onCancel = () => {
        session.cancel()
        finish()
      }
      // Lost-capture events bubble, and the spec has touch pointers start out
      // captured by whatever they landed on. Only losing the capture this layer
      // took means the gesture is really over.
      const onLostCapture = (e: PointerEvent) => {
        if (e.target === node) onCancel()
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return
        e.preventDefault()
        e.stopPropagation()
        onCancel()
      }
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
      window.addEventListener("keydown", onKey, { capture: true })
      node.addEventListener("lostpointercapture", onLostCapture)
    },
    [bindSession, drawSession, moveSession, resizeSession]
  )

  return { layer, begin }
}
