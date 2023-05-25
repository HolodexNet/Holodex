<template>
  <div>
    <h-btn @click="init">Generate Waveform</h-btn>
    <video-player v-if="videoId && testMode" :video="{ id: videoId }" />
  </div>
</template>
<script lang="ts" setup>
import { useWaveformGenerator } from "./useWaveform";

const props = defineProps<{ videoId: string; testMode?: boolean }>();

const {
  error_message,
  format,
  latchAndRun,
  stage,
  progress,
  totalSize,
  waveform,
} = useWaveformGenerator(props.videoId);

function init() {
  setTimeout(latchAndRun, 5000);
}
</script>
