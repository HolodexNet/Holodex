import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  aspectClassAtom,
  autoLayoutDisabledAtom,
  cellQueueAtom,
  contentMapAtom,
  userPresetsAtom,
  type Cell,
} from "@/store/multiview";
import {
  decodeLayout,
  findEmptyCell,
  generateContentId,
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
  pendingLayout: Cell[] | null;
}

/**
 * Provider for auto-layout functionality.
 * Must wrap any component that uses useAutoLayout.
 */
export function AutoLayoutProvider({ children }: AutoLayoutProviderProps) {
  const [cells, setCells] = useAtom(cellQueueAtom);
  const [contentMap, setContentMap] = useAtom(contentMapAtom);
  const [autoLayoutDisabled, setAutoLayoutDisabled] = useAtom(
    autoLayoutDisabledAtom,
  );
  const aspectClass = useAtomValue(aspectClassAtom);
  const userPresets = useAtomValue(userPresetsAtom);

  const [state, setState] = useState<AutoLayoutState>({
    pendingVideo: null,
    showPrompt: false,
    pendingLayout: null,
  });

  // Use refs to get current values without stale closures
  const cellsRef = useRef(cells);
  const aspectClassRef = useRef(aspectClass);
  const userPresetsRef = useRef(userPresets);
  const autoLayoutDisabledRef = useRef(autoLayoutDisabled);

  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);
  useEffect(() => {
    aspectClassRef.current = aspectClass;
  }, [aspectClass]);
  useEffect(() => {
    userPresetsRef.current = userPresets;
  }, [userPresets]);
  useEffect(() => {
    autoLayoutDisabledRef.current = autoLayoutDisabled;
  }, [autoLayoutDisabled]);

  /**
   * Apply a new layout, merging existing content while preserving cell IDs.
   * This prevents React reconciliation issues and iframe reloads by keeping
   * existing cell IDs stable - only their positions change.
   */
  const applyLayoutWithMerge = useCallback(
    (newCells: Cell[], newVideo?: VideoRef) => {
      const currentCells = cellsRef.current;

      // Get current video cells in order (preserving their IDs)
      const currentVideoCells = currentCells.filter(
        (c) => c.type === "video" && c.videoId && c.w > 0,
      );

      // Get positions from the new layout for video slots
      const videoSlots = newCells.filter((c) => c.type === "empty");
      const chatSlots = newCells.filter((c) => c.type === "chat");

      const mergedCells: Cell[] = [];
      const newContentMap: Record<
        string,
        { videoCellIndex: number; chatCellIndex?: number }
      > = {};

      // Assign existing videos to new positions, preserving their IDs
      let slotIndex = 0;
      for (const existingCell of currentVideoCells) {
        if (slotIndex < videoSlots.length) {
          const slot = videoSlots[slotIndex];
          // Keep the existing cell's ID and videoId, but update position
          mergedCells.push({
            ...existingCell,
            x: slot.x,
            y: slot.y,
            w: slot.w,
            h: slot.h,
          });
          newContentMap[existingCell.videoId!] = {
            videoCellIndex: mergedCells.length - 1,
          };
          slotIndex++;
        }
      }

      // Add the new video if provided
      if (newVideo && slotIndex < videoSlots.length) {
        const slot = videoSlots[slotIndex];
        mergedCells.push({
          id: slot.id, // Use the new slot's ID for new videos
          x: slot.x,
          y: slot.y,
          w: slot.w,
          h: slot.h,
          type: "video",
          videoId: newVideo.id,
        });
        newContentMap[newVideo.id] = { videoCellIndex: mergedCells.length - 1 };
        slotIndex++;
      }

      // Add remaining empty slots
      for (let i = slotIndex; i < videoSlots.length; i++) {
        mergedCells.push(videoSlots[i]);
      }

      // Add chat cells (keep their IDs from the preset)
      for (const chatCell of chatSlots) {
        mergedCells.push(chatCell);
      }

      setCells(mergedCells);
      setContentMap(newContentMap);
    },
    [setCells, setContentMap],
  );

  const fillCellWithVideo = useCallback(
    (cellId: string, video: VideoRef) => {
      setCells((current) =>
        current.map((c) =>
          c.id === cellId
            ? { ...c, type: "video" as const, videoId: video.id }
            : c,
        ),
      );

      const cellIndex = cellsRef.current.findIndex((c) => c.id === cellId);
      setContentMap((map) => ({
        ...map,
        [video.id]: { videoCellIndex: cellIndex },
      }));
    },
    [setCells, setContentMap],
  );

  const addVideo = useCallback(
    (video: VideoRef) => {
      const currentCells = cellsRef.current;
      const currentAspectClass = aspectClassRef.current;
      const currentUserPresets = userPresetsRef.current;
      const currentAutoLayoutDisabled = autoLayoutDisabledRef.current;

      console.log(
        "Adding video:",
        video.id,
        "Current cells:",
        currentCells.length,
      );

      // Check if video already exists
      const existingCell = currentCells.find(
        (c) => c.type === "video" && c.videoId === video.id && c.w > 0,
      );
      if (existingCell) {
        console.warn("Video already in multiview:", video.id);
        return;
      }

      // Count current active videos
      const activeVideoCount = currentCells.filter(
        (c) => c.type === "video" && c.w > 0 && c.videoId,
      ).length;

      // Check for empty cell first
      const emptyCell = findEmptyCell(currentCells);

      if (emptyCell) {
        console.log("Filling empty cell:", emptyCell.id);
        fillCellWithVideo(emptyCell.id, video);
        return;
      }

      // Need to expand layout
      const newPreset = getDefaultLayout(
        activeVideoCount + 1,
        currentAspectClass,
        currentUserPresets,
      );

      if (!newPreset) {
        console.warn("No preset available for", activeVideoCount + 1, "videos");
        return;
      }

      console.log("Applying preset:", newPreset.name, newPreset.layout);
      const newLayout = decodeLayout(newPreset.layout);

      const isPreset = isPresetLayout(
        currentCells,
        currentAspectClass,
        currentUserPresets,
      );

      if (currentCells.length === 0 || isPreset || !currentAutoLayoutDisabled) {
        applyLayoutWithMerge(newLayout.cells, video);
        return;
      }

      setState({
        pendingVideo: video,
        showPrompt: true,
        pendingLayout: newLayout.cells,
      });
    },
    [fillCellWithVideo, applyLayoutWithMerge],
  );

  const confirmAutoLayout = useCallback(() => {
    if (state.pendingLayout && state.pendingVideo) {
      applyLayoutWithMerge(state.pendingLayout, state.pendingVideo);
    }
    setState({ pendingVideo: null, showPrompt: false, pendingLayout: null });
  }, [state, applyLayoutWithMerge]);

  const cancelAutoLayout = useCallback(() => {
    setState({ pendingVideo: null, showPrompt: false, pendingLayout: null });
  }, []);

  const markEdited = useCallback(() => {
    setAutoLayoutDisabled(true);
  }, [setAutoLayoutDisabled]);

  const addEmptyCell = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const newCell: Cell = {
        id: generateContentId(),
        x,
        y,
        w,
        h,
        type: "empty",
      };
      setCells((current) => [...current, newCell]);
      markEdited();
    },
    [setCells, markEdited],
  );

  const applyPreset = useCallback(
    (presetLayout: string) => {
      const decoded = decodeLayout(presetLayout);
      applyLayoutWithMerge(decoded.cells);
      setAutoLayoutDisabled(false);
    },
    [applyLayoutWithMerge, setAutoLayoutDisabled],
  );

  const clearAll = useCallback(() => {
    setCells([]);
    setContentMap({});
    setAutoLayoutDisabled(false);
  }, [setCells, setContentMap, setAutoLayoutDisabled]);

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
