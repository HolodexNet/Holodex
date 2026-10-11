import type { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 10,
    // migrate old defaultOpenFavorites boolean => defaultOpen enum value.
    up: (state) => state,
};
