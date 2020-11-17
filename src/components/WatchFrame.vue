<template>
    <div class="embedded-video" v-if="!redirectMode && video_src">
        <iframe :src="video_src" frameborder="0" allowfullscreen></iframe>
    </div>
    <div class="thumbnail" v-else>
        <v-img :aspect-ratio="16 / 9" :src="thumbnail_src" />
        <div class="thumbnail-overlay d-flex">
            <div class="text-h4 ma-auto">
                <a :href="`https://youtu.be/${video.yt_video_key}`">
                    Open on Youtube
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { video_thumbnails } from "@/utils/functions";

export default {
    name: "WatchFrame",
    props: {
        video: {
            required: true,
        },
    },
    computed: {
        video_src() {
            return `https://www.youtube.com/embed/${this.video.yt_video_key}?autoplay=1&rel=0&widget_referrer=${window.location.hostname}`;
        },
        thumbnail_src() {
            return video_thumbnails(this.video.yt_video_key)["medium"];
        },
        redirectMode() {
            return this.$store.state.redirectMode;
        },
    },
};
</script>

<style></style>
