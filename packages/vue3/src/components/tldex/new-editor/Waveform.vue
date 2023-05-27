<template>
  <div class="w-full">
    <h-btn v-if="!waveform" @click="init">Generate Waveform</h-btn>
    <div v-if="stage != 'waiting' && !waveform">
      {{ stage }}: {{ progress }} / {{ formatBytes(totalSize) }}
      {{ error_message }}
    </div>
    <video-player v-if="videoId && testMode" :video="{ id: videoId }" />

    <div class="w-10/12 max-w-5xl" style="height: 100px">
      <div v-bind="containerProps" class="h-full">
        <div v-bind="wrapperProps" class="items-center">
          <div
            v-for="item in list"
            :key="item.index"
            :style="{
              width: '6px',
              height: item.data[1] + 'px',
              backgroundColor: 'white',
            }"
          />
        </div>
      </div>
    </div>
    <!-- <virtual-list
      v-if="waveform"
      ref="wvis"
      direction="horizontal"
      style="
        overflow-x: auto;
        width: 70vw;
        scroll-behavior: smooth;
        height: 100px;
      "
      wrap-class="flex"
      :wrap-style="{
        display: 'flex',
        alignItems: 'center',
      }"
      :item-style="{
        height: 'auto',
        padding: 'none',
        boxSizing: 'content-box',
      }"
      :keeps="400"
      :data-key="
        (i) => {
          return i[0];
        }
      "
      :data-sources="waveform"
      :estimate-size="5"
      :data-component="Bar"
    /> -->
  </div>
</template>
<script lang="ts" setup>
import { useWaveformGenerator } from "./useWaveform";
import Bar from "./Bar.vue";
import { useVirtualList } from "@vueuse/core";

const props = defineProps<{ videoId: string; testMode?: boolean }>();

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

const a = computed(
  () =>
    waveform.value?.map(([a, b]) => [
      a,
      Math.floor(Math.pow((Math.max(b, -56) + 56) / 56, 3) * 100),
    ]) || []
);
const { list, containerProps, wrapperProps } = useVirtualList(a, {
  itemWidth: 6,
});
</script>
