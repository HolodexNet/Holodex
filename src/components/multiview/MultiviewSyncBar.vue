<template>
  <v-sheet class="sync-bar pa-2" elevation="8">
    <div class="d-flex justify-center align-center">
      <div class="mr-2">
        <v-btn icon @click="paused = !paused">
          <v-icon large>
            {{ paused ?icons.mdiPlay : mdiPause }}
          </v-icon>
        </v-btn>
        <div v-if="minTs" class="text-center">
          {{ currentDuration }}
          <br>
          <span style="border-top: 1px solid; padding-top: 2px"> {{ totalDuration }} </span>
        </div>
      </div>
      <div class="flex-grow-1 align-self-start" style="position: relative">
        <div class="time-tooltip-wrapper">
          <div
            v-show="hovering"
            class="time-tooltip"
            :style="{ marginLeft: timeTooltipLeft }"
          >
            {{ timeTooltipText }}
          </div>
        </div>
        <div style="overflow-y: scroll; overflow-x: hidden; height: 80px" class="pr-2">
          <div style="position: relative">
            <div ref="syncSlider" class="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                :value="currentProgress"
                class="sync-slider"
                step="0.01"
                @change="onSliderChange"
                @input="onInput"
              >
            </div>
            <template v-for="(v) in splitProgressBarData">
              <div :key="v.id" class="d-flex align-center my-1">
                <channel-img
                  :channel="v.channel"
                  :size="24"
                  class="px-1"
                  rounded
                />
                <div class="flex">
                  <v-progress-linear
                    style="z-index: 1;"
                    color="secondary"
                    :style="{
                      marginLeft: (v.offset*100).toFixed(2) + '%',
                      width: (v.width*100).toFixed(2) + '%',
                      height: '8px',
                    }"
                    :value="currentProgressByVideo[v.id] || 0"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </v-sheet>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";
import { formatDuration, dayjs } from "@/utils/time";
import Vue from "vue";
import throttle from "lodash-es/throttle";

import {
    mdiPause, mdiFastForward,
} from "@mdi/js";
import ChannelImg from "../channel/ChannelImg.vue";

