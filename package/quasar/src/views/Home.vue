<template>
  <video-card-grid>
    <template v-for="video in videos" :key="video.id">
      <video-card :video="video" />
    </template>
  </video-card-grid>
</template>
<script setup lang="ts">
import { useLive } from "@/services/video";

const liveQuery = useLive({
  status: "live,upcoming",
  org: "Hololive",
  max_upcoming_hours: 48,
  sort: "available_at",
  order: "asc",
  include: "live_info",
});

const { data: videos } = toRefs(liveQuery);
</script>
<style></style>
