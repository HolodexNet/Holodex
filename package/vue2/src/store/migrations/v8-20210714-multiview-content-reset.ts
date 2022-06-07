import { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 8,
    up: (state) => {
        const { layoutContent, presetLayout } = state.multiview;
        const outdatedSave = Object.keys(layoutContent).some((key) => layoutContent[key].content);
        if (outdatedSave) {
            return {
                ...state,
                multiview: {
                    presetLayout,
                },
            };
        }
        return state;
    },
};
