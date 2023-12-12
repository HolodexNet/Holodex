import { eventbus } from "@/lib/eventbus";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type ReactPlayer from "react-player";
import type { OnProgressProps } from "react-player/base";

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

export const miniPlayerVideoAtom = atom<VideoBase | null>(null);
export const queueAtom = atomWithStorage<VideoBase[]>("queue", []);

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
