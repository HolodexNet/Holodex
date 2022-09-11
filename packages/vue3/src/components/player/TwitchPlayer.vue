<template>
  <div :id="elementId" />
</template>

<script lang="ts">
import { PropType } from "vue";
import { loadScript, unloadScript } from "vue-plugin-load-script";
import { TwitchPlayer, TwitchPlayerOptions } from "./TwitchPlayer";

let pid = 0;

export default defineComponent({
  name: "TwitchPlayer",
  props: {
    height: {
      type: [Number, String],
      default: 720,
    },
    width: {
      type: [Number, String],
      default: 1280,
    },
    mute: {
      type: Boolean,
      default: false,
    },
    channelId: {
      type: String,
      default: "",
    },
    videoId: {
      type: String,
      default: "",
    },
    playerVars: {
      type: Object as PropType<Partial<TwitchPlayerOptions>>,
      default: () => ({}),
    },
  },
  emits: ["ready", "error", "ended", "playing", "paused"],
  data() {
    pid += 1;
    return {
      player: null as TwitchPlayer | null,
      elementId: `twitch-player-${pid}`,
      playerScriptSrc: "https://player.twitch.tv/js/embed/v1.js",
    };
  },
  watch: {
    channel(newChannel) {
      this.player?.setChannel(newChannel);
    },
    video(newVideo) {
      this.player?.setVideo(newVideo, 0);
    },
    mute(value) {
      this.player?.setMuted(value);
    },
  },
  beforeUnmount() {
    if (this.player !== null) {
      // this.$emit("paused");
      //   delete this.player;
    }
    unloadScript(this.playerScriptSrc);
  },
  beforeCreate() {
    loadScript(this.playerScriptSrc)
      .then(() => {
        const options: TwitchPlayerOptions = {
          width: this.width,
          height: this.height,
          parent: [window.location.hostname],
          autoplay: false,
          ...this.playerVars,
        };
        if (this.channelId) {
          options.channel = this.channelId;
        } else if (this.videoId) {
          options.video = this.videoId;
        } else {
          this.$emit("error", "no source specified");
        }
        this.player = new window.Twitch.Player(this.elementId, options);
        this.player?.addEventListener("ended", () => this.$emit("ended"));
        this.player?.addEventListener("pause", () => this.$emit("paused"));
        this.player?.addEventListener("play", () => this.$emit("playing"));
        // this.player.addEventListener("offline", () => this.$emit("offline"));
        // this.player.addEventListener("online", () => this.$emit("online"));
        this.player?.addEventListener("ready", () => {
          //   this.player.setQuality(this.quality);
          this.playerReady(this.player);
        });
      })
      .catch((e) => this.playerError(e));
  },
  methods: {
    playerReady(player: any) {
      this.setMute(this.mute);
      // this.initListeners();
      this.$emit("ready", player);
    },
    playerError(e: any) {
      console.log(`[PLAYER ERROR] - ${pid}`);
      console.error(e);
      this.$emit("error", e);
    },
    play() {
      // Begins playing the specified video.
      this.player?.play();
    },
    pause() {
      // Pauses the player.
      this.player?.pause();
    },
    getCurrentTime() {
      // Returns the current video’s timestamp, in seconds. Works only for VODs, not live streams.
      return this.player?.getCurrentTime();
    },
    getVolume() {
      // Returns the volume level, a value between 0.0 and 1.0.
      return (this.player?.getVolume() || 0) * 100;
    },
    isMuted() {
      // Returns true if the player is muted; otherwise, false.
      return this.player?.getMuted();
    },
    setMute(value: boolean) {
      this.player?.setMuted(value);
    },
    setPlaying(playing: boolean) {
      if (!this.player) return;
      !playing ? this.player.pause() : this.player.play();
    },
  },
});
</script>
