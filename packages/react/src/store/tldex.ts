import { TLLanguageCode } from "@/lib/consts";
import { atomWithStorage } from "jotai/utils";

export interface TLDexStoreState {
  // whether live TL sticks to the bottom or not
  liveTlStickBottom: boolean;
  // language of dexTL
  liveTlLang: TLLanguageCode;
  // font size
  liveTlFontSize: number;
  // whether to show verified.
  liveTlShowVerified: boolean; // show verified messages
  // whether to show moderators
  liveTlShowModerator: boolean; // show moderator messages
  // whether to show vtubers
  liveTlShowVtuber: boolean; // show vtuber messages
  // whether to show local time
  liveTlShowLocalTime: boolean; // show client local time
  // window size
  liveTlWindowSize: number; // Default size, otherwise percentage height
  // subtitle on/off
  liveTlShowSubtitle: boolean; // Show subtitles on videos
  // hide spoilers or not?
  liveTlHideSpoiler: boolean; // Hide message past current video time
}

export const tldexSettngsAtom = atomWithStorage<TLDexStoreState>("tldex", {
  liveTlStickBottom: false,
  liveTlLang: "en",
  liveTlFontSize: 13,
  liveTlShowVerified: true, // show verified messages
  liveTlShowModerator: true, // show moderator messages
  liveTlShowVtuber: true, // show vtuber messages
  liveTlShowLocalTime: false, // show client local time
  liveTlWindowSize: 0.3, // Default size, otherwise percentage height
  liveTlShowSubtitle: true, // Show subtitles on videos
  liveTlHideSpoiler: false, // Hide message past current video time
});

export const tldexBlockedAtom = atomWithStorage<string[]>("tldex-blocked", []);
