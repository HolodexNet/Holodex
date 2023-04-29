<template>
  <template v-for="v in videoList" :key="'sidebar' + v.available_at + v.id">
    <div>
      <h-tooltip placement="right" :offset="20" class="w-full">
        <div
          class="-ml-6 w-60 max-w-md rounded-lg border-2 border-secondary bg-bgColor p-1 shadow-xl shadow-bgColor"
        >
          <h-lazy><video-card :video="v" /></h-lazy>
        </div>
        <template #activator>
          <channel-card
            :channel="v.channel"
            slim
            no-link
            :live="v.status === 'live'"
            class="relative hover:bg-bgColor-300"
          >
            {{ formatDurationUpcoming(v.available_at) }}
            <!-- TODO refactor to a component and use the event hooks from popper -->
            <!-- <template #buttons>
                <div
                  class="absolute right-0 left-14 flex h-12 gap-1 bg-bgColor-300 px-2 py-0.5"
                  style="width: 9.5rem"
                >
                  <router-link
                    class="c-card-icon h-full flex-shrink basis-3/4 rounded hover:text-primary"
                    title="Watch"
                    :to="`/watch/${v.id}`"
                  >
                    <div :class="icons.playlist"></div>
                  </router-link>
                  <router-link
                    class="c-card-icon mr-1 h-full basis-1/4 rounded hover:text-primary"
                    :to="`/multiview/...?${v.id}`"
                    title="Multiview"
                  >
                    <div class="i-clarity:grid-chart-solid"></div>
                  </router-link></div
            </template> -->
          </channel-card>
        </template>
      </h-tooltip>
    </div>
  </template>
  <div style="height: 40px" />
</template>
<script setup lang="ts">
import { useClient } from "@/hooks/auth/client";
import { useVideoListDatasource } from "@/services/video";
import { useVideoFilter } from "@/services/video-filter";
import { dayjs, formatDurationShort } from "@/utils/time";
const { isLoggedIn } = useClient();

const lookupState = ref<VideoListLookup>({
  flavor: { favorites: true } satisfies FavLookup,
  type: "stream_schedule",
  statuses: undefined,
  pagination: undefined,
});

const videoQuery = useVideoListDatasource(
  lookupState as any,
  ref({ enabled: isLoggedIn })
);

const formatDurationUpcoming = function (ts: any) {
  const secs = dayjs(ts).diff(dayjs()) / 1000;
  return formatDurationShort(Math.abs(secs));
};

const videos = useVideoFilter(videoQuery.data, lookupState);

const videoList = computed(() => {
  const firstUpcoming = videos.value.findIndex((x) => x.status === "upcoming");
  return videos.value
    ?.slice(0, Math.max(50, (firstUpcoming ?? 0) + 3))
    .filter((x) => dayjs(x.available_at).diff(dayjs()) < 172800000); //48 hours cutoff?
});
</script>
