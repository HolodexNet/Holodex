import { GET_ON_INIT } from "@/lib/consts";
import { atom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";

// Define the interface for the new settings state
export interface HolodexSettings {
  englishName: boolean;
  clipLanguage: string[];
  redirectMode: boolean;
  hideThumbnail: boolean;
  hidePlaceholder: boolean;
  gridDensity: number;
  defaultOpen: "Favorites" | "Home";
  hideCollabStreams: boolean;
  filterLongStreams: boolean; // New setting, filters streams that are live for >24hr
  filterDeadStreams: boolean;
  ignoredTopics: string[];
  blockedChannels: ShortChannel[];
}

// Create atoms with storage for each setting
export const settingsAtom = atomWithStorage<HolodexSettings>(
  "mainSettings",
  {
    englishName: false,
    clipLanguage: [],
    redirectMode: false,
    // homepage settings
    hideThumbnail: false,
    hidePlaceholder: false,
    // homepage settings
    gridDensity: 0,
    defaultOpen: "Home",
    hideCollabStreams: false,
    filterLongStreams: true, // homepage settings
    filterDeadStreams: true,
    ignoredTopics: [],
    blockedChannels: [],
  },
  undefined,
  GET_ON_INIT,
);

// Create individual atoms for each property
export const englishNameAtom = atom(
  (get) => get(settingsAtom).englishName,
  (get, set, newValue: boolean) => {
    set(settingsAtom, { ...get(settingsAtom), englishName: newValue });
  },
);

export function usePreferredName({
  name,
  english_name,
}: {
  name?: string;
  english_name?: string;
}) {
  const useEnglishName = useAtomValue(englishNameAtom);

  return useEnglishName ? english_name || name : name;
}

export function useNamePrefFn() {
  const useEnglishName = useAtomValue(englishNameAtom);

  const prefFn = useCallback(
    ({ name, english_name }: { name?: string; english_name?: string }) =>
      useEnglishName ? english_name || name : name,
    [useEnglishName],
  );

  return prefFn;
}

export const clipLanguageAtom = atom(
  (get) => get(settingsAtom).clipLanguage,
  (get, set, newValue: string[]) => {
    set(settingsAtom, { ...get(settingsAtom), clipLanguage: newValue });
  },
);

export const clipLanguageQueryAtom = atom((get) =>
  get(clipLanguageAtom).join(","),
);

export const redirectModeAtom = atom(
  (get) => get(settingsAtom).redirectMode,
  (get, set, newValue: boolean) => {
    set(settingsAtom, { ...get(settingsAtom), redirectMode: newValue });
  },
);

export const hideThumbnailAtom = atom(
  (get) => get(settingsAtom).hideThumbnail,
  (get, set, newValue: boolean) => {
    set(settingsAtom, { ...get(settingsAtom), hideThumbnail: newValue });
  },
);

export const hidePlaceholderAtom = atom(
  (get) => get(settingsAtom).hidePlaceholder,
  (get, set, newValue: boolean) => {
    set(settingsAtom, {
      ...get(settingsAtom),
      hidePlaceholder: newValue,
    });
  },
);

export const gridDensityAtom = atom(
  (get) => get(settingsAtom).gridDensity,
  (get, set, newValue: number) => {
    set(settingsAtom, { ...get(settingsAtom), gridDensity: newValue });
  },
);

export const defaultOpenAtom = atom(
  (get) => get(settingsAtom).defaultOpen,
  (get, set, newValue: "Favorites" | "Home") => {
    set(settingsAtom, { ...get(settingsAtom), defaultOpen: newValue });
  },
);

export const hideCollabStreamsAtom = atom(
  (get) => get(settingsAtom).hideCollabStreams,
  (get, set, newValue: boolean) => {
    set(settingsAtom, {
      ...get(settingsAtom),
      hideCollabStreams: newValue,
    });
  },
);

export const filterDeadStreamsAtom = atom(
  (get) => get(settingsAtom).filterDeadStreams,
  (get, set, newValue: boolean) => {
    set(settingsAtom, {
      ...get(settingsAtom),
      filterDeadStreams: newValue,
    });
  },
);

export const filterLongStreamsAtom = atom(
  (get) => get(settingsAtom).filterLongStreams ?? true,
  (get, set, newValue: boolean) => {
    set(settingsAtom, {
      ...get(settingsAtom),
      filterLongStreams: newValue,
    });
  },
);

export const ignoredTopicsAtom = atom(
  (get) => get(settingsAtom).ignoredTopics,
  (get, set, newValue: string[]) => {
    set(settingsAtom, { ...get(settingsAtom), ignoredTopics: newValue });
  },
);

export const blockedChannelsAtom = atom(
  (get) => get(settingsAtom).blockedChannels,
  (get, set, newValue: ShortChannel[]) => {
    set(settingsAtom, {
      ...get(settingsAtom),
      blockedChannels: newValue,
    });
  },
);

// Derived atom to create a set of blocked channels
export const blockedSetAtom = atom<Set<string>>((get) => {
  const blockedChannels = get(blockedChannelsAtom);
  return new Set(blockedChannels.map((x) => x.id));
});
