<template>
  <v-sheet class="sync-bar pa-2 d-flex justify-center align-center">
    <div class="mr-2">
      <v-btn icon @click="paused = !paused">
        <v-icon large>
          {{ paused ?icons.mdiPlay : mdiPause }}
        </v-icon>
      </v-btn>
    </div>
    <div style="position: relative;" class="flex-grow-1 align-self-start">
      <template v-for="(v) in progressOffsetAndWidths">
        <v-progress-linear
          :key="v.id"
          style="z-index: 1;"
          color="secondary"
          :style="{
            marginLeft: (v.offset*100).toFixed(2) + '%',
            marginBottom: '2px',
            width: (v.width*100).toFixed(2) + '%',
          }"
          :value="currentTsByVideo[v.id] || 0"
        />
      </template>
      <div class="slider-container">
        <input
          ref="syncSlider"
          type="range"
          min="0"
          max="100"
          :value="currentProgress"
          class="sync-slider"
          step="0.01"
          @change="onSliderChange"
          @input="onInput"
        >
        <div ref="timeTooltip" class="time-tooltip" :style="{ left: timerTooltipLeft + '%' }">
          {{ timerTooltipText }}
        </div>
      </div>
    </div>
  </v-sheet>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";
import { dayjs } from "@/utils/time";
import Vue from "vue";
import throttle from "lodash-es/throttle";

import {
    mdiPause, mdiFastForward,
} from "@mdi/js";

