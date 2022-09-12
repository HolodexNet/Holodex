<template>
  <!-- This wrapper div is very important else it causes an insertBefore error -->
  <div>
    <youtube-player
      v-if="props.video?.type !== 'placeholder'"
      ref="player"
      :video-id="props.video.id"
      v-on="events"
    ></youtube-player>
    <twitch-player
      v-else-if="props.video?.type === 'placeholder' && twitchChannel"
      ref="player"
      :channel-id="twitchChannel"
      v-on="events"
    ></twitch-player>
  </div>
</template>
<script lang="ts" setup>
/**
  Top Level Player Abstraction for a Holodex Video object
*/

import { TWITCH_VIDEO_URL_REGEX } from "@/utils/consts";
import { VideoPlayer } from "./usePlayer";
const player = ref<VideoPlayer | null>(null);
const props = defineProps<{
  video: Partial<Video> & Pick<Video, "id">;
  disableReactiveVariable?: boolean;
  refreshIntervalMs?: number;
}>();

const twitchChannel = computed(() => {
  const match = props.video?.link?.match(TWITCH_VIDEO_URL_REGEX);
  return match?.[1];
});

// Common emits to pass through
const emit = defineEmits(["ready", "error", "ended", "playing", "paused"]);
const events = {
  ready: (e: any) => emit("ready", e),
  error: (e: any) => emit("error", e),
  ended: (e: any) => emit("ended", e),
  playing: (e: any) => emit("playing", e),
  paused: (e: any) => emit("paused", e),
};

// Reactively binded with refresh

const currentTime = ref(0);
const muted = ref(false);
const volume = ref(50);

// TODO: maybe streamline later?
// const playing = ref(false);
// const paused = ref(true);
// const ended = ref(false);

async function refreshPlayerValues() {
  if (player.value) {
    // Parallelize this async calls for speed,
    // helps prevent player.value undefined when unmounting mid way through a call
    const [t, m, v] = await Promise.all([
      player.value.getCurrentTime(),
      player.value.getMuted(),
      player.value.getVolume(),
    ]);
    currentTime.value = t;
    muted.value = m;
    volume.value = v;
  }
}

const timer = ref<number | null>(null);
watchEffect(async (onCleanup) => {
  if (!props.disableReactiveVariable) {
    timer.value = setInterval(
      refreshPlayerValues,
      props.refreshIntervalMs || 500
    );
  }
  onCleanup(() => {
    if (timer.value) clearInterval(timer.value);
  });
});
defineExpose(readonly({ currentTime, player, muted, volume }));
</script>
