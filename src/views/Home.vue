<template>
    <v-container class="home" fluid style="height: 100%">
        <v-row v-if="loading">
            <v-progress-circular
                indeterminate
                size="32"
                class="ma-auto"
            ></v-progress-circular>
        </v-row>
        <v-row v-show="!loading && live.length > 0">
            <v-col class="px-lg-10">
                <div class="text-h6">Live</div>
                <v-divider />
                <VideoCardList
                    :videos="live"
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
                    <!-- :style="!live.length ? { 'min-height': '530px' } : ''" -->
                </VideoCardList>
                <v-row
                    class="d-flex justify-space-between pa-1"
                    v-show="live.length"
                >
                    <div class="text-h6">Recent Videos</div>
                    <v-btn-toggle v-model="filter" mandatory dense>
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
                <v-divider />
                <VideoCardList
                    v-if="live.length"
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
            // get currently live and upcoming lives within the next 2 week
            this.live = res.data.live
                .concat(res.data.upcoming)
                .filter(live =>
                    dayjs(live.live_schedule).isBefore(dayjs().add(2, "w"))
                )
                .splice(0, 16);
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
        filter: {
            get() {
                return this.$store.state.recentVideoFilter;
            },
            set(value) {
                this.$store.commit("updateRecentVideoFilter", value);
            },
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
                        console.log(this.videos);
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
