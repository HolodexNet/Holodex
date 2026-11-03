import { useEffect, useRef, useState, type DragEvent } from "react"

import { toGridPoint } from "@/lib/multiview/gestures"
import { cellAt } from "@/lib/multiview/grid"
import { videoFromDrop } from "@/lib/multiview/stream"
import type { CellId, GridPoint } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { rectStyle } from "./frame-layer"
import { useMultiviewCommands } from "./use-commands"

const DRAGGED_TYPES = ["application/json", "text/plain", "text/uri-list"]

/**
 * A drag that crosses an iframe vanishes into it, so while one is under way a
 * transparent sheet covers every player and catches it instead. It stays up for
 * as long as the drag lasts, not just while over something droppable, since the
 * pointer can move straight from here onto a frame.
 */
export function DropShield() {
  const [active, setActive] = useState(false)
  const [overCell, setOverCell] = useState<CellId | null>(null)
  const overCellRect = useMultiview(
    (s) => s.cells.find((cell) => cell.id === overCell)?.rect
  )
  const shield = useRef<HTMLDivElement>(null)
  const { dropVideo } = useMultiviewCommands()

  useEffect(() => {
    const start = (event: globalThis.DragEvent) => {
      const types = event.dataTransfer?.types ?? []
      if (types.some((type) => DRAGGED_TYPES.includes(type))) setActive(true)
    }
    const end = () => {
      setActive(false)
      setOverCell(null)
    }
    const leave = (event: globalThis.DragEvent) => {
      // A null target means the drag has left the window altogether.
      if (event.relatedTarget === null) end()
    }
    window.addEventListener("dragenter", start)
    window.addEventListener("dragleave", leave)
    window.addEventListener("dragend", end)
    window.addEventListener("drop", end)
    return () => {
      window.removeEventListener("dragenter", start)
      window.removeEventListener("dragleave", leave)
      window.removeEventListener("dragend", end)
      window.removeEventListener("drop", end)
    }
  }, [])

  const pointOf = (event: DragEvent): GridPoint | null => {
    const node = shield.current
    if (!node) return null
    const bounds = node.getBoundingClientRect()
    return toGridPoint(
      event.clientX - bounds.left,
      event.clientY - bounds.top,
      bounds.width,
      bounds.height
    )
  }

  if (!active) return null
  return (
    <div
      ref={shield}
      className="absolute inset-0 z-30"
      onDragOver={(event) => {
        event.preventDefault()
        const point = pointOf(event)
        if (!point) return
        const cell = cellAt(useMultiview.getState().cells, point)
        setOverCell(cell?.id ?? null)
      }}
      onDrop={(event) => {
        event.preventDefault()
        const point = pointOf(event)
        const video = videoFromDrop(
          event.dataTransfer.getData("application/json"),
          event.dataTransfer.getData("text")
        )
        if (point && video) dropVideo(video, point)
      }}
    >
      {overCellRect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[3px] border-2 border-primary bg-primary/25"
          style={rectStyle(overCellRect)}
        />
      )}
    </div>
  )
}
