<template>
    <v-card style="min-height: 90vh">
        <v-card-title>{{ $t("views.multiview.presets") }}</v-card-title>
        <v-card-text>
            <v-tabs v-model="currentTab">
                <v-tab>{{ $t("views.multiview.preset.custom") }}</v-tab>
                <v-tab>{{ $t("views.multiview.preset.desktop") }}</v-tab>
                <v-tab>{{ $t("views.multiview.preset.mobile") }}</v-tab>
                <v-tab>{{ $t("views.multiview.preset.autoLayout") }}</v-tab>
                <v-tab-item>
                    <v-row>
                        <template v-for="preset in decodedCustomPresets">
                            <v-col :key="preset.name" cols="auto" class="d-flex flex-column align-center">
                                <LayoutPreviewCard
                                    :preset="preset"
                                    custom
                                    :active="presetInAuto(preset)"
                                    @click="handleSelected(preset)"
                                >
                                    <template #post>
                                        <v-menu bottom nudge-top="20px">
                                            <template #activator="{ on }">
                                                <v-icon v-on="on" @click.stop.prevent>
                                                    {{ icons.mdiDotsVertical }}
                                                </v-icon>
                                            </template>
                                            <v-list dense>
                                                <!-- <v-list-item @click="togglePresetAutoLayout(preset)"
                                                    ><v-icon left>{{ mdiToggleSwitch }}</v-icon>
                                                    {{ $t("views.multiview.preset.toggleAutoLayout") }}
                                                </v-list-item> -->
                                                <v-list-item @click.stop="removePresetLayout(preset)">
                                                    <v-icon left>
                                                        {{ icons.mdiDelete }}
                                                    </v-icon>
                                                    {{ $t("views.multiview.preset.remove") }}
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </template>
                                </LayoutPreviewCard>
                            </v-col>
                        </template>
                    </v-row>
                </v-tab-item>
                <v-tab-item>
                    <v-row>
                        <template v-for="preset in decodedDesktopPresets">
                            <v-col :key="preset.name" cols="auto" class="d-flex flex-column align-center">
                                <LayoutPreviewCard
                                    :preset="preset"
                                    :active="presetInAuto(preset)"
                                    @click="handleSelected(preset)"
                                />
                            </v-col>
                        </template>
                    </v-row>
                </v-tab-item>
                <v-tab-item>
                    <v-row justify="space-around" align="center">
                        <template v-for="preset in decodedMobilePresets">
                            <v-col :key="preset.name" cols="auto" class="d-flex flex-column align-center">
                                <LayoutPreviewCard
                                    :preset="preset"
                                    :active="presetInAuto(preset)"
                                    @click="handleSelected(preset)"
                                />
                            </v-col>
                        </template>
                    </v-row>
                </v-tab-item>
                <v-tab-item>
                    <template v-for="(group, index) in desktopGroups">
                        <v-radio-group :key="'preset-' + index" v-model="autoLayout[index]" column hide-details>
                            <v-card-subtitle v-if="index !== 0" class="text-body-1 pa-1">
                                {{ $t("component.channelInfo.videoCount", [index]) }}
                            </v-card-subtitle>

                            <v-row v-if="group" :key="'preset-list-' + index">
                                <template v-for="preset in group">
                                    <v-col :key="preset.name" cols="auto" class="d-flex flex-column align-center">
                                        <LayoutPreviewCard
                                            :preset="preset"
                                            :active="presetInAuto(preset)"
                                            @click="setAutoLayout(index, preset.id)"
                                        >
                                            <template #pre>
                                                <v-radio label="" :value="preset.id" class="ma-0" />
                                            </template>
                                        </LayoutPreviewCard>
                                    </v-col>
                                </template>
                            </v-row>
                        </v-radio-group>
                    </template>
                </v-tab-item>
            </v-tabs>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { mdiDotsVertical, mdiToggleSwitch } from "@mdi/js";
import { decodeLayout } from "@/utils/mv-utils";
import { mapState, mapGetters } from "vuex";
import LayoutPreviewCard from "./LayoutPreviewCard.vue";

export default {
    name: "PresetSelector",
    components: {
        LayoutPreviewCard,
    },
    data() {
        return {
            mdiDotsVertical,
            mdiToggleSwitch,
            currentTab: 1,
        };
    },
    computed: {
        ...mapState("multiview", ["presetLayout", "autoLayout"]),
        ...mapGetters("multiview", [
            "decodedCustomPresets",
            "decodedDesktopPresets",
            "decodedMobilePresets",
            "desktopGroups",
        ]),
        autoLayoutSet() {
            return new Set(this.autoLayout);
        },
    },
    mounted() {
        // this.desktopPresets = sortPresets(this.desktopPresets);
        // this.mobilePresets = sortPresets(this.mobilePresets);
        if (this.presetLayout.length > 0) this.currentTab = 0;
    },
    methods: {
        setAutoLayout(index, encodedLayout) {
            this.$store.commit("multiview/setAutoLayout", { index, encodedLayout });
        },
        decodeLayout,
        handleSelected(preset) {
            this.$emit("selected", preset);
        },
        removePresetLayout(preset) {
            this.$store.commit("multiview/removePresetLayout", preset.name);
        },
        // togglePresetAutoLayout(preset) {
        //     this.$store.commit("multiview/togglePresetAutoLayout", preset.name);
        // },
        presetInAuto(preset) {
            return this.autoLayoutSet.has(preset.id);
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
