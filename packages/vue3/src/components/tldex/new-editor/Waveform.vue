<template>
  <div class="flex w-full flex-col flex-nowrap" style="height: 200px">
    <div ref="sliderContainer" class="slider-container">
      <input
        ref="slider"
        type="range"
        min="0"
        :max="duration"
        :value="room?.elapsed || 0"
        class="timeline-slider"
        step="0.01"
        @input="(t) => t.target && player.player.seekTo(+(t.target as HTMLInputElement).value)"
      />
    </div>
    <div ref="containerRef" class="grow-1 shrink-1 relative">
      <canvas ref="canvasRef" class="w-full" style="height: 130px" />
      <div class="pointer-events-none absolute inset-0">
        <waveform-subtitle
          v-for="item in currentSubs"
          :key="item.key"
          :message="item"
          style="top: 20px"
          :style="{
            transform:
              'translateX(' +
              ((item.video_offset - startTime - 0.05) / (endTime - startTime)) *
                containerSize.width.value +
              'px)',
            width:
              ((item.duration ?? 1000) / 1000 / (endTime - startTime)) *
                containerSize.width.value +
              'px',
          }"
          @goto="(sec) => player.player.seekTo(sec)"
          @drag-handle="
            (isStartTime) => start(isStartTime ? 'start' : 'duration', item)
          "
          @drag-full="start('both', item)"
        />
      </div>
    </div>
    <div class="wf-status">
      <span v-if="stage == 'waiting' && !waveform">
        <a class="link" @click="init">
          Click here to Fetch audio information from youtube, this will use up
          20MB per hour of stream and take a minute or two depending on your
          internet speed.
        </a>
      </span>
      <span v-else-if="stage != 'done'">
        {{ stage }}: {{ msg }}
        {{ error_message ? "?ERROR?: " + error_message : "" }}
      </span>
    </div>
    <div class="w-full">
      <span>{{ formatDuration(startTime * 1000, 1) }}</span>
      <span class="float-right">{{ formatDuration(endTime * 1000, 1) }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useWaveformGenerator } from "./useWaveform";
import { useTimelineRendererBase } from "./useTimeline";
import { ParsedMessage } from "@/stores/socket_types";
import { formatDuration } from "@/utils/time";
import { formatBytes } from "@/utils/functions";
import { PlayerRef } from "@/components/player/usePlayer";
import { asyncComputed } from "@vueuse/core";
const props = defineProps<{
  videoId: string;
  testMode?: boolean;
  room: { messages: Array<ParsedMessage>; elapsed: number } | undefined;
  player: PlayerRef;
}>();

const emits = defineEmits<{ sortMessages: [] }>();

const duration = asyncComputed(
  async () => await props.player.player.getDuration(),
  undefined
);

const {
  error_message,
  format,
  latchAndRun,
  stage,
  progress,
  totalSize,
  waveform,
} = useWaveformGenerator();

function init() {
  setTimeout(() => latchAndRun(props.videoId), 5000);
}

const msg = computed(() => {
  switch (stage.value) {
    case "waiting":
      return "waiting...";
    case "downloading":
      return (
        Math.round(progress.value) + "% of " + formatBytes(totalSize.value)
      );
    case "transcoding":
      return "In progress: " + formatDuration(progress.value * 1000, 1) + "...";
    case "done":
    case "error":
      return "";
  }
});

const recomputedWave = computed<typeof waveform.value>(
  () =>
    waveform.value?.map(([a, b]) => [
      a,
      Math.floor(Math.pow((Math.max(b, -60) + 60) / 60, 3) * 100),
    ]) || []
);

const {
  allSubs,
  containerRef,
  canvasRef,
  containerSize,
  currentSubs,
  endTime,
  startTime,
} = useTimelineRendererBase(
  computed(() => props.room?.messages || []),
  recomputedWave,
  computed({
    get() {
      return props.room?.elapsed ?? 0;
    },
    set(v) {
      // hmm
      console.log("New Timeline seek", v);
      props.player.player.seekTo(v);
    },
  })
);

// Object dragging support for handlers:

function start(handle: "start" | "duration" | "both", item: ParsedMessage) {
  // console.log("start dragging?", event);
  const initStart = item.video_offset || 0;
  const initDuration = item.duration || 0;

  const mouseMoveHandler = (moveEvent: MouseEvent) => {
    // console.log(moveEvent.clientX);
    // if ((moveEvent.target as any).tagName !== "CANVAS") return;
    const offset = moveEvent.clientX - (containerRef.value?.offsetLeft ?? 0);
    const newValue =
      (offset / containerSize.width.value) * (endTime.value - startTime.value) +
      startTime.value;
    if (handle === "start" || handle === "both") {
      // move the start:
      item.video_offset = newValue;
      if (handle === "start") {
        // duration should stay unchanged, so:
        item.duration = Math.max(
          400,
          initDuration - (newValue - initStart) * 1000
        );
      }
    }
    if (handle === "duration") {
      // move ONLY the end.
      item.duration = Math.max(400, (newValue - initStart) * 1000);
    }
  };
  const mouseUpHandler = () => {
    console.log(item.timestamp, initStart, item.video_offset);

    item.timestamp = item.timestamp - (initStart - item.video_offset) * 1000;
    console.log(item.timestamp);
    console.log("mouse up?");
    emits("sortMessages");
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  document.addEventListener("mousemove", mouseMoveHandler);
  document.addEventListener("mouseup", mouseUpHandler);
}
</script>

<style lang="scss">
.slider-container {
  margin: 0px;
  padding: 0px;
  line-height: 8px;
}
.timeline-slider {
  display: inline-block;
  width: 100%;
  -webkit-appearance: none;
  &:focus {
    outline: none;
  }
  &::-webkit-slider-runnable-track {
    @apply bg-bgColor-50;
    width: 100%;
    height: 5px;
    cursor: pointer;
    box-shadow: none;
    /* background: #ffffff; */
    border-radius: 0px;
    border: 1px solid #010101;
    transition: all 0.2s ease-in-out;

    &:hover {
      @apply bg-bgColor-300;
      height: 8px;
    }
  }

  &:hover::-webkit-slider-thumb {
    margin-top: 1px;
  }
  &::-webkit-slider-thumb {
    @apply bg-primary-200;
    box-shadow: none;
    border: 0px solid #ffffff;
    box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.25);
    height: 6px;
    width: 10px;
    border-radius: 2px;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -1px;
    transition: all 0.2s ease-in-out;

    &:hover {
      @apply bg-primary-400;
      height: 9px;
      margin-top: -1px;
    }
  }

  &::-moz-focus-outer {
    border: 0;
  }
}
</style>
