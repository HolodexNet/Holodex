import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { defaultPlayerEventBus } from "@/store/player";
import { updateCellStatusAtom } from "@/store/multiview";

interface UsePlayerEventsProps {
  videoId: string;
  cellId: string;
}

export function usePlayerEvents({ videoId, cellId }: UsePlayerEventsProps) {
  const updateCellStatus = useSetAtom(updateCellStatusAtom);

  useEffect(() => {
    const handlePlay = (playerId: string) => {
      if (playerId === videoId) {
        updateCellStatus({ cellId, status: "playing" });
      }
    };

    const handlePause = (playerId: string) => {
      if (playerId === videoId) {
        updateCellStatus({ cellId, status: "paused" });
      }
    };

    const handleBuffer = (playerId: string) => {
      if (playerId === videoId) {
        updateCellStatus({ cellId, status: "buffering" });
      }
    };

    const handleError = (playerId: string, ...errorDetails: unknown[]) => {
      if (playerId === videoId) {
        console.error("Video error for", playerId, errorDetails);
        updateCellStatus({ cellId, status: "error" });
      }
    };

    const handleEnded = (playerId: string) => {
      if (playerId === videoId) {
        updateCellStatus({ cellId, status: "ended" });
      }
    };

    // Subscribe to events
    defaultPlayerEventBus.on("onPlay", handlePlay);
    defaultPlayerEventBus.on("onPause", handlePause);
    defaultPlayerEventBus.on("onBuffer", handleBuffer);
    defaultPlayerEventBus.on("onError", handleError);
    defaultPlayerEventBus.on("onEnded", handleEnded);

    return () => {
      defaultPlayerEventBus.off("onPlay", handlePlay);
      defaultPlayerEventBus.off("onPause", handlePause);
      defaultPlayerEventBus.off("onBuffer", handleBuffer);
      defaultPlayerEventBus.off("onError", handleError);
      defaultPlayerEventBus.off("onEnded", handleEnded);
    };
  }, [videoId, cellId, updateCellStatus]);
}
