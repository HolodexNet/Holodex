<template>
  <div :id="elementId" />
</template>

<script>
import Vue from "vue";
import LoadScript from "vue-plugin-load-script";
import PlayerMixin from "./PlayerMixin";

Vue.use(LoadScript);
let pid = 0;

export default {
    name: "TwitchPlayer",
    mixins: [PlayerMixin],
    props: {
        quality: {
            type: String,
            default: "medium",
        },
        mute: {
            type: Boolean,
            default: false,
        },
        playsInline: {
            type: Boolean,
            default: false,
        },
        channel: {
            type: String,
            default: "",
        },
        video: {
            type: String,
            default: "",
        },
    },
    data() {
        pid += 1;
        return {
            player: {},
            elementId: `twitch-player-${pid}`,
        };
    },
    watch: {
        channel(newChannel) {
            this.player.setChannel(newChannel);
        },
        video(newVideo) {
            this.player.setVideo(newVideo);
        },
        // quality(newQuality) {
        //     if (this.player.getQualities().indexOf(newQuality) !== -1) {
        //         this.player.setQuality(newQuality);
        //     }
        // },
        mute(value) {
            this.player.setMuted(value);
        },
    },
    beforeDestroy() {
        if (this.player !== null) {
            this.$emit("paused");
            delete this.player;
        }
    },
    beforeCreate() {
        Vue.loadScript("https://player.twitch.tv/js/embed/v1.js")
            .then(() => {
                const options = {
                    width: this.width,
                    height: this.height,
                    parent: [window.location.hostname],
                    autoplay: false,
                };
                if (this.playsInline) {
                    options.playsinline = true;
                }
                if (this.channel) {
                    options.channel = this.channel;
                } else if (this.video) {
                    options.video = this.video;
                } else {
                    this.$emit("error", "no source specified");
                }
                this.player = new window.Twitch.Player(this.elementId, options);
                this.player.addEventListener("ended", () => this.$emit("ended"));
                this.player.addEventListener("pause", () => this.$emit("paused"));
                this.player.addEventListener("play", () => this.$emit("playing"));
                // this.player.addEventListener("offline", () => this.$emit("offline"));
                // this.player.addEventListener("online", () => this.$emit("online"));
                this.player.addEventListener("ready", () => {
                    this.player.setQuality(this.quality);
                    this.playerReady(this.player);
                });
            })
            .catch((e) => this.playerError(e));
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
        getCurrentTime() {
            // Returns the current video’s timestamp, in seconds. Works only for VODs, not live streams.
            return this.player.getCurrentTime();
        },
        getVolume() {
            // Returns the volume level, a value between 0.0 and 1.0.
            return this.player.getVolume() * 100;
        },
        isMuted() {
            // Returns true if the player is muted; otherwise, false.
            return this.player.getMuted();
        },
        setMute(value) {
            this.player.setMuted(value);
        },
        setPlaying(playing) {
            if (!this.player) return;
            !playing ? this.player.pause() : this.player.play();
        },
    },
};
</script>