export default {
    name: "MultiviewSyncBar",
    props: {
        value: {
            type: Boolean,
        },
    },
    data() {
        return {
            mdiPause,
            mdiFastForward,
            interacting: false,
            interactValue: 0,

            expectedTs: 0,
            bufferTs: 0,
            currentTs: 0,
            paused: true,
            currentTsByVideo: {},
            currentSliderValue: 0,
            timer: null,
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
                offset: (v.startTs - this.minTs) / totalTime,
                width: (v.endTs - v.startTs) / totalTime,
            }));
        },
        currentProgress() {
            return this.getPercentForTime(this.currentTs) * 100;
        },
        timerTooltipLeft() {
            return this.interacting ? (this.getPercentForTime(this.bufferTs) * 100) : this.currentProgress;
        },
        timerTooltipText() {
            return this.interacting ? dayjs.unix(this.bufferTs).format("LTS") : dayjs.unix(this.getTimeForPercent(this.currentProgress / 100)).format("LTS");
        },
    },
    watch: {
        // videosWithOverlap(val) {
        //     if (!val.length) this.$emit("input", false);
        // },
        paused(pause) {
            this.$parent.$refs.videoCell
                .forEach((cell) => {
                    const { video } = cell;
                    const olVideo = video && this.videosWithOverlap.find((v) => v.id === video.id);
                    if (olVideo && pause) cell.setPlaying(false);
                    else this.setTime(this.currentTs);
                });
        },
    },
    mounted() {
        this.$refs.syncSlider.addEventListener("mousemove", this.onMouseOver, false);
        this.$refs.syncSlider.addEventListener("mouseout", this.onMouseLeave, false);
        this.startTimer();
    },
    beforeDestroy() {
        this.timer && clearInterval(this.timer);
        this.$refs.syncSlider.removeEventListener("mousemove", this.onMouseOver);
        this.$refs.syncSlider.removeEventListener("mouseout", this.onMouseLeave);
    },
    methods: {
        onMouseOver: throttle(function (e) {
            const offsetLeft = e.target.getBoundingClientRect().x;
            // console.log(e.clientX, e.target.offsetLeft, e.target.clientWidth);
            const percent = (e.clientX - offsetLeft) / e.target.clientWidth;
            // this.$refs.timeTooltip.style.left = `${(e.clientX - offsetLeft)}px`;
            this.bufferTs = this.getTimeForPercent(percent);
            // this.$refs.timeTooltip.textContent = dayjs.unix(this.bufferTs).format("LTS");
            this.interacting = true;
        }, 10),
        onMouseLeave(e) {
            this.interacting = false;
        },
        onSliderChange(e) {
            const ts = this.getTimeForPercent((e.target.value / 100));
            this.setTime(ts);
            this.interacting = false;
            this.currentTs = this.getTimeForPercent(e.target.value / 100);
        },
        onInput(e) {
            this.interacting = true;
            this.interactValue = e.target.value;
            // this.currentProgress = e.target.value;
        },
        getTimeForPercent(percent) {
            return (percent * (this.maxTs - this.minTs)) + this.minTs;
        },
        getPercentForTime(ts) {
            return (ts - this.minTs) / (this.maxTs - this.minTs);
        },
        getProgressPercentByAbsoluteTime(ts, video) {
            return Math.min(100, Math.max(((ts - video.startTs) / (video.endTs - video.startTs)) * 100, 0));
        },
        sync() {
            if (this.currentTs <= 0) this.currentTs = this.minTs;
            const states = [];
            const deltas = [];
            this.$parent.$refs.videoCell
                .forEach((cell) => {
                    const { video, currentTime } = cell;
                    // Find corresponding overlapping video
                    const olVideo = video && this.videosWithOverlap.find((v) => v.id === video.id);
                    if (!olVideo) return;

                    // Update pervideo progress bar
                    const percentProgress = ((currentTime / olVideo.duration) * 100).toFixed(2);
                    Vue.set(this.currentTsByVideo, olVideo.id, percentProgress);

                    // Calc delta times to keep things in sync
                    const expectedDuration = this.currentTs - olVideo.startTs;
                    const delta = Math.abs(expectedDuration - currentTime);
                    const isBefore = expectedDuration < 0;
                    const isAfter = expectedDuration / olVideo.duration > 1;
                    deltas.push(delta);
                    if (isBefore || isAfter) {
                        cell.setPlaying(false);
                        // Sync if current cell delta is over 2 seconds
                    } else if (expectedDuration > 0 && delta > 2) {
                        cell.setPlaying(!this.paused);
                        cell.seekTo(expectedDuration);
                    }
                });
            // Wait for all videos to exit buffering state to increment currentTs if not paused
            if (!states.includes(3) && !this.paused) {
                this.currentTs = Math.min(Math.max(this.currentTs + 0.5, this.minTs), this.maxTs);
            }

            console.log("deltas: ", deltas);
        },
        setTime(ts) {
            this.$parent.$refs.videoCell
                .forEach((cell) => {
                    const { video } = cell;
                    const olVideo = video && this.videosWithOverlap.find((v) => v.id === video.id);
                    if (!olVideo) return;

                    const currentTime = ts - olVideo.startTs;
                    const isBefore = currentTime < 0;
                    const isAfter = currentTime / olVideo.duration > 1;
                    console.log(currentTime, isBefore, isAfter);
                    if (isBefore) {
                        // cell.seekTo(0);
                        cell.setPlaying(false);
                        cell.seekTo(0);
                        return;
                    }
                    if (isAfter) {
                        // cell.seekTo(olVideo.duration);
                        cell.setPlaying(false);
                        cell.seekTo(olVideo.duration - 1);
                        return;
                    }
                    cell.setPlaying(!this.paused);
                    cell.seekTo(currentTime);
                });
        },
        startTimer() {
            if (this.timer) clearInterval(this.timer);
            this.timer = setInterval(this.sync, 500);
        },
    },
};
</script>

<style lang="scss">
.sync-bar {
    width: 100%;
    height: 64px;
    position: absolute;
    /* bottom: 0; */
}
.sync-slider {
  position: absolute;
  top: 0;
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
.time-tooltip {
    position: absolute;
    // height: 50px;
    // border-left: 2px solid green;
    opacity: 0.7;
    z-index: 10;
    top: -20px;
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
