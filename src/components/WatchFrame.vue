<template>
    <!-- <div class="embedded-video" v-if="!redirectMode && video_src"> -->
    <!-- <iframe :src="video_src" frameborder="0" allowfullscreen></iframe> -->
    <div v-if="!redirectMode && video">
        <youtube
            class="embedded-video"
            :video-id="video.yt_video_key"
            @ready="ready"
            @playing="playing"
            :playerVars="{ autoplay: 1 }"
        ></youtube>
        <div>
            {{ showMessage }}
        </div>
    </div>
    <!-- </div> -->
    <!-- <div
        id="player"
        class="embedded-video"
        v-if="!redirectMode && video_src"
    ></div> -->
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
import api from "@/utils/backend-api";
export default {
    name: "WatchFrame",
    props: {
        video: {
            required: true,
        },
    },
    data() {
        return {
            // player: null,
            messages: [],
            showMessage: "",
            timers: [],
        };
    },
    methods: {
        ready(event) {
            this.player = event.target;
        },
        playing(event) {
            // The player is playing a video.
            console.log(event.target.getCurrentTime());
            this.getMessages();
        },
        stop() {
            this.player.stopVideo();
        },
        pause() {
            this.player.pauseVideo();
        },
        getMessages() {
            api.video_live_chat(
                this.video.id,
                "translation",
                Math.floor(this.player.getCurrentTime())
            ).then(res => {
                const curTime = this.player.getCurrentTime();
                if (res) {
                    this.messages = res.data.data;
                    this.messages.forEach(m => console.log((m.time_secs - curTime)));
                    const vm = this;
                    this.timers = this.messages
                        .filter(m => m.time_secs > curTime)
                        .map(m =>
                            setTimeout(
                                function() {
                                    vm.setMessage(m);
                                },
                                Math.floor((m.time_secs - curTime) * 1000)
                            )
                        );
                }
            });
        },
        setMessage(message) {
            console.log(message);
            this.showMessage = message;
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

<style>
.embedded-video {
    position: relative;
    padding-bottom: 56.25%;
}
.embedded-video > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
