<template>
  <div style="overflow: auto" class="flex">
    <message-renderer :tl-history="messages">
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
import { RoomIDString } from "../core/ChatDB";

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
const room = socketStore.chatDB;
const tldexStore = useTLStore();

const roomID: ComputedRef<RoomIDString> = computed(
  () => `${props.videoId}/${props.lang}` satisfies RoomIDString
);
const messages = computed(() => room.rooms.get(roomID.value) || []);
const state = computed(() => room.roomState.get(roomID.value));

room.loadMessages(roomID.value, tldexStore, props.archive ? 0 : 30);

onMounted(() => {
  socketStore.joinRoom(props.videoId, props.lang);
});

onUnmounted(() => {
  socketStore.leaveRoom(props.videoId, props.lang);
});
</script>
