<template>
    <div>
        <VideoCardList
            :videos="videos"
            dense
            :includeChannel="hasChannelInfo"
        />
        <v-pagination
            v-if="videos.length > 0"
            v-model="currentPage"
            class="my-4"
            :length="Math.ceil(totalVideos / videoPerPage)"
        ></v-pagination>
    </div>
</template>

<script>
import VideoCardList from "@/components/VideoCardList.vue";
import api from "@/utils/backend-api.js";

export default {
    name: "ChannelVideos",
    components: {
        VideoCardList,
    },
    data() {
        return {
            channel_id: null,
            videos: [],
            totalVideos: 1,
            videoPerPage: 30,
        };
    },
    created() {
        this.channel_id = this.$route.params.id;
        this.loadTabContent();
    },
    computed: {
        hasChannelInfo() {
            return (
                this.$route.name === "clips" || this.$route.name === "mentions"
            );
        },
        currentPage: {
            get() {
                return Number(this.$route.query.page) || 1;
            },
            set(val) {
                this.$router.push({
                    query: { ...this.$route.query, page: val },
                });
            },
        },
    },
    watch: {
        $route() {
            // this.currentPage = 1;
            this.totalVideos = 1;
            this.loadTabContent();
        },
        currentPage() {
            console.log(this.currentPage);
        },
    },
    methods: {
        loadTabContent() {
            this.videos = [];
            let api_req = null;
            const query = {
                channel_id: Number(this.channel_id),
                limit: this.videoPerPage,
                offset: (this.currentPage - 1) * this.videoPerPage,
                ...(this.hasChannelInfo && { include_channel: 1 }),
            };
            switch (this.$route.name) {
                case "clips":
                    api_req = api.clips(query);
                    break;
                case "mentions":
                    api_req = api.mentions(query);
                    break;
                default:
                    api_req = api.videos(query);
                    break;
            }
            api_req.then(res => {
                this.videos = res.data.videos;
                this.totalVideos = res.data.total;
            });
        },
    },
};
</script>

<style></style>
