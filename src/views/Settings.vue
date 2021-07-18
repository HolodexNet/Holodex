<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4 mb-4" v-if="!slim">{{ $t("views.settings.title") }}</div>
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
                    <div class="d-flex justify-center flex-wrap">
                        <v-switch
                            class=""
                            style="flex-basis: 50%; min-width: 200px"
                            v-model="darkMode"
                            :label="$t('views.settings.darkModeLabel')"
                        ></v-switch>
                        <!-- :messages="$t('views.settings.darkModeMsg')" -->
                        <v-select
                            class="mb-4"
                            hide-details
                            style="min-width: 200px"
                            :label="$t('views.settings.theme')"
                            v-model="themeId"
                            :items="themeSet"
                            item-value="id"
                        >
                            <template v-slot:item="{ item }">
                                <div class="theme-preview">
                                    <span :style="`background:${item.themes[mode].primary}`"></span>
                                    <span :style="`background:${item.themes[mode].secondary}`"></span>
                                    {{ item.name }}
                                </div>
                            </template>
                            <template v-slot:selection="{ item }">
                                <div class="theme-preview">
                                    <span :style="`background:${item.themes[mode].primary}`"></span>
                                    <span :style="`background:${item.themes[mode].secondary}`"></span>
                                    {{ item.name }}
                                </div>
                            </template>
                        </v-select>
                    </div>
                    <v-divider class="my-2" />
                    <v-select
                        v-model="defaultOpen"
                        :items="defaultOpenChoices"
                        :label="$t('views.settings.defaultPage')"
                        :messages="$t('views.settings.defaultPageMsg')"
                    ></v-select>
                    <v-divider class="my-2" />
                    <v-switch
                        v-model="redirectMode"
                        :label="$t('views.settings.redirectModeLabel')"
                        :messages="$t('views.settings.redirectModeMsg')"
                    ></v-switch>
                    <v-divider class="my-2" />
                    <v-select
                        class=""
                        v-model="currentGridSize"
                        :items="[
                            { text: $t('views.settings.gridSize[0]'), value: 0 },
                            { text: $t('views.settings.gridSize[1]'), value: 1 },
                            { text: $t('views.settings.gridSize[2]'), value: 2 },
                        ]"
                        :label="$t('views.settings.gridSizeLabel')"
                        :messages="$t('views.settings.gridSizeMsg')"
                    ></v-select>
                    <v-divider class="my-2" />
                    <v-switch
                        v-model="scrollMode"
                        :label="$t('views.settings.scrollModeLabel')"
                        :messages="$t('views.settings.scrollModeMsg')"
                    ></v-switch>
                </div>
                <div class="settings-group" v-if="!slim">
                    <div class="py-1 text-h6">{{ $t("views.settings.videoFeedSettings") }}</div>
                    <v-divider />
                    <v-switch
                        v-model="hideCollabStreams"
                        :label="$t('views.settings.hideCollabStreamsLabel')"
                        :messages="$t('views.settings.hideCollabStreamsMsg')"
                    ></v-switch>

                    <v-divider class="my-2" />

                    <v-autocomplete
                        v-model="hiddenTopics"
                        :items="topics"
                        multiple
                        chips
                        clearable
                        deletable-chips
                        :label="$t('views.settings.hideTopicsLabel')"
                        :hint="$t('views.settings.hideTopicsMsg')"
                        persistent-hint
                    >
                    </v-autocomplete>

                    <v-divider class="my-2" />

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
import { TL_LANGS } from "@/utils/consts";
import themeSet from "@/utils/themes";
import { syncState } from "@/utils/functions";
import Vue from "vue";
import backendApi from "@/utils/backend-api";

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
    async mounted() {
        backendApi.topics().then(({ data }) => {
            this.topics = data.map(({ id, count }) => ({ value: id, text: `${id} (${count})` }));
        });
    },
    computed: {
        ...syncState("settings", [
            "darkMode",
            "redirectMode",
            "autoplayVideo",
            "scrollMode",
            "hideThumbnail",
            "defaultOpen",
            "hideCollabStreams",
            "hiddenTopics",
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
        hiddenTopics: {
            get() {
                return this.$store.state.settings.hiddenTopics;
            },
            set(val: any[]) {
                this.$store.commit("settings/setHiddenTopics", val.sort());
            },
        },
        theme() {
            return this.$vuetify.theme;
        },
        mode() {
            return this.darkMode ? "dark" : "light";
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
            defaultOpenChoices: Object.freeze([
                {
                    text: this.$t("component.mainNav.home"),
                    value: "home",
                },
                {
                    text: this.$t("component.mainNav.favorites"),
                    value: "favorites",
                },
                {
                    text: this.$t("component.mainNav.multiview"),
                    value: "multiview",
                },
            ]),
            topics: [],
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
