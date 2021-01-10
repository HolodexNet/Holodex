<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4">{{ $t("views.settings.title") }}</div>
                <div class="pt-4">
                    <v-icon>{{ mdiTranslate }}</v-icon>
                    Language:
                </div>
                <v-radio-group v-model="language" dense fluid>
                    <!-- <template v-slot:label> </template> -->
                    <v-radio v-for="l in langs" :key="l.val" :value="l.val">
                        <template v-slot:label>
                            <div>
                                <strong class="primary--text">
                                    {{ l.display }}
                                </strong>
                                <span class="px-2 text--secondary text-caption"> ♡ {{ l.credit }}</span>
                            </div>
                        </template>
                    </v-radio>
                </v-radio-group>
                <div class="pt-4 mb-0">
                    <v-icon>{{ mdiFilter }}</v-icon>
                    See Clips in these Languages:
                </div>
                <v-select
                    v-model="clipLangs"
                    :items="validClipLangs"
                    multiple
                    chips
                    hint="Show clips in these languages"
                    persistent-hint
                >
                </v-select>
                <v-switch
                    v-model="darkMode"
                    :label="$t('views.settings.darkModeLabel')"
                    :messages="$t('views.settings.darkModeMsg')"
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
                <v-switch
                    :label="$t('views.settings.pushNotificationLabel')"
                    :messages="$t('views.settings.pushNotificationMsg')"
                    disabled
                ></v-switch>
                <br />
                <v-btn @click="resetSettings">
                    {{ $t("views.settings.resetAllSettings") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { langs } from "@/plugins/vuetify";
import { mdiTranslate, mdiFilter } from "@mdi/js";

export default {
    name: "Settings",
    metaInfo: {
        title: "Settings",
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
            set(val) {
                // sort array to increase cache hit rate
                this.$store.commit("settings/setClipLangs", val.sort());
            },
        },
    },
    data() {
        return {
            langs,
            mdiTranslate,
            mdiFilter,
            validClipLangs: Object.freeze([
                {
                    text: "English",
                    value: "en",
                },
                {
                    text: "日本語",
                    value: "ja",
                },
                {
                    text: "Español",
                    value: "es",
                },
                {
                    text: "中文",
                    value: "zh",
                },
                {
                    text: "한국어",
                    value: "kr",
                },
                {
                    text: "français",
                    value: "fr",
                },
            ]),
        };
    },
    methods: {
        resetSettings() {
            this.$store.commit("settings/resetState");
        },
    },
};
</script>

<style></style>
