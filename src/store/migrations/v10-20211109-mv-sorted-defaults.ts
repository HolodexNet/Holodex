import { getDesktopDefaults } from "@/utils/mv-utils";
import type { IMigration } from "vuex-persistedstate-migrate";

export default <IMigration>{
    version: 10,
    up: (state) => {
        const newDefaults = getDesktopDefaults();
        const oldDefaults = [undefined, "AAUY,UAEYchat0", "AAMY,MAMY", "AAMY,MAMM,MMMM", "AAKM,KAKM,UAEMchat0,AMKM,KMKM,UMEMchat0", "AAIM,AMIM,IAIM,QMIM,QAIM,MMEMchat0,IMEMchat0", "AAIM,AMIM,IAIM,IMIM,QAIM,QMIM", "AAJM,AMJM,JAJM,JMJM,SAGI,SIGI,SQGI", "AAKM,AMKM,RAHI,KAHI,RQHI,KQHI,KIHI,RIHI", "AAII,AIII,AQII,IAII,IIII,IQII,QAII,QIII,QQII", "AAML,MAML,ALGH,GLGH,MLGH,SLGH,ASGG,GSGG,MSGG,SSGG", "AAIK,IAIK,QAIK,AKGH,GKGH,MKGH,SKGH,SRGH,ARGH,MRGH,GRGH", "AAGI,GAGI,MAGI,AIGI,GIGI,MIGI,SIGI,SQGI,AQGI,MQGI,GQGI,SAGI", "AAMM,MMGG,AMGG,GMGG,MGGG,SSGG,MSGG,MAGG,SMGG,SGGG,SAGG,ASGG,GSGG", "AMJM,OMFG,OGFG,TGFG,JMFG,AAJM,OAFG,TMFG,JAFG,TSFG,OSFG,JGFG,TAFG,JSFG", undefined, "AGGG,MMGG,MGGG,SGGG,GMGG,AAGG,MAGG,SMGG,GAGG,SSGG,MSGG,GGGG,SAGG,GSGG,AMGG,ASGG"];

        // Replace old default with new default if unchanged
        const newAutoLayout = state.multiview.autoLayout.map((layout, index) => {
            if (index < oldDefaults.length && layout === oldDefaults[index]) {
                return newDefaults[index];
            }
            return layout;
        });

        return {
            ...state,
            multiview: {
                ...state.multiview,
                autoLayout: newAutoLayout,
            },
        };
    },
};
