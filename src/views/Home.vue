<template>
    <v-container class="home pt-0" fluid>
        <LoadingOverlay :isLoading="isLoading" :showError="liveHasError" />
        <v-row v-show="!isLoading && !liveHasError">
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
                        sm: 2,
                        md: 3,
                        lg: 4,
                        xl: 5,
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
                        <v-btn value="vtuber">
                            {{ $t("views.home.recentVideoToggles.official") }}
                        </v-btn>
                        <v-btn value="subber">
                            {{ $t("views.home.recentVideoToggles.subber") }}
                        </v-btn>
                    </v-btn-toggle>
                </v-row>
                <VideoCardList
                    v-if="!isLoading"
                    :videos="videos"
                    includeChannel
                    infiniteLoad
                    @infinite="loadNext"
                    :infiniteId="infiniteId"
                    :cols="{
                        xs: 1,
                        sm: 3,
                        md: 4,
                        lg: 5,
                        xl: 6,
                    }"
                ></VideoCardList>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import api from "@/utils/backend-api";
import { mapState } from "vuex";

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
            videos: [],
            currentOffset: 0,
            infiniteId: +new Date(),
            isLoading: true,
        };
    },
    created() {
        this.$store.dispatch("loadLive", { forced: true }).finally(() => {
            this.isLoading = false;
        });
    },
    watch: {
        recentVideoFilter() {
            this.resetVideos();
        },
    },
    computed: {
        recentVideoFilter: {
            get() {
                return this.$store.state.recentVideoFilter;
            },
            set(value) {
                this.$store.commit("setRecentVideoFilter", value);
            },
        },
        pageLength() {
            return this.$vuetify.breakpoint.toString() === "md" ? 12 : 24;
        },
        ...mapState(["live", "liveHasError"]),
    },
    methods: {
        resetVideos() {
            this.videos = [];
            this.currentOffset = 0;
            this.infiniteId += 1;
            this.daysBefore = 0;
        },
        loadNext($state) {
            api.videos({
                limit: this.pageLength,
                offset: this.currentOffset,
                include_channel: 1,
                status: "past",
                tag_status: "tagged",
                // only include type param if there is a filter
                ...(this.recentVideoFilter !== "all" && {
                    channel_type: this.recentVideoFilter,
                }),
            })
                .then((res) => {
                    if (res.data.videos.length) {
                        this.videos = this.videos.concat(res.data.videos);
                        this.currentOffset += this.pageLength;
                        $state.loaded();
                    } else {
                        $state.complete();
                    }
                })
                .catch(() => {
                    $state.error();
                });
        },
    },
};
</script>
