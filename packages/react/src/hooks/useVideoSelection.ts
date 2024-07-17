import { atom, useAtom } from "jotai";

export const selectionModeAtom = atom(false);
const selectedVideosAtom = atom<PlaceholderVideo[]>([]);

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
