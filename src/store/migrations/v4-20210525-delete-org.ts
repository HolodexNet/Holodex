import { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    // deletion of VWP and Hanayori org.
    version: 4,
    up: (state) => {
        const orgFavorites = state.orgFavorites.filter(
            (v) => v !== "Virtual Witch Phenomenon" && v !== "Hanayori Joshiryo",
        );
        return {
            ...state,
            orgFavorites,
        };
    },
};
