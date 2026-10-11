import { createContext } from "react";
import type { Preferences } from "./preferences";
import type { Channel, Video } from "./types";

// Keep context identity stable when the provider is refreshed during development.
export const PreferencesContext = createContext<{
  dark: boolean;
  prefs: Preferences;
  update: (value: Partial<Preferences>) => void;
  reset: () => void;
  favorites: Channel[];
  toggleFavorite: (channel: Channel) => void;
  saved: Video[];
  toggleSaved: (video: Video) => void;
  queue: Video[];
  toggleQueue: (video: Video) => void;
  clearQueue: () => void;
  storageError: boolean;
} | null>(null);
