<template>
  <div
    ref="tlBody"
    class="tl-body p-lg-3 w-full p-2"
    :style="{
      'font-size': fontSize + 'px',
    }"
    :class="{}"
  >
    <VirtualList
      v-show="!!tlHistory.length"
      ref="vsl"
      class=""
      style="overflow-y: auto; height: 100%"
      :data-key="'key'"
      :data-sources="tlHistory"
      :data-component="ChatMessage"
      :estimate-size="100"
    >
      <!--       @resized="onItemRendered"
      @totop="onTotop"
 -->
      <!-- <template #header> -->
      <!-- <div v-show="overflow" class="header">
          <div v-show="!finished" class="spinner" />
          <div v-show="finished" class="finished">No More</div>
        </div> -->
      <!-- Header content -->
      <!-- </template> -->
    </VirtualList>
  </div>
</template>

<script lang="ts">
import { ParsedMessage } from "@/stores/socket_types";
import { checkIOS } from "@/utils/functions";
import VirtualList from "vue3-virtual-scroll-list";
import ChatMessage from "./ChatMessage.vue";

export default defineComponent({
  name: "MessageRenderer",
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
  setup() {
    const snapToNow = ref(true);

    return { ChatMessage };
  },
  // data() {
  //   return { isIOS: checkIOS() };
  // },
  methods: {},
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
