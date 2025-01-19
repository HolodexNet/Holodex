import { atom, useAtom } from "jotai";

export const selectionModeAtom = atom(false);
const selectedVideosAtom = atom<PlaceholderVideo[]>([]);

export const selectedVideoSetReadonlyAtom = atom(
  (get) => new Set(get(selectedVideosAtom).map((v) => v.id)),
);
/**
 * Custom hook to manage video selection state.
 *
 * Provides functionality to enable/disable selection mode, add/remove videos
 * from the selection, and clear the selection. Returns the current selection
 * mode, selected videos, and functions to manipulate the selection.
 *
 * @returns {Object} An object containing:
 *  - selectionMode: boolean indicating if selection mode is active.
 *  - setSelectionMode: function to toggle selection mode.
 *  - selectedVideos: array of currently selected videos.
 *  - setSelectedVideos: function to manually set selected videos.
 *  - addVideo: function to add a video to the selection.
 *  - removeVideo: function to remove a video from the selection by ID.
 *  - clearSelection: function to clear all selected videos.
 */
export const useVideoSelection = () => {
  const [selectionMode, setSelectionMode] = useAtom(selectionModeAtom);
  const [selectedVideos, setSelectedVideos] = useAtom(selectedVideosAtom);

  const addVideo = (video: PlaceholderVideo) => {
    setSelectedVideos((prev) => [...prev, video]);
  };

  const removeVideo = (videoId: string) => {
    setSelectedVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  const clearSelection = () => {
    setSelectedVideos([]);
  };

  return {
    selectionMode,
    setSelectionMode,
    selectedVideos,
    setSelectedVideos,
    addVideo,
    removeVideo,
    clearSelection,
  };
};
