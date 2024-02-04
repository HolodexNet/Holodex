import { atom } from "jotai";

export const englishNameAtom = atom(false);
export const clipLanguageAtom = atom<string[]>([]);
export const redirectModeAtom = atom(false);
export const hideThumbnailAtom = atom(false);
export const hidePlaceholderAtom = atom(false);
export const gridDensityAtom = atom(0);
export const defaultOpenAtom = atom<"Favorites" | "Home">("Home");
export const hideCollabStreamsAtom = atom(false);
export const filterDeadStreamsAtom = atom(true);
export const ignoredTopicsAtom = atom<string[]>([]);
export const blockedChannelsAtom = atom<ShortChannel[]>([]);

// Derived atom (equivalent to getters in Pinia)
export const blockedSetAtom = atom<Set<string>>((get) => {
  const blockedChannels = get(blockedChannelsAtom);
  return new Set(blockedChannels.map((x) => x.id));
});
