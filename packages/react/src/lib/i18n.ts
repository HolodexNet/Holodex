import i18n from "i18next";
import ICU from "i18next-icu";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import ChainedBackend from "i18next-chained-backend";
import resourcesToBackend from "i18next-resources-to-backend";
import { getDefaultStore } from "jotai";
import dayjs from "dayjs";
import { localeAtom } from "@/store/i18n";
import { loadDayJsLocale } from "./i18nUtils";

const store = getDefaultStore();
export const langs = [
  { val: "en", locale: "en", display: "English", credit: "@Holodex" },
  {
    val: "en-CA",
    locale: "en",
    display: "English (Canadian)",
    credit: "@Holodex",
  },
  {
    val: "en-GB",
    locale: "en",
    display: "English (British)",
    credit: "@Holodex",
  },
  {
    val: "lol-UWU",
    locale: "en",
    display: "English (UwU)",
    credit: "Doubleturtle#3660",
  },
  {
    val: "lol-PEKO",
    locale: "en",
    display: "English (PEKO)",
    credit: "Doubleturtle#3660",
  },
  {
    val: "ja-JP",
    locale: "ja-JP",
    display: "日本語",
    credit: "Yourein#3960,Saginomiya#2353",
  },
  {
    val: "zh-TW",
    locale: "zh-TW",
    display: "繁體中文",
    credit: "angel84326#7887",
  },
  { val: "zh-CN", locale: "zh-CN", display: "简体中文", credit: "ttg#6038" },
  {
    val: "ko-KR",
    locale: "ko-KR",
    display: "한국어",
    credit: "AlexKoala#0253",
  },
  {
    val: "es-ES",
    locale: "es-ES",
    display: "Español España",
    credit: "TraduSquare (Darkc0m y D3fau4)",
  },
  {
    val: "es-MX",
    locale: "es-MX",
    display: "Español Latino",
    credit: "Aldo#3682",
  },
  {
    val: "ms-MY",
    locale: "ms-MY",
    display: "Bahasa Melayu",
    credit: "Admiy#8261",
  },
  {
    val: "id-ID",
    locale: "id-ID",
    display: "Bahasa Indonesia",
    credit: "alcyneous#2803",
  },
  {
    val: "ru-RU",
    locale: "ru-RU",
    display: "Русский язык",
    credit: "kirillbarnaul#8499",
  },
  {
    val: "pt-BR",
    locale: "pt-BR",
    display: "Português Brasileiro",
    credit: "Ash Niartis#5090",
  },
  {
    val: "de-DE",
    locale: "de-DE",
    display: "Deutsch",
    credit: "DatJocab#1803, Doubleturtle#3660",
  },
  {
    val: "it-IT",
    locale: "it-IT",
    display: "Italiano",
    credit: "テオさん#0139",
  },
  {
    val: "fr-FR",
    locale: "fr-FR",
    display: "Français",
    credit: "pinembour#7770,Derasiel △#0002",
  },
  {
    val: "tr-TR",
    locale: "tr-TR",
    display: "Türkçe",
    credit: "creeperkafasipw#1861",
  },
  {
    val: "vi-VN",
    locale: "vi-VN",
    display: "Tiếng Việt",
    credit: "Pooh#6666,Dead xda member#4848,#Hiraoka Yukio#3042",
  },
  {
    val: "hu-HU",
    locale: "hu-HU",
    display: "Magyar",
    credit: "kuroihikikomori#7216",
  },
  { val: "th-TH", locale: "th-TH", display: "ไทย", credit: "SnowNeko#0282" },
] as const;

export type SupportedLangCodes = (typeof langs)[number]["val"];
export type LocaleCodes = (typeof langs)[number]["locale"];

i18n
  .use(ChainedBackend)
  .use(ICU)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // resources,
    debug: import.meta.env.DEV,
    fallbackLng: "en",
    saveMissing: true,
    supportedLngs: langs.map((lang) => lang.val),
    load: "currentOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "querystring", "navigator"], // local storage first. then querystring for incoming users?
    },
    backend: {
      backends: [
        resourcesToBackend(
          (language: string) =>
            import(
              `@/locales/${langs.find(({ val }) => val === language)
                ?.locale}/ui.yml`
            ),
        ),
      ],
    },
  });

i18n.on("languageChanged", async (lng: SupportedLangCodes) => {
  const localeCode = await loadDayJsLocale(lng);

  store.set(localeAtom, {
    lang: lng,
    dayjs: (...args) => dayjs(...args).locale(localeCode),
  });
});
