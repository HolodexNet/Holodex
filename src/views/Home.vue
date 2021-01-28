<template>
    <v-container class="home pt-4" fluid>
        <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
        <template v-if="!isLoading && !hasError">
            <v-row class="d-flex justify-space-between px-3 pb-3 pt-1">
                <div class="text-h6">
                    {{ $t("views.home.liveOrUpcomingHeading") }}
                </div>
                <v-btn icon @click="currentGridSize = (currentGridSize + 1) % 3" v-if="!$store.state.isMobile">
                    <v-icon>{{ $store.getters.gridIcon }}</v-icon>
                </v-btn>
            </v-row>
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
            <v-row class="d-flex justify-space-between px-3 pt-3 pb-3">
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
            </v-row>
            <VideoCardList
                :videos="videos"
                includeChannel
                infiniteLoad
                @infinite="loadNext"
                :infiniteId="infiniteId"
                :cols="colSizes"
                :dense="currentGridSize > 0"
            ></VideoCardList>
        </template>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { mapState } from "vuex";

export default {
    name: "Home",
    metaInfo() {
        return {
            get title() {
                return "Holodex";
            },
        };
    },
    components: {
        VideoCardList,
        LoadingOverlay,
    },
    data() {
        return {
            infiniteId: +new Date(),
        };
    },
    created() {
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
        pageLength() {
            return 24;
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
            this.infiniteId = +new Date();
        },
        resetVideos() {
            this.$store.commit("home/resetVideos");
            this.infiniteId = +new Date();
        },
        loadNext($state) {
            const lastLength = this.videos.length;
            this.$store
                .dispatch("home/fetchNextVideos", {
                    limit: this.pageLength,
                })
                .then(() => {
                    if (this.videos.length !== lastLength) {
                        $state.loaded();
                    } else {
                        $state.completed();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    $state.error();
                });
        },
    },
};
</script>
