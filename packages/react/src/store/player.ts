import { eventbus } from "@/lib/eventbus";
import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import type ReactPlayer from "react-player";
import type { OnProgressProps } from "react-player/base";

export const playerRefAtom = atom<ReactPlayer | null>(null);

/**
 * The current video being played, which is used for miniplayer only.
 *
 * If we are on a page where multiple videos can be played, this will not be used.
 */

export const miniPlayerAtom = atom(false);
export const miniplayerVideoAtom = atom<VideoRefLike | null>(null);

export const playerLocationRefAtom = atom<HTMLElement | null>(null);
export const theaterModeAtom = atomWithStorage("theater-mode", false);

export const chatOpenAtom = atomWithStorage("chat-open", true);
export const tlOpenAtom = atomWithStorage("tl-open", false);
type LeftOrRight = "left" | "right";
export const chatPosAtom = atomWithStorage<LeftOrRight>("chat-pos", "right");

export type VideoRefLike = VideoRef &
  Partial<VideoBase> &
  Partial<Video> &
  Partial<Live> &
  Partial<PlaceholderVideo>;

/* 
  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Multi-Video Shared State Management using atom families. They'll cache a new atom for each video ID. Their         │
  │ lifecycle needs to be manually managed along with the video player.                                                │
  │                                                                                                                    │
  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
*/

interface YoutubePlayerGetVideoDataResult {
  video_id: string;
  author: string;
  title: string;
  isPlayable: boolean;
  errorCode: null;
  video_quality: string;
  backgroundable: boolean;
  eventId: string;
  cpn: string;
  isLive: boolean;
  isWindowedLive: boolean;
  isManifestless: boolean;
  allowLiveDvr: boolean;
  isListed: boolean;
  isMultiChannelAudio: boolean;
  hasProgressBarBoundaries: boolean;
  isPremiere: boolean;
  itct: string;
  playerResponseCpn: string;
  progressBarStartPositionUtcTimeMillis: null;
  progressBarEndPositionUtcTimeMillis: null;
  paidContentOverlayDurationMs: number;
}

export type PlayingVideoState = {
  videoId: string;
  duration: number;
  progress: number; // in seconds
  progressRecordedAt: number; // The time (milliseconds) at which the progress was recorded
  status:
    | "playing"
    | "paused"
    | "stopped"
    | "buffering"
    | "ended"
    | "unstarted";
  error?: unknown; // You could refine this to a more specific error type
  content?: YoutubePlayerGetVideoDataResult;
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

export const videoPlayerRefAtomFamily = atomFamily(
  (id: string) => atom<ReactPlayer | null>(null),
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

  // youtube only, when it fails to autoplay. Called when state changes to unstarted (usually when video fails to autoplay)
  onUnstarted?: (videoId: string) => void;
}>();
