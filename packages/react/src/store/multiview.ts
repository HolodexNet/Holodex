import { indicatePageFullscreenAtom } from "@/hooks/useFrame";
import {
  Cell,
  ChatCell,
  ChatCellStatus,
  MultiviewCells,
  PlaceholderCell,
  VideoCell,
} from "@/types/multiview";
import { atom, useAtom, useSetAtom } from "jotai";
import { RefObject, useEffect } from "react";

export const isMultiViewFullscreenAtom = atom(!!document.fullscreenElement);

export function useMultiViewFullScreen(ref: RefObject<HTMLDivElement | null>) {
  const [isFullScreen, setIsFullScreen] = useAtom(isMultiViewFullscreenAtom);
  const indicatePageFullscreen = useSetAtom(indicatePageFullscreenAtom);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      indicatePageFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [setIsFullScreen, indicatePageFullscreen]);

  const toggleFullScreen = () => {
    if (ref && ref.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        ref.current.requestFullscreen(); // Use ref.current directly
      }
    }
  };

  return {
    isFullScreen,
    toggleFullScreen,
  };
}

// TODO: read from memory
export const multiviewCellsAtom = atom<MultiviewCells>({ cells: [] });
export const isAutoLayoutAtom = atom(false);

export const readMultiviewCellsAtom = atom((get) => get(multiviewCellsAtom));

export const removeMultiviewCellAtom = atom(
  null,
  (get, set, cellId: string) => {
    const curr = get(readMultiviewCellsAtom);
    set(multiviewCellsAtom, {
      cells: curr.cells.filter((cell) => cell.i !== cellId),
    });
  },
);

export const clearMultiviewCellsAtom = atom(null, (_, set) => {
  set(multiviewCellsAtom, { cells: [] });
});

export const setCellsAtom = atom(null, (_, set, cells: Cell[]) => {
  set(multiviewCellsAtom, { cells: cells });
});

