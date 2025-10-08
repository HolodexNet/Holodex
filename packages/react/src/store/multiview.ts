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
export const tempMultiviewCellsAtom = atom<MultiviewCells | null>(null);

export const isAutoLayoutAtom = atom(false);

export const readMultiviewCellsAtom = atom((get) => get(multiviewCellsAtom));

export const syncTempToMainAtom = atom(null, (get, set) => {
  const temp = get(tempMultiviewCellsAtom);
  if (temp) {
    set(multiviewCellsAtom, temp);
    set(tempMultiviewCellsAtom, null);
  }
});

const addMultiviewCellAtom = atom(null, (get, set, cell: Cell) => {
  const curr = get(readMultiviewCellsAtom);
  console.log("Add new cell");
  set(multiviewCellsAtom, { cells: [...curr.cells, cell] });
});

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

export const registerVideoCellAtom = atom(null, (_, set, video: VideoBase) => {
  const newVideoCell: VideoCell = {
    i: `video_${video.id}`,
    type: "video",
    video: video,
    x: Number.MAX_SAFE_INTEGER,
    y: Number.MAX_SAFE_INTEGER,
    w: 1,
    h: 1,
  };
  set(addMultiviewCellAtom, newVideoCell);
});

export const removeVideoCellAtom = atom(null, (_, set, videoId: string) => {
  set(removeMultiviewCellAtom, `video_${videoId}`);
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

export const swapCells = atom(null, (get, set, a: string, b: string) => {
  // const atom = get(readMultiviewCellsAtom);
  // const duplicate = atom.cells;
  // const aIndex = duplicate.findIndex((cell) => cell.i === a);
  // const bIndex = duplicate.findIndex((cell) => cell.i === b);
  // const temp = duplicate[aIndex];
  // duplicate[aIndex] = duplicate[bIndex];
  // duplicate[bIndex] = temp;
  // set(multiviewCellsAtom, { cells: duplicate });
});

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
