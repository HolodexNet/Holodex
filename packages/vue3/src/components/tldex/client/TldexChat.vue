<template>
  <div style="overflow: auto" class="flex">
    <message-renderer ref="listRenderer" :tl-history="messages">
      <div
        v-if="state?.completed && !props.archive"
        class="text-md py-2 font-bold uppercase opacity-75"
      >
        Start of chat
      </div>
      <button
        v-show="!state?.completed && !state?.loading && !props.archive"
        class="btn-text btn-sm btn !text-primary"
      >
        Load more
      </button>
      <!-- <a
        v-if="
          !state?.loading &&
          !archive &&
          (messagesBlocked > 0 || bypassBlockedFilter)
        "
        class="link block text-xs opacity-75"
        @click="bypassBlockedFilter = !bypassBlockedFilter"
      >
        {{ bypassBlockedFilter ? "Hide" : `View ${messagesBlocked}` }}
        blocked messages
      </a> -->
    </message-renderer>
  </div>
</template>
<script setup lang="ts">
import { useTLStore } from "@/stores/tldex";
import { TLLanguageCode } from "@/utils/consts";
import { useSocket } from "@/stores/socket";
import { RoomIDString } from "@/stores/socket_types";
import sorted from "sorted-array-functions";
import { ChatDB, isMessageCurrent } from "../core/ChatDB";
import MessageRenderer from "./MessageRenderer.vue";

const props = defineProps<{
  videoId: string;
  lang: TLLanguageCode;
  startTime?: Date;
  archive?: boolean; // known to be an archived video. If it's unsure, set unsure.
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
const socketStore = useSocket();
const chatDB = socketStore.chatDB;
const tldexStore = useTLStore();
const listRenderer = ref<typeof MessageRenderer>();

const roomID: ComputedRef<RoomIDString> = computed(
  () => `${props.videoId}/${props.lang}` satisfies RoomIDString,
);
const messages = computed(() => chatDB.rooms.get(roomID.value)?.messages || []);
const state = computed(() => chatDB.rooms.get(roomID.value)?.state);

chatDB.loadMessages(roomID.value, tldexStore, props.archive ? 0 : 30);

const currentMessageIndexes = computed(() => {
  const room = roomID.value;
  const elapsed = chatDB.rooms.get(room)?.elapsed;
  const absolute = chatDB.rooms.get(room)?.absolute;
  console.log(elapsed, absolute);
  if (absolute || elapsed) {
    // gt: => [ 12, 14, 16, 32]
    // current =    15 ^
    // get the IDX of 16, rollback a couple messages and process linearly.
    let highIdx = sorted.gt(
      chatDB.rooms.get(room)?.messages || [],
      { timestamp: (absolute || -1) * 1000 } as any,
      ChatDB.ParsedMessageComparator,
    );
    if (highIdx == -1) highIdx = chatDB.rooms.get(room)?.messages.length || -1;
    const out: number[] = [];
    for (
      let idx = Math.max(0, highIdx - 4);
      idx < Math.min(highIdx, chatDB.rooms.get(room)?.messages.length || 0);
      idx++
    ) {
      if (
        isMessageCurrent(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          chatDB.rooms.get(room)!.messages[idx],
          elapsed,
          absolute,
        )
      ) {
        console.log(idx);
        out.push(idx);
      }
    }

    return out;
  }
  return [];
});

// watchEffect(() => {
//   if (currentMessageIndexes.value?.length) {
//     console.log(currentMessageIndexes.value[0]);
//   }
//   listRenderer.value?.highlightItem(currentMessageIndexes.value);
// });

provide("highlightedIndexes", currentMessageIndexes);

onMounted(() => {
  socketStore.joinRoom(props.videoId, props.lang);
});

onUnmounted(() => {
  socketStore.leaveRoom(props.videoId, props.lang);
});
</script>
