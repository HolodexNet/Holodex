<template>
    <v-container fluid>
        <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
        <div v-show="!isLoading && !hasError">
            <div class="d-flex justify-space-between px-0 pb-3 pt-1 px-sm-3">
                <div class="text-h6">
                    {{ $t("views.home.liveOrUpcomingHeading") }}
                </div>
                <v-btn icon @click="currentGridSize = (currentGridSize + 1) % 3" v-if="!$store.state.isMobile">
                    <v-icon>{{ $store.getters.gridIcon }}</v-icon>
                </v-btn>
            </div>
            <VideoCardList
                :videos="live"
                includeChannel
                includeAvatar
                :limitRows="2"
                :cols="colSizes"
                :dense="currentGridSize > 0"
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
            <VideoCardList
                :videos="videos"
                includeChannel
                :cols="colSizes"
                :dense="currentGridSize > 0"
                :lazy="scrollMode"
                :identifier="identifier"
                :paginateLoad="!scrollMode"
                :infiniteLoad="scrollMode"
                @load="loadNext"
                pageLess
            ></VideoCardList>
        </div>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { mapState } from "vuex";
import reloadable from "@/mixins/reloadable";

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
    },
    data() {
        return {
            identifier: +new Date(),
            pageLength: 24,
        };
    },
    mounted() {
        this.init();
    },
    watch: {
        recentVideoFilter() {
            this.resetVideos();
        },
        // eslint-disable-next-line func-names
        "$store.state.currentOrg": function () {
            this.init();
        },
    },
    computed: {
        ...mapState("home", ["live", "videos", "isLoading", "hasError", "currentOffset"]),
        recentVideoFilter: {
            get() {
                return this.$store.state.home.recentVideoFilter;
            },
            set(value) {
                this.$store.commit("home/setRecentVideoFilter", value);
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
            this.resetVideos();
        },
        resetVideos() {
            this.$store.commit("home/resetVideos");
            this.identifier = +new Date();
        },
        // called from mixin, simulate reload
        reload() {
            this.init();
        },
        loadNext($state) {
            const lastLength = this.videos.length;
            if (!this.scrollMode) this.$store.commit("home/resetVideos");
            this.$store
                .dispatch("home/fetchNextVideos", {
                    limit: this.pageLength,
                    ...(!this.scrollMode && { offset: this.pageLength * ($state.page - 1) }),
                })
                .then(() => {
                    if (
                        (this.scrollMode && this.videos.length === lastLength) ||
                        (!this.scrollMode && this.videos.length !== this.pageLength)
                    ) {
                        $state.completed();
                        return;
                    }
                    $state.loaded();
                })
                .catch((e) => {
                    console.error(e);
                    $state.error();
                });
        },
    },
};
</script>
