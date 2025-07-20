import { indicatePageFullscreenAtom } from "@/hooks/useFrame";
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
      } else if (ref.current.parentElement) {
        ref.current.parentElement.requestFullscreen();
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
multiviewCellsAtom.debugLabel = "multiviewCellsAtom";

export const readMultiviewCellsAtom = atom((get) => get(multiviewCellsAtom));

const addMultiviewCellAtom = atom(null, (get, set, cell: Cell) => {
  const curr = get(readMultiviewCellsAtom);
  set(multiviewCellsAtom, { cells: [...curr.cells, cell] });
});

export const removeMultiviewCellAtom = atom(
  null,
  (get, set, cellId: string) => {
    const curr = get(readMultiviewCellsAtom);
    set(multiviewCellsAtom, {
      cells: curr.cells.filter((cell) => cell.id !== cellId),
    });
  },
);

export const clearMultiviewCellsAtom = atom(null, (_, set) => {
  set(multiviewCellsAtom, { cells: [] });
});

export const registerVideoCellAtom = atom(null, (_, set, video: VideoBase) => {
  const newVideoCell: VideoCell = {
    id: `video_${video.id}`,
    type: "video",
    video: video, // Placeholder video object
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
    const cellExists = curr.cells.some((cell) => cell.id === cellId);

    if (!cellExists) {
      console.warn(`Cell with id ${cellId} not found`);
      return;
    }

    set(multiviewCellsAtom, {
      cells: curr.cells.map((cell) => {
        if (cell.id !== cellId) return cell;
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
    const cell = curr.cells.find((cell) => cell.id === cellId);
    if (!cell) {
      console.warn(`Cell with id ${cellId} not found`);
      return;
    }

    set(multiviewCellsAtom, {
      cells: curr.cells.map((cell) =>
        cell.id === cellId
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
      id: `placeholder_${id}`,
      type: "placeholder",
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
        id: `${newCell.type}_${id}`, // Ensure the new cell has the correct prefix
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
