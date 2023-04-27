<template>
  <div ref="grid" class="p-4" style="scroll-margin-top: 220px">
    <video-card-grid>
      <template v-for="video in videosToShow" :key="video.id">
        <video-card
          :video="video"
          hide-channel-image
          :hide-channel-name="route.name === 'Channel'"
        />
      </template>
    </video-card-grid>
    <div v-if="videoQuery.isLoading.value" class="flex h-20">
      <logo loading class="w-32" />
    </div>
    <div
      v-else-if="videoQuery.data.value?.total"
      class="flex h-20 items-center justify-center"
    >
      <h-pagination
        v-model="page"
        :total-pages="Math.ceil((videoQuery.data.value?.total ?? 0) / 24)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useVideoListDatasource } from "@/services/video";
import { useVideoFilter } from "@/services/video-filter";
import { useUrlSearchParams } from "@vueuse/core";
import { Ref } from "vue";

const grid = ref<HTMLDivElement | null>(null);

const params = useUrlSearchParams("history");
const page = computed({
  get: () => +params.page || 1,
  set: (v) => {
    params.page = `${v}`;
  },
});
const route = useRoute();
const dsConfig: Ref<VideoListLookup> = computed(
  () =>
    ({
      flavor: { channelId: route.params.id },
      type:
        (route.name === "Channel" && "videos") ||
        (route.name === "Channel_Clips" && "clip") ||
        (route.name === "Channel_Collabs" && "collabs") ||
        "videos",
      filter: undefined, // to, from
      pagination: { limit: 24, offset: (page.value - 1) * 24 },
    } as VideoListLookup)
);

watch(
  () => dsConfig.value,
  () => {
    console.log(dsConfig.value, route.name);
  }
);

watch(
  () => page.value,
  () => {
    grid.value && grid.value.scrollIntoView({ behavior: "smooth" });
  }
);

watch(
  () => route.name,
  () => {
    page.value = 1;
  }
);

const videoQuery = useVideoListDatasource(dsConfig, ref({ enabled: true }));
const videosToShow = useVideoFilter(videoQuery.data, dsConfig);
</script>