export default {
    name: "MultiviewSyncBar",
    components: { ChannelImg },
    data() {
        return {
            mdiPause,
            mdiFastForward,
            interacting: false,
            hovering: false,
            hoverTs: 0,
            timeTooltipLeft: 0,
            timeTooltipText: "",
            currentTs: 0,
            paused: true,
            currentProgressByVideo: {},
            currentSliderValue: 0,
            timer: null,
            firstPlay: true,
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
            if (!this.videosWithOverlap.length) return 0;
            return Math.min(...this.videosWithOverlap.map((v) => v.startTs));
        },
        maxTs() {
            if (!this.videosWithOverlap.length) return 0;
            return Math.max(...this.videosWithOverlap.map((v) => v.endTs));
        },
        splitProgressBarData() {
            const totalTime = this.maxTs - this.minTs;
            return this.videosWithOverlap.map((v) => ({
                id: v.id,
                channel: v.channel,
                offset: (v.startTs - this.minTs) / totalTime,
                width: (v.endTs - v.startTs) / totalTime,
            }));
        },
        currentProgress() {
            return this.getPercentForTime(this.currentTs);
        },
        currentDuration() {
            return formatDuration(Math.round(this.currentTs - this.minTs) * 1000);
        },
        totalDuration() {
            return formatDuration((this.maxTs - this.minTs) * 1000);
        },
    },
    watch: {
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
        this.$refs.syncSlider.addEventListener("mouseenter", this.onMouseEnter, false);
        this.$refs.syncSlider.addEventListener("mousemove", this.onMouseOver, false);
        this.$refs.syncSlider.addEventListener("mouseout", this.onMouseLeave, false);
        this.startTimer();
    },
    beforeDestroy() {
        this.timer && clearInterval(this.timer);
        this.$refs.syncSlider.removeEventListener("mouseenter", this.onMouseEnter);
        this.$refs.syncSlider.removeEventListener("mousemove", this.onMouseOver);
        this.$refs.syncSlider.removeEventListener("mouseout", this.onMouseLeave);
    },
    methods: {
        onMouseEnter() {
            this.hovering = true;
        },
        // eslint-disable-next-line func-names
        onMouseOver: throttle(function (e) {
            const offsetLeft = e.target.getBoundingClientRect().x;
            const percent = ((e.clientX - offsetLeft) / e.target.clientWidth) * 100;
            if (!(percent >= 0 && percent <= 100)) return;
            this.hoverTs = this.getTimeForPercent(percent);
            this.timeTooltipLeft = `${percent}%`;
            this.timeTooltipText = `${this.formatUnixTime(this.hoverTs)}\n${formatDuration((this.hoverTs - this.minTs) * 1000)}/${this.totalDuration}`;
        }, 10),
        onMouseLeave() {
            this.hovering = false;
        },
        onSliderChange(e) {
            const ts = this.getTimeForPercent((e.target.value));
            this.setTime(ts);
            this.currentTs = this.getTimeForPercent(e.target.value);
        },
        onInput(e) {
            this.interacting = true;
            this.interactValue = e.target.value;
        },
        getTimeForPercent(percent) {
            return ((percent / 100) * (this.maxTs - this.minTs)) + this.minTs;
        },
        getPercentForTime(ts) {
            return ((ts - this.minTs) / (this.maxTs - this.minTs)) * 100;
        },
        getProgressPercentByAbsoluteTime(ts, video) {
            return Math.min(100, Math.max(((ts - video.startTs) / (video.endTs - video.startTs)) * 100, 0));
        },
        sync() {
            if (!this.$parent?.$refs?.videoCell) return;
            // Find start time if first initialization
            if (this.currentTs <= 0) {
                this.currentTs = this.findStartTime();
            }
            // current player states
            const states = [];
            // current video deltas (diff between currentTs/true time)
            // const deltas = [];
            this.$parent.$refs.videoCell
                .forEach((cell) => {
                    const { video, currentTime } = cell;
                    // Find corresponding overlapping video
                    const olVideo = video && this.videosWithOverlap.find((v) => v.id === video.id);
                    if (!olVideo) return;

                    // Update pervideo progress bar
                    const percentProgress = this.currentTs > olVideo.endTs ? 100 : ((currentTime / olVideo.duration) * 100).toFixed(2);
                    Vue.set(this.currentProgressByVideo, olVideo.id, percentProgress);

                    // Calc delta times to keep things in sync
                    const expectedDuration = this.currentTs - olVideo.startTs;
                    const delta = Math.abs(expectedDuration - currentTime);
                    const isBefore = expectedDuration < 0;
                    const isAfter = expectedDuration / olVideo.duration > 1;
                    // deltas.push(delta);
                    if (isBefore || isAfter) {
                        cell.setPlaying(false);
                        // Sync if current cell delta is over 2 seconds
                    } else if (expectedDuration > 0 && delta > 2) {
                        cell.setPlaying(!this.paused);
                        cell.seekTo(expectedDuration);
                    }
                });
            // Wait for all videos to exit buffering state (3) to increment currentTs, if not paused
            if (!states.includes(3) && !this.paused) {
                this.currentTs = Math.min(Math.max(this.currentTs + 0.5, this.minTs), this.maxTs);
            }
            // console.log("deltas: ", deltas);
        },
        // Find a start time from current player times or use minTs
        findStartTime() {
            const times = [];
            if (!this.$parent?.$refs?.videoCell) return 0;
            this.$parent.$refs.videoCell
                .forEach((cell, index) => {
                    const { video, currentTime } = cell;
                    // Find corresponding overlapping video
                    const olVideo = video && this.videosWithOverlap.find((v) => v.id === video.id);
                    if (!olVideo) return;
                    const t = currentTime + olVideo.startTs;
                    // Find times that is within 2 seconds of other videos
                    if (index === 0 || Math.abs(times[index - 1] - t) < 2000) {
                        times.push(t);
                    }
                });
            // Return average if all the times are close
            if (times.length === this.videosWithOverlap.length) {
                return times.reduce((a, c) => a + c) / times.length;
            }
            // Use minTs as start time
            return this.minTs;
        },
        // Set to a certain timestamp
        setTime(ts) {
            this.$parent.$refs.videoCell
                .forEach((cell) => {
                    const { video } = cell;
                    const olVideo = video && this.videosWithOverlap.find((v) => v.id === video.id);
                    if (!olVideo) return;

                    const currentTime = ts - olVideo.startTs;
                    const isBefore = currentTime < 0;
                    const isAfter = currentTime / olVideo.duration > 1;
                    if (isBefore || isAfter) {
                        cell.setPlaying(false);
                        cell.seekTo(isBefore ? 0 : olVideo.duration - 1);
                        return;
                    }

                    if (this.firstPlay) {
                        this.paused = false;
                        this.firstPlay = false;
                    }
                    cell.setPlaying(!this.paused);
                    cell.seekTo(currentTime);
                });
        },
        startTimer() {
            if (this.timer) clearInterval(this.timer);
            this.timer = setInterval(this.sync, 500);
        },
        formatUnixTime(ts) {
            return dayjs.unix(ts).format("LTS");
        },
        formatDuration,
    },
};
</script>

<style lang="scss">
$slider-left-offset: 32px;
$slider-right-offset: 8px;
$slider-height: 90px;

.sync-bar {
    width: 100%;
    min-height: 64px;
    position: absolute;
    bottom: 0;
}
.slider-container {
    position: sticky;
    margin-top: -$slider-height;
    left: $slider-left-offset;
    top: 0;
    width: calc(100% - #{$slider-left-offset});
    height: 100%;
    z-index: 10;
}
.sync-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 100%;
  background: none;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.time-tooltip-wrapper {
    position: absolute;
    margin-left: $slider-left-offset;
    width: calc(100% - #{$slider-right-offset} - #{$slider-left-offset});
    z-index: 5;
    top: -30px;
}
.time-tooltip {
    display: inline-block;
    white-space: pre;
    text-align: center;
    opacity: 0.7;
    background: black;
    padding: 4px;
    border-radius: 0.25em;
    transform: translate(-50%, -50%);
}
.sync-slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 3px; /* Set a specific slider handle width */
  height: 80px; /* Slider handle height */
  background: var(--v-primary-base); /* Green background */
  top: 0;
  cursor: pointer; /* Cursor on hover */
  opacity: 0.8;
  display: flex;
}
.static-ts-text {
    position: absolute;
    bottom: -10px;
    height: 100%;
    border-style: 1px solid white;
    display: flex;
    align-items: flex-end;
    z-index: 10;
}
</style>
