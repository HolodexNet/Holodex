<template>
    <v-container class="home pt-0" fluid>
        <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
        <v-row v-show="!isLoading && !hasError">
            <v-col>
                <v-row class="d-flex justify-space-between px-3 pb-3 pt-1">
                    <div class="text-h6">
                        {{ $t("views.home.liveOrUpcomingHeading") }}
                    </div>
                </v-row>
                <VideoCardList
                    :videos="live"
                    includeChannel
                    includeAvatar
                    :cols="{
                        xs: 1,
                        sm: 3,
                        md: 4,
                        lg: 5,
                        xl: 6,
                    }"
                    :limitRows="2"
                >
                </VideoCardList>
                <v-divider class="my-3" />
                <v-row class="d-flex justify-space-between px-3 pt-1 pb-3">
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
                    style=""
                    :cols="{
                        xs: 1,
                        sm: 3,
                        md: 4,
                        lg: 6,
                        xl: 7,
                    }"
                ></VideoCardList>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";
import LoadingOverlay from "@/components/common/LoadingOverlay";
// import api from "@/utils/backend-api";
import { mapGetters } from "vuex";

export default {
    name: "Home",
    metaInfo: {
        title: "Home",
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
        ...mapGetters("home", ["live", "videos", "isLoading", "hasError", "currentOffset"]),
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
                        $state?.loaded();
                    } else {
                        $state?.completed();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    $state?.error();
                });
        },
    },
};
</script>
