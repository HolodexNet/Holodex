import { useContext, useEffect, useState, type ReactNode } from "react";
import type { Channel, Video } from "./types";
import { AQUA_PINK, palette } from "./theme";
import { PreferencesContext as Context } from "./preferences-context";

export interface Preferences {
  appearance: "light" | "dark" | "system";
  primary: string;
  org: string;
  language: string;
  englishNames: boolean;
  hideFreeChat: boolean;
  hideMembers: boolean;
  autoRefresh: boolean;
  layout: "grid" | "list";
  density: "comfortable" | "compact";
  hour12: boolean;
  reducedMotion: boolean;
}
export const defaults: Preferences = {
  appearance: "light",
  primary: AQUA_PINK,
  org: "Hololive",
  language: "all",
  englishNames: true,
  hideFreeChat: true,
  hideMembers: false,
  autoRefresh: true,
  layout: "grid",
  density: "comfortable",
  hour12: true,
  reducedMotion: false,
};
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [stored, setPrefs] = useStored<Preferences>(
    "holodex:preferences:v1",
    defaults,
  );
  const prefs = {
    ...defaults,
    ...stored,
    primary: /^#[a-f\d]{6}$/i.test(stored.primary) ? stored.primary : AQUA_PINK,
  };
  const [favorites, setFavorites] = useStored<Channel[]>(
    "holodex:favorites:v1",
    [],
  );
  const [saved, setSaved] = useStored<Video[]>("holodex:saved:v1", []);
  const [queue, setQueue] = useState<Video[]>([]);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [storageError] = useState(() => {
    try {
      localStorage.setItem("holodex:probe", "1");
      localStorage.removeItem("holodex:probe");
      return false;
    } catch {
      return true;
    }
  });
  const dark =
    prefs.appearance === "dark" ||
    (prefs.appearance === "system" && systemDark);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.classList.toggle("reduce-motion", prefs.reducedMotion);
    root.dataset.density = prefs.density;
    root.style.colorScheme = dark ? "dark" : "light";
    Object.entries(palette(prefs.primary, dark)).forEach(([key, value]) =>
      root.style.setProperty(key, value),
    );
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", prefs.primary);
  }, [prefs.primary, prefs.reducedMotion, prefs.density, dark]);
  return (
    <Context.Provider
      value={{
        dark,
        prefs,
        update: (value) =>
          setPrefs((old) => ({ ...defaults, ...old, ...value })),
        reset: () => setPrefs(defaults),
        favorites,
        toggleFavorite: (channel) =>
          setFavorites((old) =>
            old.some((c) => c.id === channel.id)
              ? old.filter((c) => c.id !== channel.id)
              : [...old, channel],
          ),
        saved,
        toggleSaved: (video) =>
          setSaved((old) =>
            old.some((v) => v.id === video.id)
              ? old.filter((v) => v.id !== video.id)
              : [video, ...old],
          ),
        queue,
        toggleQueue: (video) =>
          setQueue((old) =>
            old.some((v) => v.id === video.id)
              ? old.filter((v) => v.id !== video.id)
              : old.length < 4
                ? [...old, video]
                : old,
          ),
        clearQueue: () => setQueue([]),
        storageError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("PreferencesProvider missing");
  return value;
}
export function channelName(channel: Channel, english = true) {
  return (english && channel.english_name) || channel.name || "Unknown channel";
}
