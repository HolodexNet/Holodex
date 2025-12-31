<template>
  <div class="wf-sub-container pointer-events-none hover:ring-3">
    <div
      class="handle top-0 left-0 cursor-col-resize"
      @mousedown.stop="$emit('dragHandle', true)"
    />
    <div
      class="bg-opacity-20 pointer-events-auto line-clamp-3 w-full bg-blue-400 px-1 select-none"
      @click="$emit('goto', message.video_offset + 0.01)"
      @mousedown.stop="$emit('dragFull')"
    >
      {{ message.message }}
    </div>
    <div
      class="handle top-0 right-0 cursor-col-resize"
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
  position: absolute;
  border-left: 1px solid;
  border-right: 1px solid;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 100;
  transition: all 100ms linear;
  line-height: 1;
  height: 90px;
}
.wf-sub-container .handle {
  pointer-events: auto;
  position: absolute;
  z-index: 10;
  height: 100%;
  width: 0.5rem;
  background-color: rgba(147, 197, 253, 0.1);
  &:hover {
    background-color: rgba(147, 197, 253, 0.5);
  }
}
</style>
