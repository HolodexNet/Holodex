<template>
  <video-card-grid>
    <template v-for="video in videos" :key="video.id">
      <video-card :video="video" />
    </template>
  </video-card-grid>
</template>
<script setup lang="ts">
import { useLive } from "@/services/video";
import { useSiteStore } from "@/stores";
const site = useSiteStore();
const query = computed(() => ({
  status: "live,upcoming",
  org: site.currentOrg.name,
  max_upcoming_hours: 48,
  sort: "available_at",
  order: "asc",
  include: "live_info",
}));
const liveQuery = useLive(query);

const { data: videos } = toRefs(liveQuery);
</script>
<style></style>
