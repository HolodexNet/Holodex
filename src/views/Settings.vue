<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4">{{ $t("views.settings.title") }}</div>
                <div class="settings-group">
                    <div class="py-2 text-h5">
                        <v-icon>{{ icons.mdiTranslate }}</v-icon>
                        Language:
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
                    <div class="py-2 text-h5">Site/Navigation</div>
                    <v-divider />
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
                        v-model="scrollMode"
                        :label="$t('views.settings.scrollModeLabel')"
                        :messages="$t('views.settings.scrollModeMsg')"
                    ></v-switch>
                </div>
                <div class="settings-group">
                    <div class="py-2 text-h5">Video List Settings</div>
                    <v-divider />
                    <v-select
                        class="mt-4"
                        v-model="currentGridSize"
                        :items="[
                            { text: 'Default', value: 0 },
                            { text: 'Medium', value: 1 },
                            { text: 'Small', value: 2 },
                        ]"
                        label="Thumbnail/Video List Grid Size"
                        messages="Change thumbnail/video size on Home/Favorites page"
                    ></v-select>
                    <v-switch
                        v-model="showFavoritesCollab"
                        label="Show Favorites Collab Streams"
                        messages="Show streams that mention one of your favorited channels, most likely a collab stream"
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
import { syncState } from "@/utils/functions";

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
        ...syncState("settings", [
            "darkMode",
            "redirectMode",
            // "autoplayVideo",
            "scrollMode",
            "hideThumbnail",
            "defaultOpenFavorites",
            "showFavoritesCollab",
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
    },
    watch: {
        showFavoritesCollab() {
            this.$store.commit("favorites/setLastLiveUpdate", 0);
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

<style>
.settings-group {
    padding: 16px;
    border: 1px solid #f06292;
    border-radius: 8px;
    margin-bottom: 16px;
}
</style>
