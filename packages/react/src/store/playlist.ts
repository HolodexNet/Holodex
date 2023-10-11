import { atomWithStorage } from "jotai/utils";

export const tempPlaylistAtom = atomWithStorage<Playlist | null>(
  "temp-playlist",
  null,
);
