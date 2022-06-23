<template>
  <div>
    <v-btn @click="cycle">Cycle Grid Density</v-btn>
    <div class="video-card-grid" :style="gridStyle">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
const maxWidth = ["310px", "270px", "230px"];
const gridColumnGap = ["20px", "10px", "10px"];
const cycle = () => {
  settings.gridDensity = (settings.gridDensity + 1) % 3;
};
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
<style>
.video-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
}
</style>
