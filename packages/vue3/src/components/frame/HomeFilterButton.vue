<template>
  <div class="btn-icon btn-sm btn text-lg" @click="click">
    <div class="i-fluent:table-settings-20-regular" />
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
      // settings.homeViewMode = "list"; <-- re enable this line to enable other view modes.
    }
  } else if (settings.homeViewMode === "list") {
    // TODO these are disabled at the moment.
    settings.homeViewMode = "denseList";
  } else if (settings.homeViewMode === "denseList") {
    // TODO these are disabled at the moment.
    settings.homeViewMode = "grid";
  }
};
</script>
