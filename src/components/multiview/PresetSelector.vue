<template>
    <v-card>
        <v-card-title>{{ $t("views.multiview.presets") }}</v-card-title>
        <v-card-text>
            <v-alert dense color="blue-grey" v-html="$t('views.multiview.preset.shareOnDiscord')"> </v-alert>
            <v-card-subtitle class="text-body-1">{{ $t("views.multiview.preset.desktop") }}</v-card-subtitle>
            <v-row>
                <template v-for="preset in decodedDesktopPresets">
                    <v-col cols="auto" :key="preset.name" class="d-flex flex-column align-center">
                        <div class="layout-btn pa-2" @click="handleSelected(preset)">
                            <LayoutPreview :layout="preset.layout" />
                            <div class="text-body-1 text-center">
                                {{ preset.name }}
                            </div>
                        </div>
                    </v-col>
                </template>
            </v-row>
            <v-card-subtitle class="text-body-1">{{ $t("views.multiview.preset.mobile") }}</v-card-subtitle>
            <v-row justify="space-around" align="center">
                <template v-for="preset in decodedMobilePresets">
                    <v-col cols="auto" :key="preset.name" class="d-flex flex-column align-center">
                        <div class="layout-btn pa-2" @click="handleSelected(preset)">
                            <LayoutPreview :layout="preset.layout" :mobile="!preset.landscape" />
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

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { decodeLayout, desktopPresets, mobilePresets } from "@/utils/mv-layout";
import LayoutPreview from "./LayoutPreview.vue";

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
        return {};
    },
    computed: {
        decodedDesktopPresets() {
            return desktopPresets.map((preset) => {
                return {
                    ...preset,
                    ...decodeLayout(preset.layout),
                };
            });
        },
        decodedMobilePresets() {
            return mobilePresets.map((preset) => {
                return {
                    ...preset,
                    ...decodeLayout(preset.layout),
                };
            });
        },
    },
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
