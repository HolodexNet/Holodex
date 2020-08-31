<template>
    <v-container>
        <v-row class="align-start">
            <v-col cols="12" sm="12" lg="9" md="12">
                <div class="embedded-video">
                    <iframe
                        :src="`https://www.youtube.com/embed/${video.yt_video_key}?autoplay=1`"
                    ></iframe>
                </div>
                <v-spacer />
            </v-col>
            <v-col cols="12" sm="12" lg="3" md="12">
                <div class="text-h6">Clips</div>
                <v-divider />
                <div v-if="video_clips.length == 0" class="pa-3">
                    No clips yet, check back later!
                </div>
                <VideoCardList
                    :videos="video_clips"
                    includeChannel
                    :cols="{
                        lg: 12,
                        md: 4,
                        cols: 12,
                        sm: 6,
                    }"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import api from "@/utils/backend-api";
import VideoCardList from "@/components/VideoCardList";
export default {
    name: "Watch",
    components: {
        VideoCardList,
    },
    data() {
        return {
            video: [],
            video_clips: [],
        };
    },
    created() {
        this.loadData(this.$route.params.id);
    },
    methods: {
        loadData(id) {
            api.video(id).then((res) => {
                this.video = res.data;
                this.video_clips = res.data.video_mentions;
                console.log(this.video_clips.length);
            });
        },
    },
    watch: {
        "$route.params.id"(val) {
            this.loadData(val);
        },
    },
};
</script>

<style>
.embedded-video {
    position: relative;
    padding-bottom: 56.25%;
}
.embedded-video > iframe{
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
