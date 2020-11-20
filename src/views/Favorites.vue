<template>
    <v-container fluid style="height: 100%">
        <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
        <template v-if="favorites.length > 0">
            <v-row v-show="!isLoading && !hasError">
                <v-col class="px-lg-10">
                    <v-row class="d-flex justify-space-between pa-1">
                        <div class="text-h6">Live/Upcoming</div>
                    </v-row>
                    <VideoCardList
                        :videos="filteredLiveVideos"
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
                    <v-row v-if="!filteredLiveVideos.length && !hasError">
                        <v-col class="ma-auto text-center pa-8">
                            No one is streaming soon in your favorites. Please
                            check out the other vtubers!
                        </v-col>
                    </v-row>
                    <v-divider class="my-5" />
                    <v-row class="d-flex justify-space-between pa-1">
                        <div class="text-h6">Recent Videos</div>
                        <v-btn-toggle
                            v-model="favoritesVideoFilter"
                            mandatory
                            dense
                        >
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
                    <FavoritesVideoList :videoLists="filteredByChannelType" />
                    <div class="text-center" @click="loadNext">
                        <v-btn class="ma-auto" outlined color="primary">
                            Load Next
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </template>
        <template v-else>
            <v-row style="min-height: 50%">
                <v-col class="d-flex align-center justify-center flex-column">
                    <v-icon color="primary" large>{{ mdiHeart }}</v-icon>
                    <div class="text-body-1 text-center">
                        Create a list of favorite vtubers to their latest clips
                        and lives on this page.
                    </div>
                    <v-btn to="/channel">
                        Manage Favorites
                    </v-btn>
                </v-col>
            </v-row>
        </template>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList.vue";
import FavoritesVideoList from "@/components/FavoritesVideoList.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import api from "@/utils/backend-api";
import dayjs from "dayjs";
import { mdiHeart } from "@mdi/js";
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

export default {
    name: "Favorites",
    metaInfo: {
        title: "Favorites",
    },
    components: {
        VideoCardList,
        FavoritesVideoList,
        LoadingOverlay,
    },
    data() {
        return {
            live: [],
            // TODO: smaller pagelength with mobile/diff breakpoints
            filteredVideoLists: [],
            daysBefore: 0,
            hasError: false,
            isLoading: true,
            mdiHeart,
            shouldRenderNext: false,
        };
    },
    mounted() {
        Promise.all([this.loadLive(), this.loadFavorites()]).finally(() => {
            this.isLoading = false;
        });
    },
    computed: {
        favorites() {
            return this.$store.state.favorites;
        },
        filteredLiveVideos() {
            return this.live.filter(
                live =>
                    this.favorites.includes(live.channel.id) ||
                    live.channel_mentions.filter(channel =>
                        this.favorites.includes(channel.id)
                    ).length > 0
            );
        },
        filteredByChannelType() {
            if (this.favoritesVideoFilter == "all")
                return this.filteredVideoLists;
            return this.filteredVideoLists.map(videoList => {
                return {
                    title: videoList.title,
                    videos: videoList.videos.filter(video =>
                        this.favoritesVideoFilter === "vtuber"
                            ? video.channel.id < 1000
                            : video.channel.id > 1000
                    ),
                };
            });
        },
        favoritesVideoFilter: {
            get() {
                return this.$store.state.favoritesVideoFilter;
            },
            set(val) {
                return this.$store.commit("setFavoritesVideoFilter", val);
            },
        },
    },
    methods: {
        loadNext() {
            this.daysBefore++;
            this.loadFavorites();
        },
        loadLive() {
            return api
                .live()
                .then(live => {
                    this.live = live;
                })
                .catch(e => {
                    console.log(e);
                    this.hasError = true;
                });
        },
        loadFavorites(clear = false) {
            const targetDate = dayjs().subtract(this.daysBefore, "d");
            if (clear) this.filteredVideoLists = [];
            return api
                .videos({
                    limit: 100,
                    include_channel: 1,
                    status: "past",
                    tag_status: "tagged",
                    start_date: targetDate
                        .startOf("day")
                        .utc()
                        .toISOString(),
                    end_date: targetDate
                        .endOf("day")
                        .utc()
                        .toISOString(),
                    sort: "published_at",
                    order: "desc",
                })
                .then(res => {
                    if (res.data.videos.length) {
                        this.filteredVideoLists.push({
                            title: this.formatDayTitle(this.daysBefore),
                            videos: this.filterByFavorites(res.data.videos),
                        });
                        // TODO: If there is more than 100 videos in a day, then we need to query the api again.
                        // if (res.data.videos.length > 100)
                        //     console.log("too many videos");
                    }
                    //if less than 50 videos uploaded today, then grab yesterday's
                    if (res.data.videos.length < 50 && this.daysBefore < 3)
                        this.loadNext();
                });
        },
        // check if video is posted by favorited channel or mentioned in the video
        filterByFavorites(videos) {
            return videos.filter(video => {
                return (
                    this.favorites.includes(video.channel.id) ||
                    video.channel_mentions.filter(channel =>
                        this.favorites.includes(channel.id)
                    ).length > 0
                );
            });
        },
        formatDayTitle(daysAgo) {
            if (daysAgo < 2) {
                return daysAgo == 0 ? "Today" : "Yesterday";
            }
            return `${daysAgo} days ago`;
        },
    },
};
</script>
