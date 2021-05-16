<template>
    <v-container
        fluid
        v-touch="{
            right: () => (tab = Math.max(tab - 1, 0)),
            left: () => (tab = Math.min(tab + 1, 2)),
        }"
        style="min-height: 100%"
        class="d-flex flex-column"
    >
        <template v-if="isLoggedIn && favorites.length > 0">
            <!-- Teleport tabs to nav extension slot -->
            <portal to="mainNavExt" :disabled="!$vuetify.breakpoint.xs || !isActive">
                <v-tabs
                    v-model="tab"
                    :centered="$vuetify.breakpoint.xs"
                    :class="$store.state.settings.darkMode ? 'secondary darken-1' : 'primary lighten-1'"
                    :active-class="
                        $store.state.settings.darkMode
                            ? 'primary--text text--lighten-3'
                            : 'primary--text text--darken-2'
                    "
                >
                    <v-tab>
                        {{ $t("views.home.liveOrUpcomingHeading") }}
                        <v-chip small class="ml-1 px-2" color="primary">{{ lives.length + upcoming.length }}</v-chip>
                    </v-tab>
                    <v-tab>
                        {{ $t("views.home.recentVideoToggles.official") }}
                    </v-tab>
                    <v-tab>
                        {{ $t("views.home.recentVideoToggles.subber") }}
                    </v-tab>
                </v-tabs>
            </portal>
            <LoadingOverlay :isLoading="false" :showError="hasError" />
            <template v-show="!hasError">
                <template v-if="tab === Tabs.LIVE_UPCOMING">
                    <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                    <template v-else-if="lives.length || upcoming.length">
                        <VideoCardList
                            :videos="lives"
                            includeChannel
                            :includeAvatar="shouldIncludeAvatar"
                            :cols="colSizes"
                            :dense="currentGridSize > 0"
                        >
                        </VideoCardList>
                        <v-divider class="my-3 secondary" v-if="lives.length" />
                        <VideoCardList
                            :videos="upcoming"
                            includeChannel
                            :includeAvatar="shouldIncludeAvatar"
                            :cols="colSizes"
                            :dense="currentGridSize > 0"
                        >
                        </VideoCardList>
                    </template>
                    <template v-else>
                        <div class="ma-auto pa-5 text-center">
                            {{ $t("views.home.noStreams") }}
                        </div>
                    </template>
                </template>
                <template v-else>
                    <keep-alive>
                        <generic-list-loader
                            :infiniteLoad="scrollMode"
                            :paginate="!scrollMode"
                            :perPage="this.pageLength"
                            :loadFn="getLoadFn()"
                            v-slot="{ data, isLoading }"
                            :key="'vl-home-' + tab + identifier"
                        >
                            <!-- only keep VideoCardList rendered if scrollMode OR it's not loading. -->
                            <VideoCardList
                                v-show="scrollMode || !isLoading"
                                :videos="data"
                                includeChannel
                                :cols="colSizes"
                                :dense="currentGridSize > 0"
                            />
                            <!-- only show SkeletonCardList if it's loading -->
                            <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                        </generic-list-loader>
                    </keep-alive>
                </template>
            </template>
        </template>
        <template v-else>
            <div class="ma-auto d-flex flex-column align-center">
                <v-icon color="primary" large>{{ icons.mdiHeart }}</v-icon>
                <div class="text-body-1 text-center" v-html="$t('views.favorites.promptForAction')"></div>
                <v-btn :to="isLoggedIn ? '/channel' : '/login'">
                    {{ isLoggedIn ? $t("views.favorites.manageFavorites") : $t("component.mainNav.login") }}
                </v-btn>
            </div>
        </template>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
// eslint-disable-next-line no-unused-vars
import * as icons from "@/utils/icons";
import { mapState } from "vuex";
import reloadable from "@/mixins/reloadable";
import isActive from "@/mixins/isActive";
import backendApi from "@/utils/backend-api";
import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";

export default {
    name: "Favorites",
    mixins: [reloadable, isActive],
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.favorites")} - Holodex`;
            },
        };
    },
    components: {
        VideoCardList,
        LoadingOverlay,
        GenericListLoader,
        SkeletonCardList,
    },
    data() {
        return {
            icons,
            identifier: +new Date(),
            pageLength: 24,
            tab: 0,
            Tabs: Object.freeze({
                LIVE_UPCOMING: 0,
                ARCHIVE: 1,
                CLIPS: 2,
            }),
        };
    },
    mounted() {
        this.init(true);
    },
    watch: {
        favorites: {
            deep: true,
            handler(nw, old) {
                if (isActive && nw.find((c, index) => old[index] && c.id !== old[index].id)) {
                    this.init(false);
                }
            },
        },
    },
    computed: {
        ...mapState("favorites", ["favorites", "live", "isLoading", "hasError", "currentOffset"]),
        recentVideoFilter: {
            get() {
                return this.$store.state.favorites.recentVideoFilter;
            },
            set(value) {
                this.$store.commit("favorites/setRecentVideoFilter", value);
                this.identifier = Date.now();
                this.$router.push({
                    query: {
                        ...this.$route.query,
                        page: undefined,
                    },
                });
            },
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
        scrollMode() {
            return this.$store.state.settings.scrollMode;
        },
        currentGridSize: {
            get() {
                return this.$store.state.currentGridSize;
            },
            set(val) {
                this.$store.commit("setCurrentGridSize", val);
            },
        },
        colSizes() {
            return {
                xs: 1 + this.currentGridSize,
                sm: 2 + this.currentGridSize,
                md: 3 + this.currentGridSize,
                lg: 4 + this.currentGridSize,
                xl: 5 + this.currentGridSize,
            };
        },
        shouldIncludeAvatar() {
            if (this.$vuetify.breakpoint.md && this.currentGridSize > 1) return false;
            if (this.$vuetify.breakpoint.sm && this.currentGridSize > 0) return false;
            if (this.$vuetify.breakpoint.xs && this.currentGridSize > 0) return false;
            return true;
        },
        lives() {
            return this.live.filter((v) => v.status === "live");
        },
        upcoming() {
            return this.live.filter((v) => v.status === "upcoming");
        },
    },
    methods: {
        init(updateFavorites) {
            if (this.favorites.length > 0 && this.isLoggedIn) {
                if (updateFavorites) this.$store.dispatch("favorites/fetchFavorites");
                this.$store.dispatch("favorites/fetchLive", { force: true, minutes: 2 });
                this.identifier = Date.now();
            }
        },
        reload() {
            this.init();
        },
        getLoadFn() {
            return async (offset, limit) => {
                const res = await backendApi
                    .favoritesVideos(this.$store.state.userdata.jwt, {
                        status: "past",
                        ...{ type: this.tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
                        include: "clips",
                        lang: this.$store.state.settings.clipLangs.join(","),
                        paginated: !this.scrollMode,
                        limit,
                        offset,
                    })
                    .catch((err) => {
                        console.error(err);
                        this.$store.dispatch("loginVerify"); // check if the user is actually logged in.
                        throw err;
                    });
                return res.data;
            };
        },
    },
};
</script>
