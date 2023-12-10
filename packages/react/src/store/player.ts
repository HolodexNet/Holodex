import { eventbus } from "@/lib/eventbus";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type ReactPlayer from "react-player";
import type { OnProgressProps } from "react-player/base";
import { Location } from "react-router-dom";

// export interface QueueVideo extends VideoBase {
//   url?: string;
// }

export const playerRefAtom = atom<ReactPlayer | null>(null);

export const miniPlayerAtom = atom(false);
export const playerLocationRefAtom = atom<HTMLElement | null>(null);
export const theaterModeAtom = atomWithStorage("theater-mode", false);

export const chatOpenAtom = atomWithStorage("chat-open", true);
export const tlOpenAtom = atomWithStorage("tl-open", false);
export const chatPosAtom = atomWithStorage<"left" | "right">(
  "chat-pos",
  "right",
);

export const currentVideoAtom = atom<PlaceholderVideo | null>(null);

const VALID_CURRENT_VIDEO_PAGES_REGEX = new RegExp("^(/watch)|(/edit/video)");

/**
 * currentVideoAtom is only relevant when the watch page, edit page, or MiniPlayer is Open.
 *
 * its purpose is to keep track of the active video. Currently, Miniplayer and Queue uses this to keep track of the active video.
 *
 * Other on screen elements should not be using this, but instead use the videoContext.
 * @param location - The current location
 */
export function useCurrentVideoAtom(location: Location) {
  const [currentVideo, setCurrentVideo] = useAtom(currentVideoAtom);
  const miniPlayer = useAtomValue(miniPlayerAtom);

  const validCurrentVideo =
    VALID_CURRENT_VIDEO_PAGES_REGEX.test(location.pathname) || miniPlayer
      ? currentVideo
      : null;

  return [validCurrentVideo, setCurrentVideo] as const;
}

export const queueAtom = atomWithStorage<PlaceholderVideo[]>("queue", []);

export const defaultPlayerEventBus = eventbus<{
  onStart?: (videoId: string) => void;
  onPlay?: (videoId: string) => void;
  onPause?: (videoId: string) => void;
  onBuffer?: (videoId: string) => void;
  onBufferEnd?: (videoId: string) => void;
  onEnded?: (videoId: string) => void;
  onClickPreview?: (videoId: string, event: unknown) => void;
  onEnablePIP?: (videoId: string) => void;
  onDisablePIP?: (videoId: string) => void;
  onError?: (
    videoId: string,
    error: unknown,
    data?: unknown,
    hlsInstance?: unknown,
    hlsGlobal?: unknown,
  ) => void;
  onDuration?: (videoId: string, duration: number) => void;
  onSeek?: (videoId: string, seconds: number) => void;
  onProgress?: (videoId: string, state: OnProgressProps) => void;
}>();
