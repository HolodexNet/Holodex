import React, { createContext, useContext, useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useStore } from "jotai";
import {
  aspectClassAtom,
  autoLayoutDisabledAtom,
  visibleCellsAtom,
  userPresetsAtom,
  applyLayoutAtom,
  fillCellAtom,
  addEmptyCellAtom,
  clearAllCellsAtom,
} from "@/store/multiview";
import {
  findEmptyCell,
  getDefaultLayout,
  isPresetLayout,
} from "@/lib/multiview-utils";

interface VideoRef {
  id: string;
  type?: "twitch" | "youtube";
}

interface AutoLayoutContextValue {
  addVideo: (video: VideoRef) => void;
  fillCellWithVideo: (cellId: string, video: VideoRef) => void;
  applyPreset: (presetLayout: string) => void;
  addEmptyCell: (x: number, y: number, w: number, h: number) => void;
  clearAll: () => void;
  markEdited: () => void;
  showPrompt: boolean;
  confirmAutoLayout: () => void;
  cancelAutoLayout: () => void;
}

const AutoLayoutContext = createContext<AutoLayoutContextValue | null>(null);

interface AutoLayoutProviderProps {
  children: React.ReactNode;
}

interface AutoLayoutState {
  pendingVideo: VideoRef | null;
  showPrompt: boolean;
  pendingPresetLayout: string | null;
}

/**
 * Provider for auto-layout functionality.
 * Delegates to store atoms for core operations.
 */
export function AutoLayoutProvider({ children }: AutoLayoutProviderProps) {
  const store = useStore();
  const userPresets = useAtomValue(userPresetsAtom);

  // Store mutators
  const applyLayout = useSetAtom(applyLayoutAtom);
  const fillCell = useSetAtom(fillCellAtom);
  const addEmpty = useSetAtom(addEmptyCellAtom);
  const clearAllCells = useSetAtom(clearAllCellsAtom);
  const setAutoLayoutDisabled = useSetAtom(autoLayoutDisabledAtom);

  const [state, setState] = useState<AutoLayoutState>({
    pendingVideo: null,
    showPrompt: false,
    pendingPresetLayout: null,
  });

  const fillCellWithVideo = useCallback(
    (cellId: string, video: VideoRef) => {
      fillCell({ cellId, videoId: video.id });
    },
    [fillCell],
  );

  const addVideo = useCallback(
    (video: VideoRef) => {
      // Read fresh values from store
      const currentVisibleCells = store.get(visibleCellsAtom);
      const currentAspectClass = store.get(aspectClassAtom);
      const currentAutoLayoutDisabled = store.get(autoLayoutDisabledAtom);

      console.log(
        "Adding video:",
        video.id,
        "Current visible cells:",
        currentVisibleCells.length,
      );

      // Check if video already exists
      const existingCell = currentVisibleCells.find(
        (c) => c.type === "video" && c.videoId === video.id,
      );
      if (existingCell) {
        console.warn("Video already in multiview:", video.id);
        return;
      }

      // Count current active videos
      const activeVideoCount = currentVisibleCells.filter(
        (c) => c.type === "video" && c.videoId,
      ).length;

      // Check for empty cell first
      const emptyCell = findEmptyCell(currentVisibleCells);

      if (emptyCell) {
        console.log("Filling empty cell:", emptyCell.id);
        fillCellWithVideo(emptyCell.id, video);
        return;
      }

      // Need to expand layout
      const newPreset = getDefaultLayout(
        activeVideoCount + 1,
        currentAspectClass,
        userPresets,
      );

      if (!newPreset) {
        console.warn("No preset available for", activeVideoCount + 1, "videos");
        return;
      }

      console.log("Applying preset:", newPreset.name, newPreset.layout);

      const isPreset = isPresetLayout(
        currentVisibleCells,
        currentAspectClass,
        userPresets,
      );

      if (
        currentVisibleCells.length === 0 ||
        isPreset ||
        !currentAutoLayoutDisabled
      ) {
        // Apply the layout preset, then fill the empty slot with the video
        applyLayout(newPreset.layout);
        // After applying, find the empty slot and fill it
        const newVisibleCells = store.get(visibleCellsAtom);
        const newEmptyCell = findEmptyCell(newVisibleCells);
        if (newEmptyCell) {
          fillCellWithVideo(newEmptyCell.id, video);
        }
        return;
      }

      // Prompt user before overriding manual layout
      setState({
        pendingVideo: video,
        showPrompt: true,
        pendingPresetLayout: newPreset.layout,
      });
    },
    [store, userPresets, fillCellWithVideo, applyLayout],
  );

  const confirmAutoLayout = useCallback(() => {
    if (state.pendingPresetLayout && state.pendingVideo) {
      applyLayout(state.pendingPresetLayout);
      // Fill the empty slot with the pending video
      const newVisibleCells = store.get(visibleCellsAtom);
      const newEmptyCell = findEmptyCell(newVisibleCells);
      if (newEmptyCell) {
        fillCellWithVideo(newEmptyCell.id, state.pendingVideo);
      }
    }
    setState({
      pendingVideo: null,
      showPrompt: false,
      pendingPresetLayout: null,
    });
  }, [state, applyLayout, store, fillCellWithVideo]);

  const cancelAutoLayout = useCallback(() => {
    setState({
      pendingVideo: null,
      showPrompt: false,
      pendingPresetLayout: null,
    });
  }, []);

  const markEdited = useCallback(() => {
    setAutoLayoutDisabled(true);
  }, [setAutoLayoutDisabled]);

  const addEmptyCell = useCallback(
    (x: number, y: number, w: number, h: number) => {
      addEmpty({ x, y, w, h });
    },
    [addEmpty],
  );

  const applyPreset = useCallback(
    (presetLayout: string) => {
      applyLayout(presetLayout);
    },
    [applyLayout],
  );

  const clearAll = useCallback(() => {
    clearAllCells();
  }, [clearAllCells]);

  const value: AutoLayoutContextValue = {
    addVideo,
    fillCellWithVideo,
    applyPreset,
    addEmptyCell,
    clearAll,
    markEdited,
    showPrompt: state.showPrompt,
    confirmAutoLayout,
    cancelAutoLayout,
  };

  return (
    <AutoLayoutContext.Provider value={value}>
      {children}
    </AutoLayoutContext.Provider>
  );
}

/**
 * Hook for accessing auto-layout functionality.
 * Must be used within an AutoLayoutProvider.
 */
export function useAutoLayout(): AutoLayoutContextValue {
  const context = useContext(AutoLayoutContext);
  if (!context) {
    throw new Error("useAutoLayout must be used within an AutoLayoutProvider");
  }
  return context;
}
