import Vue from "vue";
import Vuetify from "vuetify/lib";
import { themeSet } from "@/utils/consts";
import VueI18n from "vue-i18n";

import enTL from "@/locales/en/ui.yml";

// ====== i18n setup ======
Vue.use(VueI18n);

export const langs = [
    { val: "en", display: "English", credit: "@Holodex" },
    { val: "ja", display: "日本語", credit: "Yourein#3960" },
    { val: "zh", display: "繁體中文", credit: "angel84326#7887" },
    { val: "ko", display: "한국어", credit: "AlexKoala#0253" },
    { val: "es-ES", display: "Español España", credit: "TraduSquare (Darkc0m y D3fau4)" },
    { val: "es", display: "Español Latino", credit: "Aldo#3682" },
    { val: "ms", display: "Bahasa Melayu", credit: "Admiy#8261" },
    { val: "id", display: "Bahasa Indonesia", credit: "alcyneous#2803" },
    { val: "ru", display: "Русский язык", credit: "kirillbarnaul#8499" },
    { val: "pt", display: "Português Brasileiro", credit: "Ash Niartis#5090" },
    { val: "de", display: "Deutsch", credit: "DatJocab#1803" },
    { val: "it", display: "Italiano", credit: "テオさん#0139" },
    { val: "fr", display: "Français", credit: "pinembour#7770" },
];

export const dayjsLangs = {
    async en() {
        await import("dayjs/locale/en");
    },
    async ja() {
        await import("dayjs/locale/ja");
    },
    async zh() {
        await import("dayjs/locale/zh-tw");
    },
    async es() {
        await import("dayjs/locale/es");
    },
    "es-ES": async () => {
        await import("dayjs/locale/es");
    },
    async ms() {
        await import("dayjs/locale/ms");
    },
    async id() {
        await import("dayjs/locale/id");
    },
    async ru() {
        await import("dayjs/locale/ru");
    },
    async fr() {
        await import("dayjs/locale/fr");
    },
    async pt() {
        await import("dayjs/locale/pt-br");
    },
    async de() {
        await import("dayjs/locale/de");
    },
    async it() {
        await import("dayjs/locale/it");
    },
    async ko() {
        await import("dayjs/locale/ko");
    },
};

export const i18n = new VueI18n({
    locale: "en", // Set locale
    fallbackLocale: "en",
    // Set default locale messages,
    messages: {
        en: enTL,
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

const loadedLanguages = ["en"];

function setI18nLanguage(lang) {
    dayjsLangs[lang]();
    i18n.locale = lang;
}

// Load language from webpack chunked files
export function loadLanguageAsync(lang) {
    // Map short language code to full
    const langFile = {
        ja: "ja-JP",
        es: "es-MX",
        "es-ES": "es-ES",
        ms: "ms-MY",
        zh: "zh-TW",
        id: "id-ID",
        ru: "ru-RU",
        fr: "fr-FR",
        pt: "pt-BR",
        de: "de-DE",
        it: "it-IT",
        ko: "ko-KR",
    };

    // If the same language
    if (i18n.locale === lang) {
        return Promise.resolve(setI18nLanguage(lang));
    }

    // If the language was already loaded
    if (loadedLanguages.includes(lang)) {
        return Promise.resolve(setI18nLanguage(lang));
    }

    // If the language hasn't been loaded yet
    return import(/* webpackChunkName: "[request]" */ `@/locales/${langFile[lang]}/ui.yml`).then((msg) => {
        i18n.setLocaleMessage(lang, msg.default);
        loadedLanguages.push(lang);
        return setI18nLanguage(lang);
    });
}

// ====== end i18n setup ======

const initThemeJSON = localStorage.getItem("theme");
const theme = themeSet[+initThemeJSON || 0];

export const config = {
    treeShake: true,
    icons: {
        iconfont: "mdiSvg",
    },
    theme: {
        options: {
            customProperties: true,
        },
        themes: theme.themes,
    },
    lang: {
        t: (key, ...params) => i18n.t(key, params),
    },
};

Vue.use(Vuetify);

export const vuetify = new Vuetify(config);
