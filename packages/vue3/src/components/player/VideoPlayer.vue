<template>
  <youtube-player
    v-if="props.video.type !== 'placeholder'"
    ref="player"
    :video-id="props.video.id"
  ></youtube-player>
  <twitch-player
    v-else-if="props.video.type === 'placeholder' && twitchChannel"
    ref="player"
    :channel-id="twitchChannel"
  ></twitch-player>
</template>
<script lang="ts" setup>
import { TWITCH_VIDEO_URL_REGEX } from "@/utils/consts";
import { VideoPlayer } from "./usePlayer";

const player = ref<VideoPlayer | null>(null);
const props = defineProps<{ video: Partial<Video> & Pick<Video, "id"> }>();

const twitchChannel = computed(() => {
  const match = props.video?.link?.match(TWITCH_VIDEO_URL_REGEX);
  return match?.[1];
});

const currentTime = ref(0);
onMounted(() => {
  setInterval(async () => {
    if (!player?.value) return;
    currentTime.value = await player.value.getCurrentTime();
  }, 1000);
});
defineExpose({ currentTime, player });
</script>
