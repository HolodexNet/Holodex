import { eventbus } from "@/lib/eventbus";
import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import type ReactPlayer from "react-player";
import type { OnProgressProps } from "react-player/base";

export interface QueueVideo extends VideoBase {
  url?: string;
}

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

/**
 * The current video being played, which is used for global single-player modes
 * such as the Watch page and edit page.
 *
 * If we are on a page where multiple videos can be played, this will not be used.
 */
export const currentVideoAtom = atom<QueueVideo | null>(null);
export const queueAtom = atomWithStorage<QueueVideo[]>("queue", []);

export type PlayingVideoState = {
  videoId: string;
  duration: number;
  progress: number; // in seconds
  progressRecordedAt: number; // The time (milliseconds) at which the progress was recorded
  status: "playing" | "paused" | "stopped" | "buffering" | "ended";
  error?: unknown; // You could refine this to a more specific error type
};

const initialVideoStatus = (videoId: string) =>
  atom<PlayingVideoState>({
    videoId: videoId,
    duration: 100,
    progress: 0,
    progressRecordedAt: 0, // milliseconds
    status: "stopped", // Default status
  });

// Atom family for videos by their ID
export const videoStatusAtomFamily = atomFamily(
  initialVideoStatus,
  (a, b) => a === b,
);

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
