<template>
  <template v-for="v in videoList" :key="'sidebar' + v.available_at + v.id">
    <div>
      <v-hover v-slot="{ isHovering, props }">
        <channel-card
          v-bind="props"
          :channel="v.channel"
          slim
          :live="v.status === 'live'"
          class="relative hover:bg-bgColor-300"
          >{{ formatDurationUpcoming(v.available_at) }}
          <template #buttons>
            <v-fade-transition>
              <div
                v-if="isHovering"
                class="absolute right-0 flex h-12 py-0.5 bg-bgColor-300 gap-1 pr-2"
                style="width: 9.5rem"
              >
                <router-link
                  class="flex-shrink h-full rounded basis-3/4 c-card-icon hover:text-primary"
                  target="_blank"
                  title="Watch"
                  :to="`/watch/${v.id}`"
                >
                  <!-- :href="`https://youtube.com/channel/${v.id}`" -->
                  <div class="i-material-symbols:play-arrow-rounded"></div>
                  <!-- <logo class="my-1 h-5/6"></logo> -->
                </router-link>
                <router-link
                  class="h-full mr-1 rounded basis-1/4 c-card-icon hover:text-primary"
                  :to="`/multiview/...?${v.id}`"
                  target="_blank"
                  title="Multiview"
                >
                  <div class="i-clarity:grid-chart-solid"></div>
                </router-link></div
            ></v-fade-transition>
          </template>
        </channel-card>
      </v-hover>
      <v-tooltip activator="parent">
        <div
          class="max-w-md p-1 -ml-6 border-2 rounded-lg shadow-xl w-60 bg-bgColor shadow-bgColor border-secondary"
        >
          <v-lazy><video-card :video="v"></video-card></v-lazy>
        </div>
      </v-tooltip>
    </div>
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
