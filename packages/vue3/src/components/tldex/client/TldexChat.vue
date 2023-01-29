<template>
  <div style="overflow: auto; height: 50%" class="flex">
    <message-renderer :tl-history="filteredMessages" :reverse="!archive">
      <div
        v-if="tlHistoryCompleted && !props.archive"
        class="text-md py-2 font-bold uppercase opacity-75"
      >
        Start of chat
      </div>
      <button
        v-show="!tlHistoryCompleted && !tlHistoryLoading && !props.archive"
        class="btn-text-ghost btn-sm btn text-primary"
        @click="loadMessages()"
      >
        Load more
      </button>
      <div class="text-xs opacity-75">
        {{ tlHistory.length - filteredMessages.length }} messages blocked
      </div>
    </message-renderer>
  </div>
</template>
<script setup lang="ts">
import { useTLStore } from "@/stores/tldex";
import { useTldex } from "./useTldex";

const props = defineProps<{
  videoId: string;
  lang: string;
  startTime?: Date;
  archive?: boolean;
}>();

const options = computed(() => ({
  videoId: props.videoId,
  lang: props.lang,
  live: true,
  verified: true,
  moderator: true,
  vtuber: true,
}));
const { loadMessages, tlHistory, tlHistoryCompleted, tlHistoryLoading } =
  useTldex(options);
const tldexStore = useTLStore();
const filteredMessages = computed(() => {
  const messages = props.archive
    ? tlHistory.value
    : [...tlHistory.value].reverse();
  return messages
    .filter((m) => {
      const channelIdBlocked =
        m.channel_id && tldexStore.blockset.has(m.channel_id);
      const nameBlocked = m.channel_id && tldexStore.blockset.has(m.name);
      return !(channelIdBlocked || nameBlocked);
    })
    .map((m) => {
      return {
        ...m,
        ...(props.startTime && { relativeMs: +m.timestamp - +props.startTime }),
      };
    });
});

watch(
  () => [options.value, props.archive],
  () => {
    console.log("Loading messages...", props);
    loadMessages(props.archive);
  },
  {
    immediate: true,
  }
);
</script>
