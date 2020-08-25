<template>
    <v-container class="channel">
        <div class="text-h6">Videos</div>
        <v-row v-if="videos.length != 0" dense>
            <v-col
                v-for="video in videos"
                :key="video.id"
                class="video-col lg5-custom"
                cols="12"
                sm="4"
                md="3"
            >
                <VideoCard :video="video" fluid />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import VideoCard from "@/components/VideoCard";
import api from "@/utils/backend-api";

export default {
    name: "Channel",
    data() {
        return {
            channel_id: null,
            videos: [],
        };
    },
    created() {
        this.channel_id = this.$route.params.id;
        api.videos(this.channel_id).then(
            res => (this.videos = res.data.videos)
        );
    },
    props: {},
    components: {
        VideoCard,
    },
};
</script>

<style lang="scss">
.video-col {
    display: flex;
    justify-content: center;
}

@media (min-width: 1264px) and (max-width: 1903px) {
    .lg5-custom {
        width: 20%;
        max-width: 20%;
        flex-basis: 20%;
    }
}
</style>
