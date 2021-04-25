<template>
    <v-container fluid>
        <template v-if="isLoggedIn && favorites.length > 0">
            <LoadingOverlay :isLoading="false" :showError="hasError" />
            <div v-show="!hasError">
                <div class="d-flex justify-space-between px-0 pb-3 pt-1 px-sm-3">
                    <div class="text-h6">
                        {{ $t("views.home.liveOrUpcomingHeading") }}
                    </div>
                    <v-btn icon @click="currentGridSize = (currentGridSize + 1) % 3" v-if="!$store.state.isMobile">
                        <v-icon>{{ $store.getters.gridIcon }}</v-icon>
                    </v-btn>
                </div>
                <SkeletonCardList v-if="isLoading" :cols="colSizes" :limitRows="2" :dense="currentGridSize > 0" />
                <VideoCardList
                    :videos="sortedLive"
                    includeChannel
                    includeAvatar
                    :limitRows="2"
                    :cols="colSizes"
                    :dense="currentGridSize > 0"
                    v-else
                >
                </VideoCardList>
                <v-divider class="my-3" />
                <div class="d-flex justify-space-between px-0 pb-3 pt-1 px-sm-3">
                    <div class="text-h6">
                        {{ $t("views.home.recentVideosHeading") }}
                    </div>
                    <v-btn-toggle v-model="recentVideoFilter" mandatory dense>
                        <v-btn value="all">
                            {{ $t("views.home.recentVideoToggles.all") }}
                        </v-btn>
                        <v-btn value="stream">
                            {{ $t("views.home.recentVideoToggles.official") }}
                        </v-btn>
                        <v-btn value="clip">
                            {{ $t("views.home.recentVideoToggles.subber") }}
                        </v-btn>
                    </v-btn-toggle>
                </div>

                <generic-list-loader
                    :infiniteLoad="scrollMode"
                    :paginate="!scrollMode"
                    :perPage="this.pageLength"
                    :loadFn="getLoadFn()"
                    v-slot="{ data, isLoading }"
                    :key="'vl-home-' + recentVideoFilter + identifier"
                >
                    <VideoCardList
                        :videos="data"
                        includeChannel
                        :cols="colSizes"
                        :dense="currentGridSize > 0"
                    ></VideoCardList>
                    <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                </generic-list-loader>
            </div>
        </template>
        <template v-else>
            <v-row style="min-height: 50%">
                <v-col class="d-flex align-center justify-center flex-column">
                    <v-icon color="primary" large>{{ icons.mdiHeart }}</v-icon>
                    <div class="text-body-1 text-center" v-html="$t('views.favorites.promptForAction')"></div>
                    <v-btn :to="isLoggedIn ? '/channel' : '/login'">
                        {{ isLoggedIn ? $t("views.favorites.manageFavorites") : $t("component.mainNav.login") }}
                    </v-btn>
                </v-col>
            </v-row>
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
                xs: 1,
                sm: 2,
                md: 3 + this.currentGridSize,
                lg: 4 + this.currentGridSize,
                xl: 5 + this.currentGridSize,
            };
        },
        sortedLive() {
            return this.live.sort((a, b) => {
                const dateA = new Date(a.available_at).getTime();
                const dateB = new Date(b.available_at).getTime();
                return dateA > dateB ? 1 : -1;
            });
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
                        ...(this.recentVideoFilter !== "all" && { type: this.recentVideoFilter }),
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
