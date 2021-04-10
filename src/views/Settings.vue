<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4">{{ $t("views.settings.title") }}</div>
                <div class="pt-4">
                    <v-icon>{{ icons.mdiTranslate }}</v-icon>
                    Language:
                </div>
                <v-radio-group v-model="language" dense fluid>
                    <!-- <template v-slot:label> </template> -->
                    <v-radio v-for="l in langs" :key="l.val" :value="l.val">
                        <template v-slot:label>
                            <div>
                                <span class="primary--text" style="font-weight: 500">{{ l.display }}</span>
                                <span class="px-2 text--secondary text-caption"> ♡ {{ l.credit }}</span>
                            </div>
                        </template>
                    </v-radio>
                </v-radio-group>
                <div class="pt-4 mb-0">
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
                <v-switch
                    v-model="darkMode"
                    :label="$t('views.settings.darkModeLabel')"
                    :messages="$t('views.settings.darkModeMsg')"
                ></v-switch>
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
                    v-model="useEnName"
                    :label="$t('views.settings.useEnglishNameLabel')"
                    :messages="$t('views.settings.useEnglishNameMsg')"
                ></v-switch>
                <v-switch
                    v-model="hideThumbnail"
                    :label="$t('views.settings.hideVideoThumbnailsLabel')"
                    :messages="$t('views.settings.hideVideoThumbnailsMsg')"
                ></v-switch>
                <!-- <v-switch
                    :label="$t('views.settings.pushNotificationLabel')"
                    :messages="$t('views.settings.pushNotificationMsg')"
                    disabled
                ></v-switch> -->
                <v-switch
                    v-model="autoplayVideo"
                    :label="$t('views.settings.autoplayVideoLabel')"
                    :messages="$t('views.settings.autoplayVideoMsg')"
                ></v-switch>
                <v-switch
                    v-model="scrollMode"
                    :label="$t('views.settings.scrollModeLabel')"
                    :messages="$t('views.settings.scrollModeMsg')"
                ></v-switch>
                <br />
                <v-btn @click="resetSettings">
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
    computed: {
        language: {
            get() {
                return this.$store.state.settings.lang;
            },
            set(val) {
                this.$store.commit("settings/setLanguage", val);
            },
        },
        darkMode: {
            get() {
                return this.$store.state.settings.darkMode;
            },
            set(val) {
                this.$store.commit("settings/setDarkMode", val);
            },
        },
        redirectMode: {
            get() {
                return this.$store.state.settings.redirectMode;
            },
            set(val) {
                this.$store.commit("settings/setRedirectMode", val);
            },
        },
        autoplayVideo: {
            get() {
                return this.$store.state.settings.autoplayVideo;
            },
            set(val) {
                this.$store.commit("settings/setAutoplayVideo", val);
            },
        },
        scrollMode: {
            get() {
                return this.$store.state.settings.scrollMode;
            },
            set(val) {
                this.$store.commit("settings/setScrollMode", val);
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
        hideThumbnail: {
            get() {
                return this.$store.state.settings.hideThumbnail;
            },
            set(val) {
                this.$store.commit("settings/setHideThumbnail", val);
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
        defaultOpenFavorites: {
            get() {
                return this.$store.state.settings.defaultOpenFavorites;
            },
            set(val) {
                this.$store.commit("settings/setDefaultOpenFavorites", val);
            },
        },
    },
    data() {
        return {
            langs,
            mdiFilter,
            TL_LANGS,
        };
    },
    methods: {
        resetSettings() {
            this.$store.commit("resetState");
        },
    },
};
</script>

<style></style>
