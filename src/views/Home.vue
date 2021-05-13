<template>
    <v-container fluid>
        <v-tabs v-model="tab">
            <v-tab>{{ $t("views.home.liveOrUpcomingHeading") }}</v-tab>
            <!-- <v-tab>
                {{ $t("views.home.recentVideoToggles.all") }}
            </v-tab> -->
            <v-tab>
                {{ $t("views.home.recentVideoToggles.official") }}
            </v-tab>
            <v-tab>
                {{ $t("views.home.recentVideoToggles.subber") }}
            </v-tab>
        </v-tabs>
        <LoadingOverlay :isLoading="false" :showError="hasError" />
        <div class="d-flex">
            <v-spacer />
            <v-btn icon @click="currentGridSize = (currentGridSize + 1) % ($vuetify.breakpoint.xs ? 2 : 3)">
                <v-icon>{{ $store.getters.gridIcon }}</v-icon>
            </v-btn>
        </div>
        <div v-show="!hasError">
            <!-- <div class="d-flex justify-space-between px-0 pb-3 pt-1 px-sm-3">
                <div class="text-h6">
                    {{ $t("views.home.liveOrUpcomingHeading") }}
                </div>
                
            </div> -->
            <template v-if="tab === Tabs.LIVE_UPCOMING">
                <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                <template v-else>
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
            </template>

            <!-- <v-divider class="my-3" />
            <div class="d-flex justify-space-between px-0 pb-3 pt-1 px-sm-3">
                <div class="text-h6">
                    {{ $t("views.home.recentVideosHeading") }}
                </div>
                <v-btn-toggle v-model="recentVideoFilter" mandatory dense color="secondary">
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
            </div> -->
            <template v-else>
                <generic-list-loader
                    :infiniteLoad="scrollMode"
                    :paginate="!scrollMode"
                    :perPage="this.pageLength"
                    :loadFn="getLoadFn()"
                    v-slot="{ data, isLoading }"
                    :key="'vl-home-' + tab + identifier"
                >
                    <VideoCardList :videos="data" includeChannel :cols="colSizes" :dense="currentGridSize > 0" />
                    <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                </generic-list-loader>
            </template>
        </div>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { mapState } from "vuex";
import reloadable from "@/mixins/reloadable";
import backendApi from "@/utils/backend-api";
import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";

export default {
    name: "Home",
    metaInfo() {
        return {
            get title() {
                return "Holodex";
            },
        };
    },
    mixins: [reloadable],
    components: {
        VideoCardList,
        LoadingOverlay,
        GenericListLoader,
        SkeletonCardList,
    },
    data() {
        return {
            identifier: Date.now(),
            pageLength: 30,
            tab: 0,
            Tabs: Object.freeze({
                LIVE_UPCOMING: 0,
                // ALL: 1,
                ARCHIVE: 1,
                CLIPS: 2,
            }),
        };
    },
    mounted() {
        this.init();
    },
    watch: {
        // eslint-disable-next-line func-names
        "$store.state.currentOrg": function () {
            this.init();
        },
    },
    computed: {
        ...mapState("home", ["live", "isLoading", "hasError"]),
        recentVideoFilter: {
            get() {
                return this.$store.state.home.recentVideoFilter;
            },
            set(value) {
                this.$store.commit("home/setRecentVideoFilter", value);
                this.identifier = Date.now();
                this.$router.push({
                    query: {
                        ...this.$route.query,
                        page: undefined,
                    },
                });
            },
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
        init() {
            this.$store.commit("home/resetState");
            this.$store.dispatch("home/fetchLive");
            this.identifier = Date.now();
        },
        // called from mixin, simulate reload
        reload() {
            this.init();
        },
        getLoadFn() {
            return async (offset, limit) => {
                const res = await backendApi.videos({
                    status: "past",
                    ...{ type: this.tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
                    include: "clips",
                    org: this.$store.state.currentOrg,
                    lang: this.$store.state.settings.clipLangs.join(","),
                    paginated: !this.scrollMode,
                    limit,
                    offset,
                });
                return res.data;
            };
        },
    },
};
</script>
