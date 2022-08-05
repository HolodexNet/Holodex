<template>
  <template
    v-for="v in videoQuery.data?.value?.items?.slice(0, 10)"
    :key="'sidebar' + v.available_at + v.id"
  >
    <v-tooltip>
      <template #activator="{ props }">
        <channel-card
          v-bind="props"
          :channel="v.channel"
          slim
          :live="v.status === 'live'"
        ></channel-card>
      </template>
      <div
        class="max-w-md p-1 rounded-lg shadow-xl w-60 bg-base-300 shadow-base-100"
      >
        <video-card :video="v" class=""></video-card>
      </div>
    </v-tooltip>
  </template>
  <div style="height: 40px"></div>
</template>
<script setup lang="ts">
import { useVideoListDatasource } from "@/services/video";

const lookupState = ref({
  flavor: { favorites: true },
  type: "stream_schedule",
  statuses: undefined,
  pagination: undefined,
});

const videoQuery = useVideoListDatasource(
  lookupState as any,
  ref({ enabled: true })
);
</script>
