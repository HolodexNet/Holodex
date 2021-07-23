import { ORGS_PREFIX } from "@/utils/consts";
import { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 6,
    up: (state) => {
        const newCurrentOrg = {
            name: state.currentOrg,
            short: ORGS_PREFIX[state.currentOrg] ? ORGS_PREFIX[state.currentOrg] : null,
        };
        const newOrgFavorites = state.orgFavorites.map((org) => {
            return { name: org, short: ORGS_PREFIX[org] ? ORGS_PREFIX[org] : null };
        });
        return {
            ...state,
            currentOrg: newCurrentOrg,
            orgFavorites: newOrgFavorites,
        };
    },
};