function calculateLayout(
  cells: Cell[],
  maxCol: number = 24,
  maxRow: number = 24,
) {
  if (cells.length === 0) return [];

  const numberOfCells = cells.length;
  const rows = Math.floor(Math.sqrt(numberOfCells));
  const cols = Math.ceil(numberOfCells / rows);

  // Calculate grid units (each cell should span equal portions of the 24x24 grid)
  const cellWidth = Math.floor(maxCol / cols);
  const cellHeight = Math.floor(maxRow / rows);

  const sortedCells = cells.toSorted((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x,
  );

  return sortedCells.map((cell, i) => ({
    i: cell.i,
    x: (i % cols) * cellWidth,
    y: Math.floor(i / cols) * cellHeight,
    w: cellWidth,
    h: cellHeight,
  }));
}

function applyCalculatedPositions(cells: Cell[]): Cell[] {
  if (cells.length === 0) return [];

  const newPositions = calculateLayout(cells);

  return cells.map((cell) => {
    const position = newPositions.find((pos) => pos.i === cell.i);
    return position ? { ...cell, ...position } : cell;
  });
}

// todo - extract logic for all types of cells
// x and y are set to the max possible number to ensure end of list
export const registerVideoCellAtom = atom(
  null,
  (get, set, video: VideoBase) => {
    const current = get(multiviewCellsAtom);

    const newVideoCell: VideoCell = {
      i: `video_${video.id}`,
      type: "video",
      video: video,
      x: Number.MAX_SAFE_INTEGER,
      y: Number.MAX_SAFE_INTEGER,
      w: 1,
      h: 1,
    };

    const updatedCells = [...current.cells, newVideoCell];
    const finalCells = applyCalculatedPositions(updatedCells);

    set(multiviewCellsAtom, { cells: finalCells });
  },
);

export const removeVideoCellAtom = atom(null, (get, set, videoId: string) => {
  const currentCells = get(multiviewCellsAtom);
  const cellsPostRemoval = currentCells.cells.filter(
    (cell) => cell.i !== `video_${videoId}`,
  );

  const finalCells = applyCalculatedPositions(cellsPostRemoval);
  set(multiviewCellsAtom, { cells: finalCells });
});

export const updateCellStateAtom = atom(
  null,
  (
    get,
    set,
    { cellId, updates }: { cellId: string; updates: Partial<Cell> },
  ) => {
    const curr = get(readMultiviewCellsAtom);
    const cellExists = curr.cells.some((cell) => cell.i === cellId);

    if (!cellExists) {
      console.warn(`Cell with id ${cellId} not found`);
      return;
    }

    set(multiviewCellsAtom, {
      cells: curr.cells.map((cell) => {
        if (cell.i !== cellId) return cell;
        // Only allow updates that are valid for the specific cell type
        if (
          cell.type === "video" &&
          (!updates.type || updates.type === "video")
        ) {
          return { ...cell, ...(updates as Partial<VideoCell>) };
        }
        if (
          cell.type === "chat" &&
          (!updates.type || updates.type === "chat")
        ) {
          return { ...cell, ...(updates as Partial<ChatCell>) };
        }
        if (
          cell.type === "placeholder" &&
          (!updates.type || updates.type === "placeholder")
        ) {
          return { ...cell, ...(updates as Partial<PlaceholderCell>) };
        }
        return cell;
      }),
    });
  },
);

export const updateCellPositionAtom = atom(
  null,
  (
    get,
    set,
    cellId: string,
    updates: Partial<Pick<Cell, "x" | "y" | "h" | "w">>,
  ) => {
    const curr = get(readMultiviewCellsAtom);
    const targetCellIndex = curr.cells.findIndex((cell) => cell.i === cellId);

    if (targetCellIndex === -1) {
      console.warn(`Cell with id ${cellId} not found`);
      return;
    }

    const targetCell = curr.cells[targetCellIndex];

    // Check if any values actually changed
    const hasChanges = Object.keys(updates).some((key) => {
      const updateKey = key as keyof typeof updates;
      return (
        updates[updateKey] !== undefined &&
        targetCell[updateKey] !== updates[updateKey]
      );
    });

    if (!hasChanges) {
      console.log(`Cell with id ${cellId} has no changes to apply`);
      return;
    }

    // Create new array with only the changed cell replaced
    const newCells = [...curr.cells];
    newCells[targetCellIndex] = {
      ...targetCell,
      ...updates,
    };

    set(multiviewCellsAtom, {
      cells: newCells,
    });
  },
);

export const updateCellStatusAtom = atom(
  null,
  (_, set, { cellId, status }: { cellId: string; status: ChatCellStatus }) => {
    set(updateCellStateAtom, { cellId, updates: { status } });
  },
);

const mutateCellTypesAtom = atom(
  null,
  (get, set, { cellId, newCell }: { cellId: string; newCell: Cell }) => {
    // find in the array of cells the cell with the given cell id
    const curr = get(readMultiviewCellsAtom);
    const cell = curr.cells.find((cell) => cell.i === cellId);
    if (!cell) {
      console.warn(`Cell with id ${cellId} not found`);
      return;
    }

    set(multiviewCellsAtom, {
      cells: curr.cells.map((cell) =>
        cell.i === cellId
          ? {
              ...newCell,
              x: cell.x ?? 0,
              y: cell.y ?? 0,
              h: cell.h ?? 1,
              w: cell.w ?? 1,
            }
          : cell,
      ),
    });
  },
);

export const mutateVideoToPlaceholderAtom = atom(
  null,
  (_, set, videoId: string) => {
    const id = cleanMultiviewCellId(videoId);
    const newPlaceholderCell: PlaceholderCell = {
      i: `placeholder_${id}`,
      type: "placeholder",
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    };
    set(mutateCellTypesAtom, {
      cellId: `video_${id}`,
      newCell: newPlaceholderCell,
    });
  },
);

export const mutatePlaceholderToOtherCellAtom = atom(
  null,
  (_, set, { cellId, newCell }: { cellId: string; newCell: Cell }) => {
    const id = cleanMultiviewCellId(cellId);
    set(mutateCellTypesAtom, {
      cellId: `placeholder_${id}`,
      newCell: {
        ...newCell,
        i: `${newCell.type}_${id}`, // Ensure the new cell has the correct prefix
      },
    });
  },
);

export function cleanMultiviewCellId(id: string): string {
  // remove placeholder, video and chat prefixes
  if (id.startsWith("placeholder_")) return id.replace("placeholder_", "");
  if (id.startsWith("chat_")) return id.replace("chat_", "");
  return id.startsWith("video_") ? id.replace("video_", "") : id;
}

// function to manage cell layout
