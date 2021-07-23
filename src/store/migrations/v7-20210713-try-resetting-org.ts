import { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 7,
    up: (state) => {
        if (state.currentOrg.name.includes('short"')) {
            return {
                ...state,
                currentOrg: { name: "Hololive", short: "Holo" },
                orgFavorites: [
                    { name: "All Vtubers", short: "Vtuber" },
                    { name: "Hololive", short: "Holo" },
                    { name: "Nijisanji", short: "Niji" },
                    { name: "Independents", short: "Indie" },
                ],
            };
        }
        return state;
    },
};
