import type { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 12,
    // set YTEmbedVariant to youtube by default
    up: (state) => ({
            ...state,
            settings: {
                YTEmbedVariant: "youtube",
            },
        }),
};
