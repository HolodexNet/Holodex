import { atomWithStorage } from "jotai/utils";
import { VideoRefLike } from "./player";

export const queueAtom = atomWithStorage<VideoRefLike[]>("queue", []);
