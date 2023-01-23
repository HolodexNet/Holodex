<template>
  <div style="overflow: auto; height: 50%; font-size: 0.8rem" class="p-2">
    <template v-for="item in tlHistory" :key="item.key">
      <chat-message :source="item" />
      <!-- :hide-author="hideAuthor(index)" -->
    </template>
  </div>
</template>
<script setup lang="ts">
import { useTldex } from "./useTldex";

const props = defineProps<{
  videoId: string;
  lang: string;
}>();

const options = computed(() => ({
  videoId: props.videoId,
  lang: props.lang,
  live: true,
  verified: true,
  moderator: true,
  vtuber: true,
}));
const { loadMessages, tlHistory } = useTldex(options);

watch(
  () => options.value,
  () => {
    console.log("Loading messages...", props);
    loadMessages();
  },
  {
    immediate: true,
  }
);
console.log("teste");
</script>
