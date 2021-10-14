<template>
  <v-sheet v-if="value" class="sync-bar pa-2 d-flex">
    <div class="mr-2">
      {{ currentSliderValue }} / 100
    </div>
    <div style="position: relative;" class="flex-grow-1">
      <template v-for="(v, index) in progressOffsetAndWidths">
        <v-progress-linear
          :key="v.id"
          style="position: absolute; z-index: 1;"
          color="secondary"
          :style="{
            left: (v.left*100).toFixed(2) + '%',
            width: (v.width*100).toFixed(2) + '%',
            top: (index*5) + 'px',
          }"
          :value="(currentProgress && currentProgress[v.id]) || 0"
        />
      </template>
      <input
        type="range"
        min="0"
        max="100"
        :value="currentSliderValue"
        class="sync-slider"
        step="0.01"
        @change="onSliderChange"
        @input="onInput"
      >
    </div>
  </v-sheet>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";
import { dayjs } from "@/utils/time";
import type { Content } from "@/utils/mv-utils";

export default {
    name: "MultiviewSyncBar",
    props: {
        value: {
            type: Boolean,
        },
    },
    data() {
        return {
            interacting: false,
            interactValue: 0,
        };
    },
    computed: {
        ...mapState("multiview", ["layout", "layoutContent", "presetLayout", "autoLayout"]),
        ...mapGetters("multiview", ["activeVideos"]),
        pastVideos() {
            return this.activeVideos.filter((v) => v.status === "past");
        },
        videoWithTs() {
            const videos = this.pastVideos.map((v) => ({
                ...v,
                startTs: dayjs(v.available_at).unix(),
                endTs: dayjs(v.available_at).unix() + v.duration,
            }));
            videos.sort((a, b) => a.startTs - b.startTs);
            return videos;
        },
        videosWithOverlap() {
            // Overlapping video list
            const ol = [];
            this.videoWithTs.forEach((v) => {
                // Push first video in, if none exists
                if (!ol.length) {
                    ol.push(v);
                    return;
                }
                // Video is within an hour threshold:
                // stream1 start <- [max 1 hour] -> stream2 end...
                if (v.startTs - ol[ol.length - 1].endTs < 60 * 60) {
                    ol.push(v);
                // Reset list if not within any bounds/threshold
                } else if (ol.length === 1) {
                    ol.splice(0, 1, v);
                }
            });
            return ol;
        },
        minTs() {
            return Math.min(...this.videosWithOverlap.map((v) => v.startTs));
        },
        maxTs() {
            return Math.max(...this.videosWithOverlap.map((v) => v.endTs));
        },
        progressOffsetAndWidths() {
            const totalTime = this.maxTs - this.minTs;
            return this.videosWithOverlap.map((v) => ({
                id: v.id,
                left: (v.startTs - this.minTs) / totalTime,
                width: (v.endTs - v.startTs) / totalTime,
            }));
        },
        // eslint-disable-next-line func-names
        currentProgress() {
            const progress = {};
            this.videosWithOverlap.forEach((v) => {
                const videoCellContent = Object.values<Content>(this.layoutContent).find((content) => content.id === v.id);
                progress[v.id] = (((videoCellContent?.currentTime || 0) / v.duration) * 100).toFixed(2);
            });
            return progress;
        },
        currentSliderValue() {
            if (!this.videosWithOverlap.length) return 0;
            const times = this.videosWithOverlap.map((v) => (this.currentProgress[v.id] === "0.00" ? 0 : v.startTs + (this.currentProgress[v.id] / 100) * v.duration));
            const progress = Math.max(...times);
            // Stop slider from jumping while interacting, and getting updates from player
            return this.interacting ? this.interactValue : (((progress - this.minTs) / (this.maxTs - this.minTs)) * 100).toFixed(2);
        },
    },
    watch: {
        videosWithOverlap(val) {
            if (!val.length) this.$emit("input", false);
        },
    },
    methods: {
        onSliderChange(e) {
            this.setTime(e.target.value / 100);
            this.interacting = false;
        },
        onInput(e) {
            this.interacting = true;
            this.interactValue = e.target.value;
        },
        setTime(percent) {
            const ts = percent * (this.maxTs - this.minTs) + this.minTs;
            this.$parent.$refs.videoCell
                .forEach((cell) => {
                    const { video } = cell;
                    const olVideo = video && this.videosWithOverlap.find((v) => v.id === video.id);
                    if (!video || !olVideo) return;

                    const currentTime = ts - olVideo.startTs;
                    const isBefore = currentTime < 0;
                    const isAfter = currentTime / olVideo.duration > 1;
                    // console.log(currentTime, isBefore, isAfter);
                    if (isBefore) {
                        // cell.seekTo(0);
                        cell.setPlaying(false);
                        cell.seekTo(0);
                        return;
                    }
                    if (isAfter) {
                        // cell.seekTo(olVideo.duration);
                        cell.setPlaying(false);
                        cell.seekTo(olVideo.duration);
                        return;
                    }
                    cell.setPlaying(true);
                    if (!isBefore || !isAfter) cell.seekTo(currentTime);
                });
        },
    },
};
</script>

<style>
.sync-bar {
    width: 100%;
    height: 64px;
    position: absolute;
    /* bottom: 0; */
}

.sync-slider {
  position: absolute;
  z-index: 20;
  -webkit-appearance: none;  /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full-width */
  height: 50px; /* Specified height */
  background: none; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
  -webkit-transition: .2s; /* 0.2 seconds transition on hover */
  transition: opacity .2s;
}
.sync-slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 3px; /* Set a specific slider handle width */
  height: 50px; /* Slider handle height */
  background: var(--v-primary-base); /* Green background */
  cursor: pointer; /* Cursor on hover */
  opacity: 0.7;
}
</style>
