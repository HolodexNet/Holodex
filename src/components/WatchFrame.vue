<template>
    <!-- <div class="embedded-video" v-if="!redirectMode && video_src"> -->
    <!-- <iframe :src="video_src" frameborder="0" allowfullscreen></iframe> -->
    <div v-if="!redirectMode && video" class="video">
        <youtube
            class="embedded-video"
            :video-id="video.yt_video_key"
            @ready="ready"
            @playing="playing"
            @paused="paused"
            :playerVars="{ autoplay: 1 }"
        >
        </youtube>
        <div class="watch-overlay text-center">
            <template v-for="message in showMessages">
                <div class="watch-translation" :key="message.message">
                    <div class="watch-translation-author">
                        <span
                            style="background-color: rgba(0, 0, 0, 0.5);"
                            class="pa-1 text-caption"
                        >
                            {{ message.author }}
                        </span>
                    </div>
                    <div class="watch-translation-message pa-2">
                        {{ message.message }}
                    </div>
                </div>
                <br :key="message.message + 'br'" />
            </template>
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
            messages: [],
            sub_offset: 8, //offset by 4 seconds
            currentTime: 0,
            timer: null,
        };
    },
    destroyed() {
        if (this.timer) this.stopSync();
    },
    methods: {
        ready(event) {
            this.player = event.target;
        },
        startSync() {
            const vm = this;
            this.timer = setInterval(function() {
                vm.currentTime = vm.player.getCurrentTime();
            }, 1000);
        },
        stopSync() {
            clearInterval(this.timer);
            this.timer = null;
        },
        playing(event) {
            console.log(event.target.getCurrentTime());
            this.startSync();
            // this.getMessages(this.player.getCurrentTime());
        },
        paused(event) {
            console.log(event);
            this.stopSync();
        },
        cleanMessages() {
            const curTime = this.player.getCurrentTime();
            this.messages = this.messages.filter(
                m => m.time_secs - this.sub_offset > curTime
            );
        },
        getMessages(time) {
            this.cleanMessages();
            console.log("Grabbing new messages");
            return api
                .video_live_chat(this.video.id, "translation", Math.floor(time))
                .then(res => {
                    // const curTime = this.player.getCurrentTime();
                    if (res) {
                        this.messages.push(...res.data.messages);
                    }
                });
        },
    },
    watch: {
        currentTime() {
            // console.log(this.currentTime);
            if (!this.messages.length) {
                this.getMessages(this.currentTime);
                return;
            }
            const lastMessage = this.messages[this.messages.length - 1];
            if (this.currentTime > lastMessage.time_secs - 30)
                this.getMessages(lastMessage.time_secs + 1);
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
        messagesWithDuration() {
            return this.messages.map(m => {
                m.endTime = m.time_secs + m.message.length / 12 + 1;
                return m;
            });
        },
        showMessages() {
            return this.messagesWithDuration.filter(
                m =>
                    this.currentTime >= m.time_secs - this.sub_offset &&
                    this.currentTime <= m.endTime - this.sub_offset
            );
        },
        lastMessage() {
            return this.messages[this.messages.length - 1];
        },
    },
};
</script>

<style>
.video {
    position: relative;
}
.watch-overlay {
    position: absolute;
    width: 100%;
    bottom: 5%;
    margin: 10px;
}
.watch-translation {
    display: inline-block;
    font-size: 1.85rem;
    line-height: 1;
}
.watch-translation-message {
    white-space: pre-wrap;
    background: rgba(8, 8, 8, 0.75);
}
.watch-translation-author {
    text-align: start;
}
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
