<template>
  <div class="flex w-full flex-col flex-nowrap" style="height: 200px">
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
              ((item.video_offset - startTime) / (endTime - startTime)) *
                containerSize.width.value +
              'px)',
            width:
              ((item.duration ?? 1000) / 1000 / (endTime - startTime)) *
                containerSize.width.value +
              'px',
          }"
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
const props = defineProps<{
  videoId: string;
  testMode?: boolean;
  room: { messages: Array<ParsedMessage>; elapsed: number } | undefined;
  player: PlayerRef;
}>();

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

const a = computed<typeof waveform.value>(
  () =>
    waveform.value?.map(([a, b]) => [
      a,
      Math.floor(Math.pow((Math.max(b, -60) + 60) / 60, 3) * 100),
    ]) || []
);

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
// const { list, containerProps, wrapperProps } = useVirtualList(a, {
//   itemWidth: 6,
// });
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
  a,
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
</script>
