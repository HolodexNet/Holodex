<template>
  <template v-for="v in videoList" :key="'sidebar' + v.available_at + v.id">
    <v-tooltip>
      <template #activator="{ props }">
        <channel-card
          v-bind="props"
          :channel="v.channel"
          slim
          :live="v.status === 'live'"
          class="hover:text-secondary-content hover:border-r-4 border-secondary"
          >{{ formatDurationUpcoming(v.available_at) }}</channel-card
        >
      </template>
      <div
        class="max-w-md p-1 -ml-6 border-2 rounded-lg shadow-xl w-60 bg-base shadow-base-100 border-secondary"
      >
        <v-lazy><video-card :video="v"></video-card></v-lazy>
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

const videoList = computed(() => {
  const firstUpcoming = videoQuery.data?.value?.items?.findIndex(
    (x) => x.status === "upcoming"
  );
  return videoQuery.data?.value?.items?.slice(
    0,
    Math.max(50, (firstUpcoming ?? 0) + 3)
  );
});
</script>
