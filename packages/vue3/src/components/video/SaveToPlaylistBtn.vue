<template>
  <div
    class="rounded-sm"
    :class="{
      'hover-show': !hasSaved,
    }"
    role="img"
    @click.prevent.stop="toggleSaved(video)"
  >
    <div
      :class="{
        [icons.check + ' bg-primary']: hasSaved,
        [icons.plusBox + ' bg-white']: !hasSaved,
      }"
    />
  </div>
</template>
<script setup lang="ts">
import { useTogglePlaylistVideo } from "@/stores/playlist";

const props = defineProps<{
  video: VideoRef;
}>();

const { toggleSaved, idSet } = useTogglePlaylistVideo();
const hasSaved = computed(() => idSet.value?.has(props.video.id));
</script>
