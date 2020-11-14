<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4">{{ $t("views.settings.title") }}</div>
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
export default {
    name: "Settings",
    computed: {
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
    methods: {
        resetSettings() {
            this.$store.commit("resetState");
        },
    },
};
</script>

<style></style>
