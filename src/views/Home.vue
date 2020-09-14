<template>
    <v-container class="home" fluid>
        <v-row>
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
                        md: 4,
                        lg: 4,
                        xl: 6,
                    }"
                    :limit="8"
                >
                </VideoCardList>
                <div class="text-h6">Recent Videos</div>
                <v-divider />
                <VideoCardList
                    :videos="videos"
                    includeChannel
                    infiniteLoad
                    @infinite="loadNext"
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
import moment from "moment";

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
        };
    },
    created() {
        api.live().then(res => {
            // get currently live and upcoming lives within the next 2 week
            this.live = res.data.live
                .concat(res.data.upcoming)
                .filter(live =>
                    moment(live.live_schedule).isBefore(moment().add(2, "w"))
                )
                .splice(0, 16);
        });
    },
    methods: {
        loadNext($state) {
            api.videos({
                limit: this.pageLength,
                offset: this.currentOffset,
                include_channel: 1,
                status: "tagged",
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
