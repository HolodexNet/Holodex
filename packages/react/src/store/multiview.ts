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

const multiviewVideoAtom = atom<VideoBase[]>([]);
export const readMultiviewVideoAtom = atom((get) => get(multiviewVideoAtom));

export const addMultiviewVideoAtom = atom(
  null,
  (get, set, video: VideoBase) => {
    const currentVideos = get(readMultiviewVideoAtom);
    // Check if the video already exists in the multiview
    if (currentVideos.some((v) => v.id === video.id)) return;
    set(multiviewVideoAtom, [...currentVideos, video]);
  },
);

export const removeMultiviewVideoAtom = atom(
  null,
  (get, set, videoId: string) => {
    const currentVideos = get(multiviewVideoAtom);
    set(
      multiviewVideoAtom,
      currentVideos.filter((video) => video.id !== videoId),
    );
  },
);

export const clearMultiviewVideosAtom = atom(null, (_, set) => {
  set(multiviewVideoAtom, []);
});
