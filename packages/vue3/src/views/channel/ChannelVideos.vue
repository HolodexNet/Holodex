<template>
  <div class="p-4">
    <video-card-grid>
      <template
        v-for="video in videoResponse.data.value?.items"
        :key="video.id"
      >
        <video-card :video="video" />
      </template>
    </video-card-grid>
    <div v-if="videoResponse.isLoading.value" class="flex h-20">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="64"
        class="m-auto"
      ></v-progress-circular>
    </div>
    <div
      v-else-if="videoResponse.data.value?.total"
      class="flex items-center justify-center h-20"
    >
      <h-pagination
        v-model="page"
        :total-pages="Math.ceil((videoResponse.data.value?.total ?? 0) / 24)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useVideoListDatasource } from "@/services/video";
import { useUrlSearchParams } from "@vueuse/core";
import { Ref } from "vue";

const params = useUrlSearchParams("history");
const page = ref(+params.page || 1);

const router = useRouter();
const route = useRoute();
const dsConfig: Ref<VideoListLookup> = computed(
  () =>
    ({
      flavor: { channelId: route.params.id },
      type:
        (route.name === "channel" && "videos") ||
        (route.name === "channel_clips" && "clip") ||
        (route.name === "channel_collabs" && "collabs") ||
        "videos",
      filter: undefined, // to, from
      pagination: { pageSize: 24, offset: (page.value - 1) * 24 },
    } as VideoListLookup)
);

const syncPageParam = () => {
  router.replace({
    query: {
      ...route.query,
      page: page.value,
    },
  });
};
watch(
  () => page.value,
  () => {
    window.scrollTo({ top: 0 });
    syncPageParam();
  }
);

watch(
  () => route.name,
  () => {
    page.value = 1;
    syncPageParam();
  }
);

const videoResponse = useVideoListDatasource(dsConfig, ref({ enabled: true }));
</script>
