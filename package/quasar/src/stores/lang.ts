import { SupportedLangCodes } from "@/hooks/i18n/i18nConsts";
import { guessUserLanguage } from "@/hooks/i18n/utils/langDetector";
import { defineStore } from "pinia";

interface State {
    lang: SupportedLangCodes;
    useEnglishName: boolean;
}

const englishNamePrefs: Set<Partial<SupportedLangCodes>> = new Set(["en", "es", "fr", "id", "pt", "de", "ru", "it"]);

export const useLangStore = defineStore("holodex-i18n", {
    // convert to a function
    state(): State {

        const lang = guessUserLanguage(false, 'en');

        return {
            lang,
            useEnglishName: englishNamePrefs.has(lang)
        }
    },
    getters: {
    },
    actions: {
    },
    share: {
        enable: true,
        initialize: true, // when initializing, fetch from another tab.
    },
    persistedState: {
        persist: true,
    }
});
