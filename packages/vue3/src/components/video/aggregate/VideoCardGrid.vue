<template>
  <div class="video-card-grid" :style="gridStyle" role="list">
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
const maxWidth = ["300px", "260px", "220px"];
const gridColumnGap = ["16px", "12px", "8px"];

const gridStyle = computed(() => {
  return {
    "grid-template-columns": `repeat(auto-fill, minmax(${
      maxWidth[settings.gridDensity]
    }, 1fr))`,
    "grid-column-gap": gridColumnGap[settings.gridDensity],
    "grid-row-gap": gridColumnGap[settings.gridDensity],
  };
});
</script>
<style lang="scss">
.video-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
}

/* Separate live from past videos */
.video-card-live + .video-card:not(.video-card-live) {
  grid-column-start: 1;
  &::after {
    grid-column: 1/-1;
    content: "";
    display: inline-block;
    width: calc(100% - 32px);
    position: absolute;
    transform: translateY(-10px) translateX(-32px);
    border-bottom: 1px solid;
    @apply border-base-content opacity-30;
    z-index: 1;
  }
}
// No Firefox support, but it's additive so just looks better on Chrome/Safari :P
.video-card-live:has(+ .video-card:not(.video-card-live)) {
  padding-bottom: 8px;
}
</style>
