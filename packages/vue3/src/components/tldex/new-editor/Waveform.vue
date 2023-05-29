<template>
  <div class="flex w-full flex-col flex-nowrap" style="height: 200px">
    <div ref="containerRef" class="grow-1 shrink-1 relative">
      <canvas ref="canvasRef" class="w-full" style="height: 130" />
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
      <span>{{ startTime }}</span>
      <span class="float-right">{{ endTime }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useWaveformGenerator } from "./useWaveform";
import Bar from "./Bar.vue";
import { useVirtualList } from "@vueuse/core";
import { useTimelineRendererBase } from "./useTimeline";
import { ParsedMessage } from "@/stores/socket_types";
import { formatDuration } from "@/utils/time";

const props = defineProps<{
  videoId: string;
  testMode?: boolean;
  room: { messages: Array<ParsedMessage>; elapsed: number } | undefined;
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

function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm: number = decimals < 0 ? 0 : decimals;
  const sizes: string[] = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i: number = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const a = computed<typeof waveform.value>(
  () =>
    waveform.value?.map(([a, b]) => [
      a,
      Math.floor(Math.pow((Math.max(b, -56) + 56) / 56, 3) * 100),
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
      console.log(v);
    },
  })
);
</script>
