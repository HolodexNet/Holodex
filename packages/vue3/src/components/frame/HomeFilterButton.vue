<template>
  <div class="btn btn-text-ghost btn-sm text-lg" @click="click">
    <div class="i-fluent:table-settings-20-regular"></div>
  </div>
</template>
<script setup>
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();

const click = () => {
  if (settings.homeViewMode === "grid") {
    if (settings.gridDensity < 2) {
      settings.gridDensity += 1;
    } else {
      settings.gridDensity = 0;
      settings.homeViewMode = "list";
    }
  } else if (settings.homeViewMode === "list") {
    settings.homeViewMode = "denseList";
  } else if (settings.homeViewMode === "denseList") {
    settings.homeViewMode = "grid";
  }
};
</script>
