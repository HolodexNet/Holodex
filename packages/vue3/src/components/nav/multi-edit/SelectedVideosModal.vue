<template>
  <Teleport to="#h-floating-container">
    <Transition name="fade-pop" :duration="500">
      <div
        v-if="modelValue"
        id="selected-video-list"
        class="pointer-events-none fixed z-50 flex max-h-full w-full overflow-y-auto overflow-x-hidden p-4 pb-20 transition-opacity transition-transform md:inset-0"
      >
        <h-card
          class="pointer-events-auto mx-auto max-h-[80vh] w-full self-center overflow-scroll scroll-auto"
          style="max-width: min(100vw, 32em)"
        >
          <div class="card-body">
            <div class="card-title flex-row">
              <h4>Selected</h4>
              <h-btn
                class="self-end"
                :icon="icons.close"
                @click="$emit('update:model-value', false)"
              />
            </div>
            <h-divider />
            <video-card-virtual-list-2
              class="w-full p-2"
              :videos="selection.selectedVideos"
            />
          </div>
        </h-card>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { useVideoSelection } from "@/stores/selection";

const props = defineProps<{ modelValue: boolean }>();
const emits = defineEmits(["update:model-value"]);

const selection = useVideoSelection();
</script>
