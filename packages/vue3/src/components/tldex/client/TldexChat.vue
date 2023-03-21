<template>
  <div style="overflow: auto" class="flex">
    <message-renderer :tl-history="filteredMessages" :reverse="!archive">
      <div
        v-if="tlHistoryCompleted && !props.archive"
        class="text-md py-2 font-bold uppercase opacity-75"
      >
        Start of chat
      </div>
      <button
        v-show="!tlHistoryCompleted && !tlHistoryLoading && !props.archive"
        class="btn-text btn-sm btn !text-primary"
        @click="loadMessages()"
      >
        Load more
      </button>
      <a
        v-if="
          !tlHistoryLoading &&
          !archive &&
          (messagesBlocked > 0 || bypassBlockedFilter)
        "
        class="link block text-xs opacity-75"
        @click="bypassBlockedFilter = !bypassBlockedFilter"
      >
        {{ bypassBlockedFilter ? "Hide" : `View ${messagesBlocked}` }}
        blocked messages
      </a>
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
// Allow temporary bypass filter togggle
const bypassBlockedFilter = ref(false);
const { loadMessages, tlHistory, tlHistoryCompleted, tlHistoryLoading } =
  useTldex(options);
const tldexStore = useTLStore();
const filteredMessages = computed(() => {
  const messages = props.archive
    ? tlHistory.value
    : [...tlHistory.value].reverse();
  return messages
    .filter((m) => {
      if (bypassBlockedFilter.value) {
        return true;
      }
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

const messagesBlocked = computed(
  () => tlHistory.value.length - filteredMessages.value.length
);

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
