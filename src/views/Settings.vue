<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4" v-if="!slim">{{ $t("views.settings.title") }}</div>
                <div class="settings-group">
                    <div class="py-1 text-h6">
                        <v-icon>{{ icons.mdiTranslate }}</v-icon>
                        {{ $t("views.settings.languageSettings") }}
                    </div>
                    <v-divider />
                    <v-select :items="langs" item-value="val" v-model="language">
                        <template v-slot:item="{ item }">
                            <!-- {{item}} -->
                            <div>
                                <span class="primary--text" style="font-weight: 500">{{ item.display }}</span>
                                <span class="px-2 text--secondary text-caption"> ♡ {{ item.credit }}</span>
                            </div>
                        </template>
                        <template v-slot:selection="{ item }">
                            <span class="primary--text" style="font-weight: 500">{{ item.display }}</span>
                        </template>
                    </v-select>
                    <div class="pt-2 mb-0">
                        <v-icon>{{ mdiFilter }}</v-icon>
                        {{ $t("views.settings.clipLanguageSelection") }}
                    </div>
                    <v-select
                        v-model="clipLangs"
                        :items="TL_LANGS"
                        multiple
                        chips
                        :hint="$t('views.settings.clipLanguageSelection')"
                        persistent-hint
                    >
                    </v-select>
                </div>
                <div class="settings-group">
                    <div class="py-1 text-h6">{{ $t("views.settings.siteNavigationSettings") }}</div>
                    <v-divider />
                    <div class="d-flex justify-center">
                        <v-switch
                            class="mt-3"
                            style="flex-basis: 50%"
                            v-model="darkMode"
                            :label="$t('views.settings.darkModeLabel')"
                            :messages="$t('views.settings.darkModeMsg')"
                        ></v-switch>
                        <v-select
                            class="ml-3 mt-3"
                            hide-details
                            label="Theme"
                            v-model="themeId"
                            :items="themeSet"
                            item-value="id"
                        >
                            <template v-slot:item="{ item }">
                                <div class="theme-preview">
                                    <span :style="`background:${item.themes.dark.primary}`"></span>
                                    <span :style="`background:${item.themes.dark.secondary}`"></span>
                                    {{ item.name }}
                                </div>
                            </template>
                            <template v-slot:selection="{ item }">
                                <div class="theme-preview">
                                    <span :style="`background:${item.themes.dark.primary}`"></span>
                                    <span :style="`background:${item.themes.dark.secondary}`"></span>
                                    {{ item.name }}
                                </div>
                            </template>
                        </v-select>
                    </div>
                    <v-switch
                        v-model="defaultOpenFavorites"
                        :label="$t('views.settings.defaultFavorites')"
                        :messages="$t('views.settings.defaultFavoritesMsg')"
                    ></v-switch>
                    <v-switch
                        v-model="redirectMode"
                        :label="$t('views.settings.redirectModeLabel')"
                        :messages="$t('views.settings.redirectModeMsg')"
                    ></v-switch>
                    <v-switch
                        v-model="scrollMode"
                        :label="$t('views.settings.scrollModeLabel')"
                        :messages="$t('views.settings.scrollModeMsg')"
                    ></v-switch>
                </div>
                <div class="settings-group" v-if="!slim">
                    <div class="py-1 text-h6">{{ $t("views.settings.videoFeedSettings") }}</div>
                    <v-divider />
                    <v-select
                        class="mt-4"
                        v-model="currentGridSize"
                        :items="[
                            { text: $t('views.settings.gridSize[0]'), value: 0 },
                            { text: $t('views.settings.gridSize[1]'), value: 1 },
                            { text: $t('views.settings.gridSize[2]'), value: 2 },
                        ]"
                        :label="$t('views.settings.gridSizeLabel')"
                        :messages="$t('views.settings.gridSizeMsg')"
                    ></v-select>
                    <v-switch
                        v-model="hideCollabStreams"
                        :label="$t('views.settings.hideCollabStreamsLabel')"
                        :messages="$t('views.settings.hideCollabStreamsMsg')"
                    ></v-switch>
                    <v-switch
                        v-model="useEnName"
                        :label="$t('views.settings.useEnglishNameLabel')"
                        :messages="$t('views.settings.useEnglishNameMsg')"
                    ></v-switch>
                    <v-switch
                        v-model="hideThumbnail"
                        :label="$t('views.settings.hideVideoThumbnailsLabel')"
                        :messages="$t('views.settings.hideVideoThumbnailsMsg')"
                    ></v-switch>
                </div>
                <br v-if="!slim" />
                <v-btn @click="resetSettings" v-if="!slim">
                    {{ $t("views.settings.resetAllSettings") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { langs } from "@/plugins/vuetify";
import { mdiFilter } from "@mdi/js";
import { themeSet, TL_LANGS } from "@/utils/consts";
import { syncState } from "@/utils/functions";
import Vue from "vue";

export default {
    name: "Settings",
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.settings")} - Holodex`;
            },
        };
    },
    props: {
        slim: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...syncState("settings", [
            "darkMode",
            "redirectMode",
            // "autoplayVideo",
            "scrollMode",
            "hideThumbnail",
            "defaultOpenFavorites",
            "hideCollabStreams",
        ]),
        currentGridSize: {
            get() {
                return this.$store.state.currentGridSize;
            },
            set(val) {
                this.$store.commit("setCurrentGridSize", val);
            },
        },
        useEnName: {
            get() {
                return this.$store.getters["settings/useEnName"];
            },
            set(val) {
                this.$store.commit("settings/setUseEnName", val);
            },
        },
        language: {
            get() {
                return this.$store.state.settings.lang;
            },
            set(val) {
                console.log(val);
                this.$store.commit("settings/setLanguage", val);
            },
        },
        clipLangs: {
            get() {
                return this.$store.state.settings.clipLangs;
            },
            set(val: any[]) {
                // sort array to increase cache hit rate
                this.$store.commit("settings/setClipLangs", val.sort());
            },
        },
        theme() {
            return this.$vuetify.theme;
        },
    },
    watch: {
        hideCollabStreams() {
            this.$store.commit("favorites/setLastLiveUpdate", 0);
        },
        themeId(nw) {
            localStorage.setItem("theme", `${nw}`);
            Vue.set(this.$vuetify.theme.themes, "dark", {
                ...this.$vuetify.theme.themes.dark,
                ...themeSet[nw].themes.dark,
            });
            Vue.set(this.$vuetify.theme.themes, "light", {
                ...this.$vuetify.theme.themes.light,
                ...themeSet[nw].themes.light,
            });
        },
    },
    data() {
        return {
            langs,
            mdiFilter,
            TL_LANGS,

            themeId: +localStorage.getItem("theme") || 0,
            themeSet,
        };
    },
    methods: {
        resetSettings() {
            this.$store.commit("resetState");
        },
    },
};
</script>

<style>
.settings-group {
    padding: 12px;
    border: 1px solid var(--v-primary-base);
    border-radius: 8px;
    margin-bottom: 16px;
}
.theme-preview span {
    width: 2rem;
    height: 1rem;
    display: inline-block;
    border-radius: 3px;
    margin-left: 2px;
}
</style>
