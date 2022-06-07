import Vue from "vue";
import Vuetify from "vuetify/lib";
import themeSet from "@/utils/themes";
import VueI18n from "vue-i18n";

import enTL from "@/locales/en/ui.yml";
import vuetifyEn from "vuetify/lib/locale/en";
import { dayjs } from "@/utils/time";

import * as VuetifyDirectives from "vuetify/lib/directives";

// ====== i18n setup ======
Vue.use(VueI18n);

export const langs = [
    { val: "en", display: "English", credit: "@Holodex" },
    { val: "en-CA", display: "English (Canadian)", credit: "@Holodex" },
    { val: "en-GB", display: "English (British)", credit: "@Holodex" },
    { val: "lol-UWU", display: "English (UwU)", credit: "Doubleturtle#3660" },
    { val: "lol-PEKO", display: "English (PEKO)", credit: "Doubleturtle#3660" },
    { val: "ja", display: "日本語", credit: "Yourein#3960,Saginomiya#2353" },
    { val: "zh", display: "繁體中文", credit: "angel84326#7887" },
    { val: "zh-CN", display: "简体中文", credit: "ttg#6038" },
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
    { val: "vi", display: "Tiếng Việt", credit: "Pooh#6666,Dead xda member#4848,#Hiraoka Yukio#3042" },
    { val: "hu", display: "Magyar", credit: "kuroihikikomori#7216" },
    { val: "th", display: "ไทย", credit: "SnowNeko#0282" },
];

export const asyncLang = {
    async en() {
        await import("dayjs/locale/en");
        return import("@/locales/en/ui.yml");
    },
    "en-GB": async () => {
        await import("dayjs/locale/en-gb");
        return import("@/locales/en/ui.yml");
    },
    "en-CA": async () => {
        await import("dayjs/locale/en-ca");
        return import("@/locales/en/ui.yml");
    },
    async ja() {
        await import("dayjs/locale/ja");
        return import("@/locales/ja-JP/ui.yml");
    },
    async zh() {
        await import("dayjs/locale/zh-tw");
        return import("@/locales/zh-TW/ui.yml");
    },
    "zh-CN": async () => {
        await import("dayjs/locale/zh-cn");
        return import("@/locales/zh-CN/ui.yml");
    },
    async es() {
        await import("dayjs/locale/es");
        return import("@/locales/es-MX/ui.yml");
    },
    "es-ES": async () => {
        await import("dayjs/locale/es");
        return import("@/locales/es-ES/ui.yml");
    },
    async ms() {
        await import("dayjs/locale/ms");
        return import("@/locales/ms-MY/ui.yml");
    },
    async id() {
        await import("dayjs/locale/id");
        return import("@/locales/id-ID/ui.yml");
    },
    async ru() {
        await import("dayjs/locale/ru");
        return import("@/locales/ru-RU/ui.yml");
    },
    async fr() {
        await import("dayjs/locale/fr");
        return import("@/locales/fr-FR/ui.yml");
    },
    async pt() {
        await import("dayjs/locale/pt-br");
        return import("@/locales/pt-BR/ui.yml");
    },
    async de() {
        await import("dayjs/locale/de");
        return import("@/locales/de-DE/ui.yml");
    },
    async it() {
        await import("dayjs/locale/it");
        return import("@/locales/it-IT/ui.yml");
    },
    async ko() {
        await import("dayjs/locale/ko");
        return import("@/locales/ko-KR/ui.yml");
    },
    async tr() {
        await import("dayjs/locale/tr");
        return import("@/locales/tr-TR/ui.yml");
    },
    async vi() {
        await import("dayjs/locale/vi");
        return import("@/locales/vi-VN/ui.yml");
    },
    async hu() {
        await import("dayjs/locale/hu");
        return import("@/locales/hu-HU/ui.yml");
    },
    "lol-UWU": async () => {
        await import("dayjs/locale/en");
        return import("@/locales/lol-UWU/ui.yml");
    },
    "lol-PEKO": async () => {
        await import("dayjs/locale/en");
        return import("@/locales/lol-PEKO/ui.yml");
    },
    async th() {
        await import("dayjs/locale/th");
        return import("@/locales/th-TH/ui.yml");
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

const dayjsName = {
    "en-CA": "en-ca",
    "en-GB": "en-gb",
    zh: "zh-tw",
    "zh-CN": "zh-cn",
    "es-ES": "es",
    pt: "pt-br",
    "lol-UWU": "en",
    "lol-PEKO": "en",
};

function setI18nLanguage(lang) {
    i18n.locale = lang;
    const dayjsLang = dayjsName[lang] || lang || "en";
    dayjs.locale(dayjsLang);
}

// Load language from webpack chunked files
export function loadLanguageAsync(lang) {
    // If the same language
    if (i18n.locale === lang) {
        return Promise.resolve();
    }

    // If the language was already loaded
    if (loadedLanguages.includes(lang)) {
        return Promise.resolve(setI18nLanguage(lang));
    }

    // If the language hasn't been loaded yet
    return asyncLang[lang]().then((msg) => {
        i18n.setLocaleMessage(lang, msg.default);
        loadedLanguages.push(lang);
        return setI18nLanguage(lang);
    });
}

// ====== end i18n setup ======

const initThemeJSON = localStorage.getItem("theme");
const initThemeDarkMode = localStorage.getItem("darkMode");
const theme = themeSet[+initThemeJSON || 0] || themeSet[0];
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

// workaround for vuetify directives not being auto-loaded for some reason
// if you remove this, you'll get warnings for e.g. `v-touch` not existing
/** @param {string} value */
const splitOnUpperCase = (value) => {
    const out = [];
    let fragment = "";
    [...value].forEach((char, index) => {
        if (index > 0 && char.toUpperCase() === char) {
            out.push(fragment);
            fragment = "";
        }
        fragment += char;
    });
    if (fragment.length > 0) out.push(fragment);
    return out;
};
/** @param {string} value */
const toKebabCase = (value) => splitOnUpperCase(value).map((v) => v.toLowerCase()).join("-");
Object.keys(VuetifyDirectives).forEach((directive) => {
    Vue.directive(toKebabCase(directive), VuetifyDirectives[directive]);
});

export const vuetify = new Vuetify(config);
