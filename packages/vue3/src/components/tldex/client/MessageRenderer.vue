<template>
  <div
    ref="tlBody"
    class="tl-body p-lg-3 relative w-full p-2"
    :style="{
      'font-size': fontSize + 'px',
    }"
    :class="{}"
  >
    <!-- TODO: add search box to VirtualList -->
    <VirtualList
      v-show="!!tlHistory.length"
      ref="vsl"
      class=""
      style="overflow-y: auto; height: 100%"
      :data-key="'key'"
      :data-sources="tlHistory"
      :data-component="ChatMessage"
      :estimate-size="100"
      @scroll="logProps"
    >
      <!--       @resized="onItemRendered"
      @totop="onTotop"
 -->
      <template #header>
        <slot />
      </template>
      <!-- <div v-show="overflow" class="header">
          <div v-show="!finished" class="spinner" />
          <div v-show="finished" class="finished">No More</div>
        </div> -->
      <!-- Header content -->
      <!-- </template> -->
    </VirtualList>
    <div
      class="btn-secondary btn-circle btn absolute bottom-8 right-8 p-0 text-2xl text-opacity-40 hover:text-opacity-80"
      @click="snapped = true"
    >
      <div class="i-bx:reset" />
    </div>
    <h-dialog v-model="channelBlock.showBlockChannelDialog">
      <div v-if="channelBlock.name" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{{ channelBlock.name }}</h2>
          <div class="card-actions">
            <button
              v-if="channelBlock.channel_id"
              class="btn-md btn mr-1 bg-red-500 text-white"
              :href="`https://youtube.com/channel/${channelBlock.channel_id}`"
              target="_blank"
            >
              <div class="i-mdi:youtube text-xl" />
              Youtube
            </button>
            <button
              v-if="channelBlock.channel_id && channelBlock.is_vtuber"
              :href="`https://holodex.net/channel/${channelBlock.channel_id}`"
              target="_blank"
              class="btn mr-1 bg-secondary-400 text-white"
            >
              Holodex
            </button>
            <button
              class="btn-warning btn mr-1"
              @click="toggleBlockName(channelBlock.name)"
            >
              {{
                !tldexStore.blockset.has(channelBlock.name)
                  ? "Block"
                  : "Unblock"
              }}
            </button>
          </div>
        </div>
      </div>
    </h-dialog>
  </div>
</template>

<script lang="ts">
import { ParsedMessage } from "@/stores/socket_types";
// import { checkIOS } from "@/utils/functions";
import VirtualList from "vue3-virtual-scroll-list";
import ChatMessage from "./ChatMessage.vue";
import { useSocket } from "@/stores/socket";
import { useTLStore } from "@/stores/tldex";

export default defineComponent({
  name: "ListMessageRenderer",
  components: {
    VirtualList,
  },
  props: {
    tlHistory: {
      type: Array as PropType<ParsedMessage[]>,
      default: () => [],
    },
    fontSize: {
      type: Number,
      default: 13,
    },
    reverse: Boolean,
  },
  setup(props, context) {
    const snapped = ref(true);
    const highlightedIndexes = ref<number[]>([]);
    const vsl = ref<typeof VirtualList>(null);
    const tldexStore = useTLStore();

    const channelBlock: Ref<{
      showBlockChannelDialog: boolean;
      channel_id?: string;
      name: string;
      is_vtuber?: boolean;
    }> = ref({
      showBlockChannelDialog: false,
      channel_id: undefined,
      name: "",
      is_vtuber: false,
    });

    function openBlockDialog(
      name: string,
      channel_id?: string,
      is_vtuber?: boolean
    ) {
      channelBlock.value.showBlockChannelDialog = true;
      channelBlock.value.channel_id = channel_id;
      channelBlock.value.name = name;
      channelBlock.value.is_vtuber = is_vtuber;
    }

    provide("showChannelBlockDialog", {
      openBlockDialog,
    });

    function highlightItem(indexes: number[]) {
      // scroll to the item at index
      highlightedIndexes.value = indexes;
      if (snapped && indexes.length > 0) {
        vsl.value?.scrollToIndex(Math.max(...indexes));
        console.log("scrolling to: ", Math.max(...indexes));
      }
    }

    provide("highlightedIndexes", highlightedIndexes);
    context.expose({ highlightItem });

    function toggleBlockName(name: string) {
      tldexStore.toggleBlocked(name);
      console.log(tldexStore.blockset);
    }

    return {
      ChatMessage,
      channelBlock,
      toggleBlockName,
      tldexStore,
      vsl,
      snapped,
      highlightedIndexes,
    };
  },
  methods: {
    logProps(...props: any) {
      console.log(...props);
    },
  },
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.ios-safari-reverse-fix {
  transform: scale(1, -1);
  flex-direction: column !important;
}

.tl-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  /* height: calc(100% - 32px); */
  flex-direction: column;
  display: flex;
  line-height: 1.35;
  letter-spacing: 0.0178571429em !important;
}

.tl-body .chat-message {
  padding: 2px 0px;
}
</style>
