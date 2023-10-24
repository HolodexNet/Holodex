import { atom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const favouritesAtom = atomWithStorage<FavoriteChannel | null>(
  "favourites",
  null,
);
