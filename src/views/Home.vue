<template>
    <v-container class="home" fluid style="height: 100%">
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
                    <v-btn-toggle v-model="liveFilter" mandatory dense>
                        <v-btn value="all">
                            All
                        </v-btn>
                        <v-btn value="favorites" :disabled="!favorites.length">
                            Favorites
                        </v-btn>
                    </v-btn-toggle>
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
                    <v-col class="ma-auto text-center pa-8" v-if="liveError">
                        Error while retrieving lives...
                    </v-col>
                    <v-col class="ma-auto text-center pa-8" v-else>
                        No one is streaming soon on your favorites. Please check
                        out the other vtubers!
                    </v-col>
                </v-row>
                <v-divider class="my-5" />
                <v-row class="d-flex justify-space-between pa-1">
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
                        <v-btn value="favorites" :disabled="!favorites.length">
                            Fav
                        </v-btn>
                    </v-btn-toggle>
                </v-row>
                <span v-if="recentVideoFilter !== 'favorites'">
                    <VideoCardList
                        v-if="!loading"
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
                </span>
                <span v-else>
                    <FavoritesVideoList :videoLists="filteredVideoLists" />
                </span>
            </v-col>
        </v-row>
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
    name: "Home",
    components: {
        VideoCardList,
        FavoritesVideoList,
    },
    data() {
        return {
            channels: [],
            live: [],
            videos: [],
            currentOffset: 0,
            // TODO: smaller pagelength with mobile/diff breakpoints
            pageLength: 24,
            infiniteId: +new Date(),
            loading: true,
            filteredVideoLists: [],
            daysBefore: 0,
            mdiHeart,
            liveError: false,
        };
    },
    mounted() {
        api.live()
            .then(res => {
                // get currently live and upcoming lives within the next 2 weeks
                this.live = res.data.live
                    .concat(res.data.upcoming)
                    .filter(live => {
                        return dayjs(live.live_schedule).isBefore(
                            dayjs().add(3, "w")
                        );
                    });
                this.loading = false;
            })
            .catch(() => {
                this.loading = false;
                this.liveError = true;
            });
        if (this.recentVideoFilter === "favorites") this.loadFavoritesVideos();
    },
    watch: {
        recentVideoFilter() {
            this.videos = [];
            this.currentOffset = 0;
            this.infiniteId++;
            this.daysBefore = 0;
            this.filteredVideoLists = [];
            if (this.recentVideoFilter === "favorites") {
                this.loadFavoritesVideos();
            }
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
        liveFilter: {
            get() {
                return this.favorites.length
                    ? this.$store.state.liveFilter
                    : "all";
            },
            set(value) {
                this.$store.commit("setLiveFilter", value);
            },
        },
        favorites() {
            return this.$store.state.favorites;
        },
        filteredLiveVideos() {
            return this.liveFilter === "favorites"
                ? this.live.filter(live =>
                      this.favorites.includes(live.channel.id)
                  )
                : this.live;
        },
    },
    methods: {
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
        loadFavoritesVideos() {
            const targetDate = dayjs.utc().subtract(this.daysBefore, "d");
            api.videos({
                limit: 100,
                include_channel: 1,
                status: "past",
                tag_status: "tagged",
                start_date: targetDate.startOf("day").toISOString(),
                end_date: targetDate.endOf("day").toISOString(),
                sort: "published_at",
                order: "desc",
            }).then(res => {
                console.log(res);
                if (res.data.videos.length) {
                    this.filteredVideoLists.push({
                        title: this.formatDayTitle(this.daysBefore),
                        videos: this.filterFavorites(res.data.videos),
                    });

                    // TODO: If there is more than 100 videos in a day, then we need to query the api again.
                    if (res.data.videos.total > 100)
                        console.log("too many videos");
                }
                this.daysBefore++;
                // Only load up to yesterday's video, artifical limit to reduce server and client load
                if (this.daysBefore <= 1) this.loadFavoritesVideos();
            });
        },
        filterFavorites(videos) {
            console.log(videos.length);
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

<style scoped>
.channel-card-grid::after {
    content: "";
    flex: auto;
}
</style>
