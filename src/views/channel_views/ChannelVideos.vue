<template>
    <div>
        <VideoCardList
            :videos="videos"
            dense
            :includeChannel="hasChannelInfo"
        />
        <v-pagination
            v-model="currentPage"
            class="my-4"
            :length="15"
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
            currentPage: 1,
        };
    },
    created() {
        // console.log(this.$route);
        this.channel_id = this.$route.params.id;
        this.loadTabContent();
    },
    computed: {
        hasChannelInfo() {
            return (
                this.$route.name === "clips" || this.$route.name === "mentions"
            );
        },
    },
    watch: {
        $route() {
            this.loadTabContent();
        },
    },
    methods: {
        loadTabContent() {
            this.videos = [];
            switch (this.$route.name) {
                case "clips":
                    api.clips(this.channel_id).then(
                        res => (this.videos = res.data.videos)
                    );
                    break;
                case "mentions":
                    api.mentions(this.channel_id).then(
                        res => (this.videos = res.data.videos)
                    );
                    break;
                case 3:
                    break;
                default:
                    api.videos(this.channel_id).then(
                        res => (this.videos = res.data.videos)
                    );
                    break;
            }
        },
    },
};
</script>

<style></style>
