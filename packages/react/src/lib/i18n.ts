import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { formatInTimeZone } from "date-fns-tz";
import {
  format as formatDate,
  formatDistanceToNow,
  formatRelative,
  isDate,
} from "date-fns";
import {
  enUS,
  ja,
  zhTW,
  zhCN,
  enGB,
  de,
  ko,
  hu,
  vi,
  tr,
  ms,
  id,
  es,
} from "date-fns/locale"; // import all locales we need
import I18NextHttpBackend from "i18next-http-backend";

const locales: { [key: string]: Locale } = {
  en: enUS,
  "en-GB": enGB,
  "lol-PEKO": enUS,
  ja,
  "ja-JP": ja,
  zh: zhTW,
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  "de-DE": de,
  "ko-KR": ko,
  "hu-HU": hu,
  "vi-VN": vi,
  "tr-TR": tr,
  "ms-MY": ms,
  "id-ID": id,
  "es-MX": es,
}; // used to look up the required locale

const SYSTEM_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

i18n
  .use(I18NextHttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // resources,
    debug: import.meta.env.DEV,
    fallbackLng: "en",
    saveMissing: true,
    supportedLngs: [
      "en",
      "en-GB",
      "ja-JP",
      "id-ID",
      "de-DE",
      "hu-HU",
      "ko-KR",
      "ms-MY",
      // "ru-RU",
      "tr-TR",
      "vi-VN",
      "zh-CN",
      "zh-TW",
      "es-MX",
      "lol-PEKO",
    ],
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (isDate(value) && lng) {
          const locale = locales[lng];
          if (format === "short") return formatDate(value, "P", { locale });
          if (format === "long") return formatDate(value, "PPPP", { locale });
          if (format === "relative")
            return formatRelative(value, new Date(), { locale });
          if (format === "absolute") {
            const ts1 = formatInTimeZone(value, SYSTEM_TZ, "Pp zzz", {
              locale,
            });
            const ts2 =
              formatInTimeZone(value, "Asia/Tokyo", "Pp", {
                locale,
              }) + " JST";
            if (ts1 === ts2) {
              return ts1;
            }
            return `${ts1}\n${ts2}`;
          }
          if (format === "ago")
            if (
              new Date().valueOf() - value.valueOf() >
              60 * 24 * 60 * 30 * 1000
            ) {
              return formatDate(value, "P", { locale });
            } else
              return formatDistanceToNow(value, {
                locale,
                addSuffix: true,
              }).replace("about", "");
          if (format === "datetime") return formatDate(value, "Pp", { locale });
          return formatDate(value, format!, { locale });
        }

        return value;
      },
    },
    detection: {
      order: ["localStorage", "querystring", "navigator"], // local storage first. then querystring for incoming users?
    },
    backend: {
      addPath: undefined,
      // reloadInterval: 5000,
    },
    react: {
      useSuspense: false,
    },
  });

// i18n.on("missingKey", (lngs, namespace, key, res) => {
//   console.error(
//     `Missing i18N Key / TL: lng=${lngs}, namespace=${namespace}, key=${key}, res=${res};`
//   );
// });
