import { atomWithStorage } from "jotai/utils";

export const videoCardSizeAtom = atomWithStorage<VideoCardSize>('videocard-size', 'lg')