import { SupportedLangCodes } from "@/hooks/i18n/i18nConsts";
import { guessUserLanguage } from "@/hooks/i18n/utils/langDetector";
import { TLLanguageCode } from "@/utils/consts";
import { getTLLangRecommendation } from "@/utils/functions";
import { defineStore } from "pinia";

interface State {
  lang: SupportedLangCodes;
  clipLangs: TLLanguageCode[];
  useEnglishName: boolean;
}

const englishNamePrefs: Set<Partial<SupportedLangCodes>> = new Set([
  "en",
  "es",
  "fr",
  "id",
  "pt",
  "de",
  "ru",
  "it",
]);

export const useLangStore = defineStore("holodex-i18n", {
  // convert to a function
  state: (): State => {
    const lang = guessUserLanguage(false, "en");
    const clipLangs = [getTLLangRecommendation(lang)];
    return {
      lang,
      clipLangs,
      useEnglishName: englishNamePrefs.has(lang),
    };
  },
  getters: {
    preferredLocaleFn: (state) => (en?: string, jp?: string) => {
      return state.useEnglishName ? en || jp : jp || en;
    },
    clipLangsCSV(): string {
      return this.clipLangs.length > 0 ? this.clipLangs.join(",") : "en";
    },
  },
  actions: {},
  share: {
    enable: true,
    initialize: true, // when initializing, fetch from another tab.
  },
  persistedState: {
    persist: true,
  },
});
