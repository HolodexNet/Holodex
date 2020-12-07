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
import { mdiTranslate } from "@mdi/js";

export default {
    name: "Settings",
    computed: {
        language: {
            get() {
                return this.$store.state.lang;
            },
            set(val) {
                this.$store.commit("setLanguage", val);
            },
        },
        darkMode: {
            get() {
                return this.$store.state.darkMode;
            },
            set(val) {
                this.$store.commit("setDarkMode", val);
            },
        },
        redirectMode: {
            get() {
                return this.$store.state.redirectMode;
            },
            set(val) {
                this.$store.commit("setRedirectMode", val);
            },
        },
        useEnName: {
            get() {
                return this.$store.getters.useEnName;
            },
            set(val) {
                this.$store.commit("setUseEnName", val);
            },
        },
        hideThumbnail: {
            get() {
                return this.$store.state.hideThumbnail;
            },
            set(val) {
                this.$store.commit("setHideThumbnail", val);
            },
        },
    },
    data() {
        return {
            langs,
            mdiTranslate,
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
