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
          >{{ formatDurationUpcoming(v.available_at) }}</channel-card
        >
      </template>
      <div
        class="max-w-md p-1 rounded-lg shadow-xl w-60 bg-base-300 shadow-base-100 -ml-6"
      >
        <video-card :video="v"></video-card>
      </div>
    </v-tooltip>
  </template>
  <div style="height: 40px"></div>
</template>
<script setup lang="ts">
import { useVideoListDatasource } from "@/services/video";
import { dayjs, formatDurationShort } from "@/utils/time";

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

const formatDurationUpcoming = function (ts: any) {
  const secs = dayjs(ts).diff(dayjs()) / 1000;
  return formatDurationShort(Math.abs(secs));
};
</script>
