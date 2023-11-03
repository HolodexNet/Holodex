import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

interface CurrentVideo extends VideoRef {
  url: string;
}

export const currentVideoAtom = atomWithStorage<CurrentVideo | null>(
  "currentvideo",
  null,
);

export const miniPlayerAtom = atom(false);
