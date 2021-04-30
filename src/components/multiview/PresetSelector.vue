<template>
    <v-card>
        <v-card-title>{{ $t("views.multiview.presets") }}</v-card-title>
        <v-card-text>
            <v-alert dense color="blue-grey" v-html="$t('views.multiview.preset.shareOnDiscord')"> </v-alert>
            <v-card-subtitle class="text-body-1">{{ $t("views.multiview.preset.custom") }}</v-card-subtitle>
            <v-row>
                <template v-for="preset in decodedCustomPresets">
                    <v-col cols="auto" :key="preset.name" class="d-flex flex-column align-center">
                        <div class="layout-btn pa-2" @click="handleSelected(preset)">
                            <LayoutPreview :layout="preset.layout" :content="preset.content" />
                            <div
                                class="text-body-1 text-center d-flex align-center"
                                :class="{ 'is-auto-layout': preset.emptyCells > 0 }"
                            >
                                <span class="flex-grow-1">{{ preset.name }}</span>
                                <v-menu bottom nudge-top="20px">
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on" @click.stop.prevent>
                                            {{ icons.mdiDotsVertical }}
                                        </v-icon>
                                    </template>
                                    <v-list dense>
                                        <v-list-item @click="togglePresetAutoLayout(preset)"
                                            ><v-icon left>{{ mdiToggleSwitch }}</v-icon>
                                            {{ $t("views.multiview.preset.toggleAutoLayout") }}
                                        </v-list-item>
                                        <v-list-item @click.stop="removePresetLayout(preset)"
                                            ><v-icon left>{{ mdiDelete }}</v-icon>
                                            {{ $t("views.multiview.preset.remove") }}
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </div>
                        </div>
                    </v-col>
                </template>
            </v-row>
            <v-card-subtitle class="text-body-1">{{ $t("views.multiview.preset.desktop") }}</v-card-subtitle>
            <v-row>
                <template v-for="preset in decodedDesktopPresets">
                    <v-col cols="auto" :key="preset.name" class="d-flex flex-column align-center">
                        <div class="layout-btn pa-2" @click="handleSelected(preset)">
                            <LayoutPreview :layout="preset.layout" :content="preset.content" />
                            <div class="text-body-1 text-center" :class="{ 'is-auto-layout': preset.emptyCells > 0 }">
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
                            <LayoutPreview
                                :layout="preset.layout"
                                :content="preset.content"
                                :mobile="!preset.landscape"
                            />
                            <div class="text-body-1 text-center" :class="{ 'is-auto-layout': preset.emptyCells > 0 }">
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
import { mdiDelete, mdiDotsVertical, mdiToggleSwitch } from "@mdi/js";
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { decodeLayout, desktopPresets, mobilePresets } from "@/utils/mv-layout";
import { mapState } from "vuex";
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
        return { mdiDelete, mdiDotsVertical, mdiToggleSwitch };
    },
    computed: {
        ...mapState("multiview", ["presetLayout"]),
        decodedCustomPresets() {
            return this.presetLayout.map((preset) => {
                return {
                    ...preset,
                    ...decodeLayout(preset.layout),
                };
            });
        },
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
        removePresetLayout(preset) {
            this.$store.commit("multiview/removePresetLayout", preset.name);
        },
        togglePresetAutoLayout(preset) {
            this.$store.commit("multiview/togglePresetAutoLayout", preset.name);
        },
    },
};
</script>

<style>
.layout-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
    cursor: pointer;
}
.is-auto-layout {
    color: var(--v-anchor-base);
}
</style>
