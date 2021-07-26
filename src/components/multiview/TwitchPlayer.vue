<template>
    <div :id="elementId"></div>
</template>

<script>
// https://github.com/tserkov/vue-twitch-player/blob/master/TwitchPlayer.vue
// The distributed file from library was massive, pulling in just the component to control build size
// Credit to tskerkov

import Vue from "vue";
import LoadScript from "vue-plugin-load-script";

Vue.use(LoadScript);
let pid = 0;

export default {
    name: "twitch-player",
    props: {
        width: {
            type: String,
            default: "400",
        },
        height: {
            type: String,
            default: "300",
        },
        volume: {
            type: Number,
            default: 0.5,
        },
        quality: {
            type: String,
            default: "medium",
        },
        playsInline: {
            // If true, the embedded player plays inline for mobile iOS apps.
            type: Boolean,
            default: false,
        },
        mute: {
            type: Boolean,
            default: false,
        },
        channel: String,
        collection: String,
        video: String,
    },
    data() {
        pid += 1;
        return {
            player: {},
            elementId: `twitch-player-${pid}`,
        };
    },
    beforeCreate() {
        Vue.loadScript("https://player.twitch.tv/js/embed/v1.js")
            .then(() => {
                const options = {
                    width: this.width,
                    height: this.height,
                };
                if (this.playsInline) {
                    options.playsinline = true;
                }
                if (this.channel) {
                    options.channel = this.channel;
                } else if (this.collection) {
                    options.collection = this.collection;
                } else if (this.video) {
                    options.video = this.video;
                } else {
                    this.$emit("error", "no source specified");
                }
                this.player = new window.Twitch.Player(this.elementId, options);
                this.player.addEventListener("ended", () => this.$emit("ended"));
                this.player.addEventListener("pause", () => this.$emit("pause"));
                this.player.addEventListener("play", () => this.$emit("play"));
                this.player.addEventListener("offline", () => this.$emit("offline"));
                this.player.addEventListener("online", () => this.$emit("online"));
                this.player.addEventListener("ready", () => {
                    this.player.setQuality(this.quality);
                    this.player.setVolume(this.volume);
                    this.$emit("ready", this.player);
                });
            })
            .catch((e) => this.$emit("error", e));
    },
    methods: {
        play() {
            // Begins playing the specified video.
            this.player.play();
        },
        pause() {
            // Pauses the player.
            this.player.pause();
        },
        seek(timestamp) {
            // Seeks to the specified timestamp (in seconds) in the video and resumes playing if paused.
            // Does not work for live streams.
            this.player.seek(timestamp);
        },
        getCurrentTime() {
            // Returns the current video’s timestamp, in seconds. Works only for VODs, not live streams.
            return this.player.getCurrentTime();
        },
        getDuration() {
            // Returns the duration of the video, in seconds. Works only for VODs,not live streams.
            return this.player.getDuration();
        },
        getPlaybackStats() {
            // Returns an object with statistics the embedded video player and the current live stream or VOD.
            return this.player.getPlaybackStats();
        },
        getQuality() {
            // Returns the current quality of video playback.
            return this.player.getQuality();
        },
        isPaused() {
            // Returns true if the video is paused; otherwise, false. Buffering or seeking is considered playing.
            return this.player.isPaused();
        },
        hasEnded() {
            // Returns true if the live stream or VOD has ended; otherwise, false.
            return this.player.getEnded();
        },
        getVolume() {
            // Returns the volume level, a value between 0.0 and 1.0.
            return this.player.getVolume();
        },
        isMuted() {
            // Returns true if the player is muted; otherwise, false.
            return this.player.getMuted();
        },
        // mute() {
        //     // Mutes the player.
        //     player.setMuted(true);
        // },
        // unmute() {
        //     // Unmutes the player.
        //     player.setMuted(false);
        // },
        checkChannel() {
            return this.channel === this.player.getChannel();
        },
        checkVideo() {
            // eslint-disable-next-line no-return-assign
            return (this.video = this.player.getVideo());
        },
    },
    watch: {
        channel(newChannel) {
            this.player.setChannel(newChannel);
        },
        collection(newCollection) {
            this.player.setCollection(newCollection);
        },
        video(newVideo) {
            this.player.setVideo(newVideo);
        },
        volume(newVolume) {
            this.player.setVolume(newVolume);
        },
        quality(newQuality) {
            if (this.player.getQualities().indexOf(newQuality) !== -1) {
                this.player.setQuality(newQuality);
            }
        },
        mute(value) {
            this.player.setMuted(value);
        },
    },
};
</script>
