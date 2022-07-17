<template>
  <div class="video-card-grid" :style="gridStyle">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
const maxWidth = ["310px", "270px", "230px"];
const gridColumnGap = ["20px", "10px", "10px"];

const gridStyle = computed(() => {
  return {
    "grid-template-columns": `repeat(auto-fit, minmax(${
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
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
}

/* Separate live from past videos */
.video-card-live + .video-card:not(.video-card-live) {
  grid-column-start: 1;
  &::after {
    content: "";
    display: inline-block;
    cursor: pointer;
    width: calc(100% - 32px);
    position: absolute;
    transform: translateY(-10px);
    border-bottom: 1px solid hsla(var(--n));
    z-index: 1;
  }
}
</style>
