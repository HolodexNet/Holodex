import { getDesktopDefaults } from "@/utils/mv-utils";
import type { IMigration } from "vuex-persistedstate-migrate";
import multiviewModule from "../multiview.module";

export default <IMigration>{
    version: 9,
    // migrate old defaultOpenFavorites boolean => defaultOpen enum value.
    up: (state) => state,
        // const newDefaults = getDesktopDefaults();
        // const oldDefaults = [
        //     null,
        //     "AAUY,UAEYchat0",
        //     "AAOM,AMOM,OAFYchat,TAFYchat",
        //     "AAMY,MAMM,MMMM",
        //     "AAKM,KAKM,UAEMchat0,AMKM,KMKM,UMEMchat0",
        //     "AAIM,AMIM,IAIM,QMIM,QAIM,MMEMchat0,IMEMchat0",
        //     "AAIM,AMIM,IAIM,IMIM,QAIM,QMIM",
        //     "AAJM,AMJM,JAJM,JMJM,SAGI,SIGI,SQGI",
        //     null,
        //     "AAII,AIII,AQII,IAII,IIII,IQII,QAII,QIII,QQII",
        //     "AAML,MAML,ALGH,GLGH,MLGH,SLGH,ASGG,GSGG,MSGG,SSGG",
        // ];

        // // Replace old default with new default if unchanged
        // const newAutoLayout = state.multiview.autoLayout.map((layout, index) => {
        //     if (index < oldDefaults.length && layout === oldDefaults[index]) {
        //         return newDefaults[index];
        //     }
        //     return layout;
        // });

        // // Append the rest
        // if (newAutoLayout.length < newDefaults.length) {
        //     newAutoLayout.push(...newDefaults.slice(newAutoLayout.length));
        // }

        // return {
        //     ...state,
        //     multiview: {
        //         ...state.multiview,
        //         autoLayout: newAutoLayout,
        //     },
        // };
};
