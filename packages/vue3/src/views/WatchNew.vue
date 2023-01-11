<template>
  <div v-if="id && video" class="flex">
    <div class="flex flex-1">
      <div class="flex flex-col flex-1">
        <watch-channel-bar :video="video" />
        <video-player ref="playerInstance" :video="video"></video-player>
      </div>
      <div class="w-[340px]">
        <live-chat :video="video" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PlayerRef } from "@/components/player/usePlayer";
import { useVideoById } from "@/services/video";
const route = useRoute();
const playerInstance = ref<PlayerRef | null>(null);
const clipLangRef = computed(() => ({
  // lang: langStore.clipLangsCSV,
  c: "1",
}));
const id = computed(() =>
  route.name === "Watch" ? (route.params.id as string) : ""
);
const { data: video, isLoading } = useVideoById(id, clipLangRef, {
  enabled: computed(() => !!id.value),
});
watchEffect(() => console.log(playerInstance.value?.currentTime));
</script>
