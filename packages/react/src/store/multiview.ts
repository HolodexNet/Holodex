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

export const addMultiviewCellAtom = atom(null, (get, set, cell: Cell) => {
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
    status: "paused", // Default status
    video: video, // Placeholder video object
  };
  set(addMultiviewCellAtom, newVideoCell);
});

export const removeVideoCellAtom = atom(null, (_, set, videoId: string) => {
  set(removeMultiviewCellAtom, `video_${videoId}`);
});

// function to manage cell layout
