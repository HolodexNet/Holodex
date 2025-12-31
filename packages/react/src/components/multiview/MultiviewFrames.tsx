import {
  cellQueueAtom,
  gridDimensionsAtom,
  type Cell,
} from "@/store/multiview";
import { useAtomValue } from "jotai";
import { VideoCell } from "./VideoCell";
import { ChatCell } from "./ChatCell";

const BLANK_IFRAME_URL = "https://www.webpagetest.org/blank.html";

/**
 * Pure CSS Grid-based iframe rendering layer.
 * Renders ALL cells in queue order to preserve iframe DOM order.
 *
 * This component renders iframes completely independently of react-grid-layout,
 * preventing iframe reloads when the grid layout is edited.
 *
 * Position is calculated purely from cell data (x, y, w, h) and grid dimensions.
 */
export function MultiviewFrames() {
  const cells = useAtomValue(cellQueueAtom);
  const { rows, cols } = useAtomValue(gridDimensionsAtom);

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {/* Render ALL cells in queue order to preserve iframe DOM order */}
        {cells
          .filter((cell) => cell.type == "video")
          .map((cell) => (
            <MultiviewFrameItem key={cell.id} cell={cell} />
          ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {/* Render ALL chat cells in queue order to preserve iframe DOM order */}
        {cells
          .filter((cell) => cell.type == "chat")
          .map((cell) => (
            <MultiviewFrameItem key={cell.id} cell={cell} />
          ))}
      </div>
    </>
  );
}

interface MultiviewFrameItemProps {
  cell: Cell;
}

/**
 * Individual iframe item positioned via CSS Grid.
 * Uses grid-column and grid-row to position without affecting DOM order.
 *
 * - Visible cells (w > 0, h > 0): positioned in grid
 * - Hidden cells (w <= 0 or h <= 0): rendered but hidden (h-0 w-0 overflow-hidden)
 * - Empty cells: render blank iframe to preserve slot
 */
function MultiviewFrameItem({ cell }: MultiviewFrameItemProps) {
  const isHidden = cell.w <= 0 || cell.h <= 0;

  // CSS Grid uses 1-indexed lines, so we need to add 1 to our 0-indexed positions
  // grid-column: start / end (end is exclusive, so we need start + width)
  const gridColumn = isHidden
    ? undefined
    : `${cell.x + 1} / ${cell.x + 1 + cell.w}`;
  const gridRow = isHidden
    ? undefined
    : `${cell.y + 1} / ${cell.y + 1 + cell.h}`;

  // Hidden cells render outside the grid flow
  if (isHidden) {
    return (
      <div
        className="absolute h-0 w-0 overflow-hidden"
        data-cell-id={cell.id}
        data-cell-hidden="true"
      >
        {cell.type === "video" && cell.videoId && (
          <VideoCell videoId={cell.videoId} hidden />
        )}
        {cell.type === "chat" && <ChatCell chatTab={cell.chatTab ?? 0} />}
        {cell.type === "empty" && (
          <iframe
            key={`frame-${cell.id}`}
            src={BLANK_IFRAME_URL}
            className="h-0 w-0"
            title="blank"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto relative overflow-hidden"
      style={{
        gridColumn,
        gridRow,
      }}
      data-cell-id={cell.id}
      data-cell-type={cell.type}
    >
      {cell.type === "video" && cell.videoId && (
        <VideoCell videoId={cell.videoId} />
      )}
      {cell.type === "chat" && <ChatCell chatTab={cell.chatTab ?? 0} />}
      {cell.type === "empty" && (
        <iframe
          key={`frame-${cell.id}`}
          src={BLANK_IFRAME_URL}
          className="h-full w-full border-0"
          title="blank"
        />
      )}
    </div>
  );
}
