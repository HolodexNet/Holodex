<template>
  <div
    class="tle-sidebar flex h-full flex-col rounded-lg border border-bgColor-100"
  >
    <div
      class="flex h-6 flex-nowrap items-center gap-1 border-b border-b-bgColor-50 px-1"
    >
      <div class="shrink-0 basis-4 text-sm">
        <div :class="icons.sidebar_settings" />
      </div>
      <div class="ts flex w-20 flex-col">
        <b class="text-center text-sm">Timing</b>
      </div>
      <div
        class="my-0 h-full w-0 overflow-clip border-l border-solid border-bgColor-50"
      />
      <div class="subs">
        <b class="text-center text-sm">Text {{ currentMessageIndexes }}</b>
      </div>
    </div>
    <div class="h-full" v-bind="containerProps">
      <div v-bind="wrapperProps">
        <Subtitle
          v-for="item in list"
          :key="`sbar_${item.index}`"
          v-model="item.data"
          :current="currentMessageIndexes.includes(item.index)"
          :focus="focused == item.data"
          @ts-changed="chatDB.sortRoom(roomId)"
          @click="focus(item)"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSocket } from "@/stores/socket";
import { ParsedMessage, RoomIDString } from "@/stores/socket_types";
import { mdiRoomService } from "@mdi/js";
import { UseVirtualListItem, useVirtualList } from "@vueuse/core";
import sorted from "sorted-array-functions";
import { ChatDB, isMessageCurrent } from "../../core/ChatDB";

const props = defineProps<{ roomId: RoomIDString }>();
const chatDB = useSocket().chatDB;
const messages = computed(() => chatDB.rooms.get(props.roomId)?.messages ?? []);
const focused = ref<ParsedMessage>();
function focus(item: UseVirtualListItem<ParsedMessage>) {
  if (focused.value == item.data) focused.value = undefined;
  else focused.value = item.data;
}

const currentMessageIndexes = computed(() => {
  const room = props.roomId;
  const elapsed = chatDB.rooms.get(room)?.elapsed;
  const absolute = chatDB.rooms.get(room)?.absolute;
  // console.log(elapsed, absolute);
  if (absolute || elapsed) {
    // gt: => [ 12, 14, 16, 32]
    // current =    15 ^
    // get the IDX of 16, rollback a couple messages and process linearly.
    let highIdx = sorted.gt(
      chatDB.rooms.get(room)?.messages || [],
      { video_offset: elapsed } as any,
      ChatDB.ParsedMessageOFFSETComparator
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
          absolute
        )
      ) {
        // console.log(idx);
        out.push(idx);
      }
    }

    return out;
  }
  return [];
});

const { containerProps, wrapperProps, scrollTo, list } = useVirtualList(
  messages,
  {
    itemHeight: 64,
    overscan: 4,
  }
);

watch(
  () => currentMessageIndexes,
  () => {
    if (focused.value) return;
    if (currentMessageIndexes.value.length > 0) {
      scrollTo(currentMessageIndexes.value?.[0]);
    }
  },
  { deep: true }
);
</script>
<style lang="scss">
.tle-sidebar {
  .ops div {
    @apply cursor-pointer hover:text-primary;
  }
  .ts {
    @apply shrink-0 grow-0;
  }
  .subs {
    @apply grow;
  }
}
</style>
