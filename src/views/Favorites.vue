<template>
    <v-container class="home" fluid style="height: 100%">
        <template v-if="favorites.length > 0">
            <v-row v-if="loading" style="height: 100%">
                <v-progress-circular
                    indeterminate
                    size="32"
                    class="ma-auto"
                ></v-progress-circular>
            </v-row>
            <v-row v-show="!loading">
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
                    <v-row v-if="!filteredLiveVideos.length || liveError">
                        <ApiErrorMessage v-if="liveError" />
                        <v-col class="ma-auto text-center pa-8" v-else>
                            No one is streaming soon in your favorites. Please
                            check out the other vtubers!
                        </v-col>
                    </v-row>
                    <v-divider class="my-5" />
                    <FavoritesVideoList :videoLists="filteredVideoLists" />
                    <div
                        class="text-center"
                        v-if="daysBefore < 2"
                        @click="loadNext"
                    >
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
import api from "@/utils/backend-api";
import dayjs from "dayjs";
import { mdiHeart } from "@mdi/js";
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

export default {
    name: "Favorites",
    components: {
        VideoCardList,
        FavoritesVideoList,
    },
    data() {
        return {
            live: [],
            // TODO: smaller pagelength with mobile/diff breakpoints
            loading: true,
            filteredVideoLists: [],
            daysBefore: 0,
            liveError: false,
            mdiHeart,
            shouldRenderNext: false,
        };
    },
    mounted() {
        Promise.all([this.loadLive(), this.loadFavorites()]).finally(() => {
            this.loading = false;
        });
    },
    computed: {
        favorites() {
            return this.$store.state.favorites;
        },
        filteredLiveVideos() {
            return this.live.filter(live =>
                this.favorites.includes(live.channel.id)
            );
        },
    },
    methods: {
        loadNext() {
            this.daysBefore++;
            this.loadFavorites();
        },
        loadLive() {
            return api.live().then(res => {
                // get currently live and upcoming lives within the next 2 weeks
                this.live = res.data.live
                    .concat(res.data.upcoming)
                    .filter(live => {
                        return dayjs(live.live_schedule).isBefore(
                            dayjs().add(3, "w")
                        );
                    });
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
                            videos: this.filterFavorites(res.data.videos),
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
        filterFavorites(videos) {
            return videos.filter(video => {
                return (
                    // check if video is posted by favorited channel or mentioned in the video
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
