<template>
  <div
    class="flex h-16 flex-nowrap items-center gap-1 border-b border-b-bgColor-50 px-1"
  >
    <div class="ops shrink-0 basis-4 text-sm">
      <div :class="icons.trash" class="" />
      <div class="i-ri:merge-cells-vertical my-1" />
      <div class="i-tabler:row-insert-bottom" />
    </div>
    <div class="ts flex w-20 flex-col">
      <!-- <input class="input input-xs" :value="modelValue?.video_offset" /> -->
      <DraggableNumber
        v-model="modelValue.video_offset"
        :scale="0.1"
        horizontal
        :precision="2"
        :formatter="(n) => formatDuration(n * 1000.0, 1)"
        class="self-center text-xs"
      >
        {{ formatDuration((modelValue?.video_offset || 0) * 1000) }}
      </DraggableNumber>
      <DraggableNumber
        v-model="modelValue.duration"
        :scale="2"
        horizontal
        :precision="0"
        :formatter="(n) => (n / 1000).toFixed(1)"
        class="mt-1 self-center"
      />
      <!-- <input class="input input-xs" value="1325" /> -->
    </div>
    <div
      class="my-0 h-full w-0 overflow-clip border-l border-solid border-bgColor-50"
    />
    <div class="subs">
      <EditableText v-model="modelValue.message" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ParsedMessage } from "@/stores/socket_types";
import { formatDuration } from "@/utils/time";

const modelValue = defineModel<ParsedMessage>({ required: true });
</script>
<style>
.ops div {
  @apply cursor-pointer hover:text-primary;
}
.ts {
  @apply shrink-0 grow-0;
}
.subs {
  @apply grow;
}
</style>
