import { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 2,
    // migrate old defaultOpenFavorites boolean => defaultOpen enum value.
    up: (state) => {
        const defaultOpen = state.settings.defaultOpen || (state.settings.defaultOpenFavorites ? "favorites" : "home");

        return {
            ...state,
            settings: {
                ...state.settings,
                defaultOpen,
                autoplayVideo: false,
            },
        };
    },
};
