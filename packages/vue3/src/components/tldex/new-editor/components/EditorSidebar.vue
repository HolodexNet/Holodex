<template>
  <div class="flex h-full flex-col rounded-lg border border-bgColor-100">
    <div>Title and Header is here</div>
    <div class="h-full" v-bind="containerProps">
      <div v-bind="wrapperProps">
        <Subtitle
          v-for="item in list"
          :key="`sbar_${item.index}`"
          v-model="item.data"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSocket } from "@/stores/socket";
import { RoomIDString } from "@/stores/socket_types";
import { useVirtualList } from "@vueuse/core";

const props = defineProps<{ roomId: RoomIDString }>();
const ChatDB = useSocket().chatDB;
const messages = computed(() => ChatDB.rooms.get(props.roomId)?.messages ?? []);

const { containerProps, wrapperProps, scrollTo, list } = useVirtualList(
  messages,
  {
    itemHeight: 64,
    overscan: 4,
  }
);
</script>
