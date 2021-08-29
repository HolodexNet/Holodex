<template>
  <div
    :key="`uid-${uniqueId}`"
    class="cell-content mv-frame ma-auto"
    :class="{ 'elevation-4': editMode }"
  >
    <!-- Twitch Player -->
    <VueTwitchPlayer
      v-if="isTwitchVideo"
      :channel="cellContent.id"
      :plays-inline="true"
      :mute="muted"
      @ready="vidReady"
      @ended="editMode = true"
      @play="vidPlaying({ data: 1 })"
      @pause="vidPlaying({ data: 2 })"
      @error="editMode = true"
    />
    <!-- Youtube Player -->
    <youtube
      v-else
      :video-id="cellContent.id"
      :player-vars="{
        playsinline: 1,
      }"
      :mute="muted"
      @ready="vidReady"
      @ended="editMode = true"
      @playing="vidPlaying({ data: 1 })"
      @paused="vidPlaying({ data: 2 })"
      @cued="editMode = true"
      @error="editMode = true"

      @playbackRate="e => playbackRate = e"
      @mute="e => muted = e"
    />
    <cell-control v-if="editMode" />
  </div>
</template>

<script>
import Vue from "vue";
import VueYoutube from "@/external/vue-youtube";

import CellMixin from "./CellMixin";
import CellControl from "./CellControl.vue";

Vue.use(VueYoutube);
export default {
    name: "VideoCell",
    components: {
        CellControl,
        VueTwitchPlayer: () => import("./TwitchPlayer.vue"),
    },
    mixins: [CellMixin],
    data() {
        return {
            uniqueId: Date.now(),
            ytPlayer: null,
            twPlayer: null,
            playbackRate: 1,
        };
    },
    computed: {
        isTwitchVideo() {
            return this.cellContent?.video?.type === "twitch";
        },
        muted: {
            get() {
                if (!this.cellContent) return false;
                return this.cellContent.muted;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", {
                    id: this.item.i,
                    key: "muted",
                    value,
                });
            },
        },
        video: {
            get() {
                if (!this.cellContent) return null;
                return this.cellContent.video;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", {
                    id: this.item.i,
                    key: "video",
                    value,
                });
            },
        },
        isFastFoward() {
            console.log(this.playbackRate);
            return this.playbackRate !== 1;
        },
    },
    mounted() {
        // When mounted, the video is paused, reset edit mode to sync up
        if (!this.editMode) this.editMode = true;
    },
    methods: {
        refresh() {
            this.uniqueId = Date.now();
            this.editMode = true;
        },
        setPlaying(val) {
            if (this.editMode !== val) return;
            if (this.ytPlayer) {
                !this.editMode ? this.ytPlayer.pauseVideo() : this.ytPlayer.playVideo();
            }
            if (this.twPlayer) {
                !this.editMode ? this.twPlayer.pause() : this.twPlayer.play();
            }
        },
        setMuted(val) {
            this.muted = val;
        },
        togglePlaybackRate() {
            if (!this.ytPlayer) return;
            // const realTimeRate = this.ytPlayer.getPlaybackRate();
            // this.ytPlayer.setPlaybackRate(realTimeRate !== 1 ? 1 : 2);
            this.ytPlayer.setPlaybackRate(this.isFastFoward ? 1 : 2);
        },
        vidPlaying(evt) {
            this.editMode = evt.data === 2;
            if (evt.data === 2 && this.iOS() && this.ytPlayer) {
                this.ytPlayer.mute();
                this.muted = true;
            }
        },
        vidReady(evt) {
            if (evt && this.isTwitchVideo) {
                this.twPlayer = evt;
            } else if (evt) {
                this.ytPlayer = evt;
                if (this.muted) {
                    this.ytPlayer.mute();
                } else {
                    this.ytPlayer.unMute();
                }
            }
        },
    },
};
</script>

<style>
.mv-frame > div > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

.mv-frame {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>
