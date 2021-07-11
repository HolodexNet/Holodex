import Vue from "vue";
import Vuetify from "vuetify/lib";
import themeSet from "@/utils/themes";
import VueI18n from "vue-i18n";

import enTL from "@/locales/en/ui.yml";
import vuetifyEn from "vuetify/es5/locale/en";

// ====== i18n setup ======
Vue.use(VueI18n);

export const langs = [
    { val: "en", display: "English", credit: "@Holodex" },
    { val: "en-CA", display: "English (Canadian)", credit: "@Holodex" },
    { val: "ja", display: "日本語", credit: "Yourein#3960,Saginomiya#2353" },
    { val: "zh", display: "繁體中文", credit: "angel84326#7887" },
    { val: "ko", display: "한국어", credit: "AlexKoala#0253" },
    { val: "es-ES", display: "Español España", credit: "TraduSquare (Darkc0m y D3fau4)" },
    { val: "es", display: "Español Latino", credit: "Aldo#3682" },
    { val: "ms", display: "Bahasa Melayu", credit: "Admiy#8261" },
    { val: "id", display: "Bahasa Indonesia", credit: "alcyneous#2803" },
    { val: "ru", display: "Русский язык", credit: "kirillbarnaul#8499" },
    { val: "pt", display: "Português Brasileiro", credit: "Ash Niartis#5090" },
    { val: "de", display: "Deutsch", credit: "DatJocab#1803, Doubleturtle#3660" },
    { val: "it", display: "Italiano", credit: "テオさん#0139" },
    { val: "fr", display: "Français", credit: "pinembour#7770,Derasiel △#0002" },
    { val: "tr", display: "Türkçe", credit: "creeperkafasipw#1861" },
    { val: "vi", display: "Tiếng Việt", credit: "Pooh#6666,Dead xda member#4848" },
    { val: "hu", display: "Magyar", credit: "kuroihikikomori#3519" },
];

export const dayjsLangs = {
    async en() {
        await import("dayjs/locale/en");
    },
    "en-CA": async () => {
        await import("dayjs/locale/en-ca");
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
    async tr() {
        await import("dayjs/locale/tr");
    },
    async vi() {
        await import("dayjs/locale/vi");
    },
    async hu() {
        await import("dayjs/locale/hu");
    },
};
export const i18n = new VueI18n({
    locale: "en", // Set locale
    fallbackLocale: "en",
    // Set default locale messages,
    messages: {
        en: { $vuetify: vuetifyEn, ...enTL },
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
        "en-CA": "en",
        "en-GB": "en",
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
        tr: "tr-TR",
        vi: "vi-VN",
        hu: "hu-HU",
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
const initThemeDarkMode = localStorage.getItem("darkMode");
const theme = themeSet[+initThemeJSON || 0];
const darkTheme = initThemeDarkMode !== "false"; // true if unset.

export const config = {
    treeShake: true,
    icons: {
        iconfont: "mdiSvg",
    },
    theme: {
        dark: darkTheme,
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
