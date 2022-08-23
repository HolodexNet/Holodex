<template>
  <channel-list
    :channels="settings.blockedChannels"
    variant="card"
    grouping="org"
    :slim="true"
  ></channel-list>
</template>
<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
</script>
