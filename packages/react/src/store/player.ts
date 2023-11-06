import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import ReactPlayer from "react-player";

interface CurrentVideo extends Partial<VideoRef> {
  url?: string;
}

export const playerRefAtom = atom<ReactPlayer | null>(null);

export const currentVideoAtom = atomWithStorage<CurrentVideo | null>(
  "currentvideo",
  null,
);

export const miniPlayerAtom = atom(false);
export const theaterModeAtom = atomWithStorage("theater-mode", false);

export const chatOpenAtom = atomWithStorage("chat-open", true);
export const tlOpenAtom = atomWithStorage("tl-open", false);
export const chatPosAtom = atomWithStorage<"left" | "right">(
  "chat-pos",
  "right",
);
