<template>
    <v-container fluid>
        <portal to="mainNavExt" :disabled="!$vuetify.breakpoint.xs">
            <v-tabs v-model="tab" :centered="$vuetify.breakpoint.xs">
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
        </portal>

        <LoadingOverlay :isLoading="false" :showError="hasError" />
        <div class="d-flex">
            <v-spacer />
            <v-btn icon @click="currentGridSize = (currentGridSize + 1) % ($vuetify.breakpoint.xs ? 2 : 3)">
                <v-icon>{{ $store.getters.gridIcon }}</v-icon>
            </v-btn>
        </div>
        <div v-show="!hasError">
            <v-tabs-items v-model="tab" style="background: none">
                <v-tab-item>
                    <!-- <template v-if="n === Tabs.LIVE_UPCOMING"> -->
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
                </v-tab-item>
                <!-- </template> -->
                <!-- <template v-else> -->

                <v-tab-item>
                    <generic-list-loader
                        :infiniteLoad="scrollMode"
                        :paginate="!scrollMode"
                        :perPage="pageLength"
                        :loadFn="getLoadFn(1)"
                        v-slot="{ data, isLoading }"
                        :key="identifier + 1"
                    >
                        <VideoCardList :videos="data" includeChannel :cols="colSizes" :dense="currentGridSize > 0" />
                        <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                    </generic-list-loader>
                </v-tab-item>
                <v-tab-item>
                    <generic-list-loader
                        :infiniteLoad="scrollMode"
                        :paginate="!scrollMode"
                        :perPage="pageLength"
                        :loadFn="getLoadFn(2)"
                        v-slot="{ data, isLoading }"
                        :key="identifier + 2"
                    >
                        <VideoCardList :videos="data" includeChannel :cols="colSizes" :dense="currentGridSize > 0" />
                        <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                    </generic-list-loader>
                </v-tab-item>
            </v-tabs-items>
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
            pageLength: 24,
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
        swipe(right) {
            console.log(right ? "Right" : "LEft");
            if (right) {
                this.tab = Math.max(this.tab - 1, 0);
            } else {
                this.tab = Math.min(this.tab + 1, 2);
            }
        },
        init() {
            this.$store.commit("home/resetState");
            this.$store.dispatch("home/fetchLive");
            this.identifier = Date.now();
        },
        // called from mixin, simulate reload
        reload() {
            this.init();
        },
        getLoadFn(tab) {
            return async (offset, limit) => {
                const res = await backendApi.videos({
                    status: "past",
                    ...{ type: tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
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
<style>
.v-slide-group__prev--disabled {
    display: none !important;
}
</style>
