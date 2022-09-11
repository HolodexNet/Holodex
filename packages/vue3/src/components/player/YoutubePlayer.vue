<template>
  <div :id="elementId" />
</template>

<script lang="ts">
import { PropType } from "vue";
import player from "youtube-player";
import { YouTubePlayer, Options } from "youtube-player/dist/types";
import PlayerMixin from "./PlayerMixin";

const UNSTARTED = -1;
const ENDED = 0;
const PLAYING = 1;
const PAUSED = 2;
const BUFFERING = 3;
const CUED = 5;

let pid = 1;
export default defineComponent({
  name: "YoutubePlayer",
  mixins: [PlayerMixin],
  props: {
    videoId: {
      type: String,
      default: undefined,
    },
    playerVars: {
      type: Object as PropType<Partial<Options["playerVars"]>>,
      default: () => ({}),
    },
  },
  data() {
    pid += 1;
    return {
      events: {
        [UNSTARTED]: "unstarted",
        [PLAYING]: "playing",
        [PAUSED]: "paused",
        [ENDED]: "ended",
        [BUFFERING]: "buffering",
        [CUED]: "cued",
      } as Record<number, string>,
      elementId: `youtube-player-${pid}`,
      player: null as YouTubePlayer | null,
    };
  },
  computed: {},
  watch: {
    videoId: "updatePlayer",
    mute: "setMute",
  },
  beforeUnmount() {
    if (this.player !== null && this.player.destroy) {
      this.player.destroy();
    }
  },
  async mounted() {
    // window.YTConfig = {
    //   host: "https://www.youtube.com/iframe_api",
    // };

    const host = "https://www.youtube.com";

    this.player = player(this.elementId, {
      host,
      width: this.width,
      height: this.height,
      videoId: this.videoId,
      playerVars: this.playerVars,
      //   origin: window.origin,
    });

    this.player.on("ready", (e) => this.playerReady(e.target));
    this.player.on("stateChange", this.playerStateChange);
    this.player.on("error", this.playerError);
  },
  methods: {
    updatePlayer(videoId: string) {
      this.player.loadVideoById(videoId);
    },
    playerStateChange(e: any) {
      if (e.data !== null && e.data !== UNSTARTED) {
        this.$emit(this.events[e.data], e.target);
      }
    },
    setMute(value: boolean) {
      if (!this.player) return;
      value ? this.player.mute() : this.player.unMute();
    },
    getCurrentTime() {
      return this.player?.getCurrentTime();
    },
    getPlaybackRate() {
      return this.player.getPlaybackRate();
    },
    getVolume() {
      return this.player.getVolume();
    },
    isMuted() {
      return this.player.isMuted();
    },
    seekTo(t: number) {
      this.player.seekTo(t, true);
    },
    setPlaying(playing: boolean) {
      if (!this.player) return;
      !playing ? this.player.pauseVideo() : this.player.playVideo();
    },
    async sendLikeEvent() {
      const iframe = await this.player.getIframe();
      iframe?.contentWindow?.postMessage({ event: "likeVideo" }, "*");
    },
  },
});
</script>
