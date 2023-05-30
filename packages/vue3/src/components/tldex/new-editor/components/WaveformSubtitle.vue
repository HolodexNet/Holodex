<template>
  <div class="wf-sub-container hover:ring">
    <div class="handle left-0 top-0 cursor-col-resize" />
    <div class="line-clamp-3 w-full bg-blue-400 bg-opacity-20 px-1">
      {{ message.message }}
    </div>
    <div class="handle right-0 top-0 cursor-col-resize" />
  </div>
</template>
<script setup lang="ts">
import type { ParsedMessage } from "@/stores/socket_types";

const props = defineProps<{
  message: ParsedMessage;
}>();
</script>
<style>
.wf-sub-container {
  @apply pointer-events-auto absolute border-l border-r text-xs font-thin transition-all duration-100 ease-linear;
  line-height: 1;
  height: 90px;
}
.wf-sub-container .handle {
  @apply absolute z-10 h-full w-2 bg-blue-300 bg-opacity-10 hover:bg-opacity-50;
}
</style>
