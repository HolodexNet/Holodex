<template>
    <v-container class="channel">
        <v-img :src="channel.banner_image" />
        <div class="text-h6">Videos</div>
        <VideoCardList :videos="videos" dense />
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList";
import api from "@/utils/backend-api";

export default {
    name: "Channel",
    data() {
        return {
            channel_id: null,
            videos: [],
            channel: {},
        };
    },
    created() {
        this.channel_id = this.$route.params.id;
        api.videos(this.channel_id).then(
            res => (this.videos = res.data.videos)
        );
        api.channel(this.channel_id).then(
            res => (this.channel = res.data)
        );
    },
    props: {},
    components: {
        VideoCardList,
    },
};
</script>

<style lang="scss">

</style>
