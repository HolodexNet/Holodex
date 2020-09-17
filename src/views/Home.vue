<template>
    <v-container class="home" fluid style="height: 100%">
        <v-row v-if="loading" style="height: 100%">
            <v-progress-circular
                indeterminate
                size="32"
                class="ma-auto"
            ></v-progress-circular>
        </v-row>
        <v-row v-show="!loading && live.length > 0">
            <v-col class="px-lg-10">
                <v-row class="d-flex justify-space-between pa-1">
                    <div class="text-h6">Live/Upcoming</div>
                    <v-btn-toggle v-model="liveFilter" mandatory dense>
                        <v-btn value="favorites" :disabled="!favorites.length">
                            Favorites
                        </v-btn>
                        <v-btn value="all">
                            All
                        </v-btn>
                    </v-btn-toggle>
                </v-row>
                <VideoCardList
                    :videos="filteredLiveVideos"
                    includeChannel
                    withAvatar
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
                <v-row v-if="!filteredLiveVideos.length">
                    <v-col class="ma-auto text-center pa-8">
                        No one is streaming soon on your favorites. Please check
                        out the other vtubers!
                    </v-col>
                </v-row>
                <v-divider class="py-2" />
                <v-row class="d-flex justify-space-between pa-1">
                    <div class="text-h6">Recent Videos</div>
                    <v-btn-toggle v-model="recentVideoFilter" mandatory dense>
                        <v-btn value="both">
                            Both
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
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList.vue";
import api from "@/utils/backend-api";
import dayjs from "dayjs";

export default {
    name: "Home",
    components: {
        VideoCardList,
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
        };
    },
    mounted() {
        api.live().then(res => {
            // get currently live and upcoming lives within the next 2 weeks
            this.live = res.data.live.concat(res.data.upcoming).filter(live => {
                return (
                    // this.favorites.includes(live.channel.id) &&
                    dayjs(live.live_schedule).isBefore(dayjs().add(3, "w"))
                );
            });
            this.loading = false;
        });
    },
    watch: {
        filter() {
            this.videos = [];
            this.currentOffset = 0;
            this.infiniteId++;
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
            console.log(this.filter);
            api.videos({
                limit: this.pageLength,
                offset: this.currentOffset,
                include_channel: 1,
                status: "tagged",
                ...(this.filter !== "both" && { type: this.filter }),
            })
                .then(res => {
                    if (res.data.videos.length) {
                        this.videos = this.videos.concat(res.data.videos);
                        this.currentOffset += this.pageLength;
                        // console.log(this.videos);
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

<style scoped>
.channel-card-grid::after {
    content: "";
    flex: auto;
}
</style>
