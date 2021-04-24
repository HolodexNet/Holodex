<template>
    <v-container fluid>
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
                :videos="live"
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
                <VideoCardList :videos="data" includeChannel :cols="colSizes" :dense="currentGridSize > 0" />
                <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
            </generic-list-loader>
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
                xs: 1,
                sm: 2,
                md: 3 + this.currentGridSize,
                lg: 4 + this.currentGridSize,
                xl: 5 + this.currentGridSize,
            };
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
                    ...(this.recentVideoFilter !== "all" && { type: this.recentVideoFilter }),
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
