<template>
  <div class="wf-sub-container pointer-events-none hover:ring">
    <div
      class="handle left-0 top-0 cursor-col-resize"
      @mousedown.stop="$emit('dragHandle', true)"
    />
    <div
      class="pointer-events-auto line-clamp-3 w-full select-none bg-blue-400 bg-opacity-20 px-1"
      @click="$emit('goto', message.video_offset + 0.01)"
      @mousedown.stop="$emit('dragFull')"
    >
      {{ message.message }}
    </div>
    <div
      class="handle right-0 top-0 cursor-col-resize"
      @mousedown.stop="$emit('dragHandle', false)"
    />
  </div>
</template>
<script setup lang="ts">
import type { ParsedMessage } from "@/stores/socket_types";

const props = defineProps<{
  message: ParsedMessage;
}>();

defineEmits<{
  goto: [offset: number];
  dragHandle: [isStartTime: boolean];
  dragFull: [];
}>();
</script>
<style>
.wf-sub-container {
  @apply absolute border-l border-r text-xs font-thin transition-all duration-100 ease-linear;
  line-height: 1;
  height: 90px;
}
.wf-sub-container .handle {
  @apply pointer-events-auto absolute z-10 h-full w-2 bg-blue-300 bg-opacity-10 hover:bg-opacity-50;
}
</style>
