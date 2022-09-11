<template>
  <!-- <youtube-player ref="player" video-id="MdI3VE7Tj8g"></youtube-player> -->
  <video-player v-if="data" ref="playerInstance" :video="data"></video-player>
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
const id = computed(() => route.params.id as string);
const { data, isLoading } = useVideoById(
  route.params.id as string,
  clipLangRef,
  {
    enabled: true,
  }
);
// onMounted(() => {
//   setInterval(async () => {
//     console.log(playerInstance.value?.currentTime);
//     console.log("manual", await playerInstance.value?.player.getCurrentTime());
//   }, 1000);
// });
watchEffect(() => console.log(playerInstance.value?.currentTime));
</script>
