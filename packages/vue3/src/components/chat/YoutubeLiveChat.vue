<template>
  <!-- :style="scaledStyle" -->
  <iframe
    ref="ytChat"
    :src="liveChatUrl"
    frameborder="0"
    @load="updateFrameTime(currentTime || 0)"
  />
</template>
<script lang="ts" setup>
const props = defineProps<{
  videoId: string;
  archive: boolean;
  channelId?: string;
  currentTime?: number;
}>();
const ytChat = ref<HTMLIFrameElement | null>(null);

function updateFrameTime(t: number) {
  if (props.archive && props.channelId) {
    ytChat.value?.contentWindow?.postMessage(
      { "yt-player-video-progress": t },
      "*"
    );
  }
}

watch(
  () => props.currentTime,
  (t) => {
    updateFrameTime(t || 0);
  }
);
const liveChatUrl = computed(() => {
  console.log("archive", props.archive);
  const query = {
    v: props.videoId,
    embed_domain: window.location.hostname,
    // TODO: fix me
    // dark_theme: this.$vuetify.theme.dark ? "1" : "0",
    ...(props.archive && { c: props.channelId }),
  };
  const q = new URLSearchParams(query).toString();
  if (props.archive) {
    return `https://www.youtube.com/redirect_replay_chat?${q}`;
  }
  return `https://www.youtube.com/live_chat?${q}`;
});
</script>
