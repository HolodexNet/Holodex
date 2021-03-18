<template>
    <v-card>
        <v-card-title>Preset Layout</v-card-title>
        <v-card-text>
            <v-alert dense color="blue-grey darken-2">
                Have a cool layout to share? Let us know on our
                <a href="https://discord.gg/jctkgHBt4b">Discord server</a>!
            </v-alert>
            <v-card-subtitle class="text-body-1">Desktop</v-card-subtitle>
            <v-row justify="space-around">
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
            <v-card-subtitle class="text-body-1">Mobile</v-card-subtitle>
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
    name: "VideoSelector",
    components: {
        VideoCardList,
        LoadingOverlay,
        LayoutPreview,
    },
    data() {
        return {
            desktopPresets: [
                {
                    layout: "AMMM,AAMM,MMMM,MAMM",
                    name: "2 x 2",
                },
                {
                    layout: "IQII,IAII,QIII,QQII,QAII,IIII,AAII,AQII,AIII",
                    name: "3 x 3",
                },
                {
                    layout: "TAFYchat,AATY",
                    name: "Side Chat 1",
                },

                {
                    layout: "AMRM,RAHYchat,AARM",
                    name: "Side Chat 2",
                },
                {
                    layout: "AMJM,JMJM,JAJM,SAGYchat,AAJM",
                    name: "Side Chat 4",
                },
                {
                    layout: "MMMM,MAMM,AAMY",
                    name: "p1s2",
                },
                {
                    layout: "QAII,QQII,IQII,QIII,AQII,AAQQ",
                    name: "p1s5",
                },
                {
                    layout: "MAML,MLGH,GLGH,GSGG,SLGH,ASGG,MSGG,SSGG,ALGH,AAML",
                    name: "Among Us 1",
                },
                {
                    layout: "KAKL,KLFH,FLFH,FSFG,PLFH,ASFG,KSFG,PSFG,ALFH,UAEYchat,AAKL",
                    name: "Among Us 2",
                },
                {
                    layout: "SAGYchat,GRGH,ARGH,MRGH,AASR",
                    name: "Sports Fes 1",
                },
                {
                    layout: "MSGG,GMGG,GSGG,MGGG,ASGG,MMGG,AMGG,SAGYchat,MAGG,AAMM",
                    name: "Sports Fes 2",
                    type: "deskotp",
                },
                {
                    layout: "SGGG,SSGG,SMGG,SAGG,ASGG,AMGG,AGGG,AAGG,GMMM,GAMM",
                    name: "Sports Fes 3",
                },
            ],
            mobilePresets: [
                {
                    layout: "AIYI,AQYI,AAYI",
                    name: "Mobile 1",
                },
                {
                    layout: "AHYH,AOYK,AAYH",
                    name: "Mobile 2",
                },
                {
                    layout: "AAMM,MAMY,AMMM",
                    name: "Mobile 3",
                    landscape: true,
                },
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
