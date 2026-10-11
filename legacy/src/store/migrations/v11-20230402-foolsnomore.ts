import type { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 11,
    // migrate old defaultOpenFavorites boolean => defaultOpen enum value.
    up: (state) => {
        const { foolsLang = "", ...rest } = state.settings;
        if (foolsLang) {
            return {
                ...state,
                settings: {
                    ...rest,
                    lang: foolsLang,
                },
            };
        }
        return state;
    },
};
