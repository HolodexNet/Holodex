import { createI18n } from "vue-i18n";
import enTL from "../locales/en/ui.yml";
import dayjs from "dayjs";
import {
  asyncLang,
  STATIC_HOLODEX_LOCALE_MAP,
  SupportedLangCodes,
} from "../hooks/i18n/i18nConsts";

export function setupI18N() {
  const i18n = createI18n({
    locale: "en", // Set locale
    fallbackLocale: "en",
    allowComposition: true,
    globalInjection: true,
    // Set default locale messages,
    messages: {
      en: { ...enTL },
    },
    pluralizationRules: {
      /**
       * @param choice {number} a choice index given by the input to $tc: `$tc ('path.to.rule', choiceIndex)`
       * @param choicesLength {number} an overall amount of available choices
       * @returns a final choice index to select plural word by
       */
      ru(choice, choicesLength) {
        // this === VueI18n instance, so the locale property also exists here
        if (choice === 0) {
          return 0;
        }
        // If 'choice' is number, how tf it can end with 'k'?
        // choice = choice.toString().toLowerCase().endsWith("k") ? parseInt(choice, 10) : choice;

        const teen = choice > 10 && choice < 20;
        const endsWithOne = choice % 10 === 1;

        if (choicesLength < 4) {
          return !teen && endsWithOne ? 1 : 2;
        }
        if (!teen && endsWithOne) {
          return 1;
        }
        if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
          return 2;
        }

        return choicesLength < 4 ? 2 : 3;
      },
    },
  });

  return i18n;
}

// dayJS locale import.
const STATIC_DAYJS_LOCALE_MAP: Partial<Record<SupportedLangCodes, string>> = {
  "en-CA": "en-ca",
  "en-GB": "en-gb",
  zh: "zh-tw",
  "zh-CN": "zh-cn",
  "es-ES": "es",
  pt: "pt-br",
  "lol-UWU": "en",
  "lol-PEKO": "en",
};

export function holodexLangToDayJSLang(holodexLang: string) {
  return STATIC_DAYJS_LOCALE_MAP[holodexLang] || holodexLang.toLowerCase();
}

// Lang switcher helpers

export function setI18nLanguage(i18n, locale) {
  if (i18n.mode === "legacy") {
    i18n.locale = locale;
  } else {
    i18n.locale.value = locale;
  }

  document.querySelector("html").setAttribute("lang", locale);
  dayjs.locale(holodexLangToDayJSLang(locale));
}

const loadedLanguageCache: Partial<Record<SupportedLangCodes, any>> = {
  en: enTL,
};

export async function loadLocaleMessages(i18n, locale: SupportedLangCodes) {
  if (loadedLanguageCache[locale]) {
    i18n.setLocaleMessage(locale, loadedLanguageCache[locale]);
  } else {
    // load locale messages with dynamic import
    const messages = await asyncLang[locale]();
    // cache.
    loadedLanguageCache[locale] = messages;
    // set locale and locale message
    i18n.setLocaleMessage(locale, messages);
  }

  return nextTick();
}
