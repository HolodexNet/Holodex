import type { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 10,
    // migrate old defaultOpenFavorites boolean => defaultOpen enum value.
    up: (state) => {
        const { lang } = state.settings;
        /*
            { val: "en", display: "English", credit: "@Holodex" },
            { val: "en-CA", display: "English (Canadian)", credit: "@Holodex" },
            { val: "en-GB", display: "English (British)", credit: "@Holodex" },
            { val: "lol-UWU", display: "English (UwU)", credit: "Doubleturtle#3660" },
            { val: "lol-PEKO", display: "English (PEKO)", credit: "Doubleturtle#3660" },
        */
        if (["en", "en-CA", "en-GB", "lol-PEKO"].includes(lang)) {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    lang: "lol-UWU",
                    foolsLang: lang,
                },
            };
        }
        return state;
    },
};
