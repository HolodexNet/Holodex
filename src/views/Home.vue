<template>
    <v-container class="home pt-0" fluid>
        <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
        <v-row v-show="!isLoading && !hasError">
            <v-col>
                <v-row class="d-flex justify-space-between px-3 pb-3 pt-1">
                    <div class="text-h6">Live / Upcoming</div>
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
                    <div class="text-h6">Recent Videos</div>
                    <v-btn-toggle v-model="recentVideoFilter" mandatory dense>
                        <v-btn value="all">
                            All
                        </v-btn>
                        <v-btn value="vtuber">
                            Official
                        </v-btn>
                        <v-btn value="subber">
                            Clips
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
// import dayjs from "dayjs";
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
            live: [],
            videos: [],
            currentOffset: 0,
            infiniteId: +new Date(),
            isLoading: true,
            hasError: false,
        };
    },
    created() {
        this.loadLive().finally(() => {
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
            return this.$vuetify.breakpoint === "md" ? 12 : 24;
        },
    },
    methods: {
        resetVideos() {
            this.videos = [];
            this.currentOffset = 0;
            this.infiniteId++;
            this.daysBefore = 0;
        },
        loadLive() {
            return api
                .live()
                .then(res => {
                    this.live = res;
                })
                .catch(e => {
                    console.log(e);
                    this.hasError = true;
                });
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
                .then(res => {
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
