<template>
    <v-card>
        <v-card-title>{{ $t("views.multiview.presets") }}</v-card-title>
        <v-card-text>
            <v-alert dense color="blue-grey">
                Have a cool layout to share? Use the share button and let us know on our
                <a href="https://discord.gg/jctkgHBt4b">Discord server</a>!
            </v-alert>
            <v-card-subtitle class="text-body-1">{{ $t("views.multiview.preset.desktop") }}</v-card-subtitle>
            <v-row>
                <template v-for="preset in desktopPresets">
                    <v-col cols="auto" :key="preset.name" class="d-flex flex-column align-center">
                        <div class="layout-btn pa-2" @click="handleSelected(decodeLayout(preset.layout))">
                            <LayoutPreview :layout="decodeLayout(preset.layout).layout" />
                            <div class="text-body-1 text-center">
                                {{ preset.name }}
                            </div>
                        </div>
                    </v-col>
                </template>
            </v-row>
            <v-card-subtitle class="text-body-1">{{ $t("views.multiview.preset.mobile") }}</v-card-subtitle>
            <v-row justify="space-around" align="center">
                <template v-for="preset in mobilePresets">
                    <v-col cols="auto" :key="preset.name" class="d-flex flex-column align-center">
                        <div class="layout-btn pa-2" @click="handleSelected(decodeLayout(preset.layout))">
                            <LayoutPreview :layout="decodeLayout(preset.layout).layout" :mobile="!preset.landscape" />
                            <div class="text-body-1 text-center">
                                {{ preset.name }}
                            </div>
                        </div>
                    </v-col>
                </template>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { decodeLayout } from "@/utils/mv-layout";
import LayoutPreview from "./LayoutPreview";

export default {
    name: "PresetSelector",
    components: {
        VideoCardList,
        LoadingOverlay,
        LayoutPreview,
    },
    mounted() {
        // this.desktopPresets = sortPresets(this.desktopPresets);
        // this.mobilePresets = sortPresets(this.mobilePresets);
    },
    data() {
        return {
            desktopPresets: [
                { layout: "AAMM,AMMM,MAMM,MMMM", name: "2 x 2" },
                { layout: "AAII,AIII,AQII,IAII,IIII,IQII,QAII,QIII,QQII", name: "3 x 3" },
                { layout: "AATY,TAFYchat", name: "Side Chat 1" },
                { layout: "AARM,AMRM,RAHYchat", name: "Side Chat 2" },
                { layout: "SAGYchat,AAJM,AMJM,JAJM,JMJM", name: "Side Chat 4" },
                { layout: "AAMY,MAMM,MMMM", name: "p1s2" },
                { layout: "AAQQ,AQII,IQII,QAII,QIII,QQII", name: "p1s5" },
                { layout: "AAOM,AMOM,OAFYchat,TAFYchat", name: "2 Video, 2 Chat" },
                { layout: "AAMM,AMMM,MAMM,MMGMchat,SMGMchat", name: "3 Video, 2 Chat" },
                { layout: "AAML,MAML,ALGH,GLGH,MLGH,SLGH,ASGG,GSGG,MSGG,SSGG", name: "Among Us 1" },
                { layout: "AAKL,KAKL,UAEYchat,ALFH,FLFH,KLFH,PLFH,ASFG,FSFG,KSFG,PSFG", name: "Among Us 2" },
                { layout: "AASR,SAGYchat,ARGH,GRGH,MRGH", name: "Sports Fes 1" },
                {
                    layout: "AAMM,SAGYchat,AMGG,ASGG,GMGG,GSGG,MAGG,MGGG,MMGG,MSGG",
                    name: "Sports Fes 2",
                    type: "deskotp",
                },
                { layout: "GAMM,GMMM,AAGG,AGGG,AMGG,ASGG,SAGG,SGGG,SMGG,SSGG", name: "Sports Fes 3" },
            ],
            mobilePresets: [
                { layout: "AAYI,AIYI,AQYI", name: "Mobile 1" },
                { layout: "AOYKchat,AAYH,AHYH", name: "Mobile 2" },
                { layout: "MAMY,AAMM,AMMM", name: "Mobile 3", landscape: true },
            ],
        };
    },
    computed: {},
    methods: {
        decodeLayout,
        handleSelected(preset) {
            this.$emit("selected", preset);
        },
    },
};
</script>

<style>
.layout-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
    cursor: pointer;
}
</style>
