<template>
  <div
    ref="tlBody"
    class="tl-body p-lg-3 w-full p-2"
    :style="{
      'font-size': fontSize + 'px',
    }"
    :class="{
      'ios-safari-reverse-fix': isIOS,
      '!flex-col-reverse': reverse,
    }"
  >
    <transition-group name="fade" :class="{ 'ios-safari-reverse-fix': isIOS }">
      <chat-message
        v-for="(item, index) in tlHistory"
        :key="item.key"
        :source="item"
        :hide-author="hideAuthor(index)"
        class="chat-message"
      />
    </transition-group>
    <!-- Slot for adding a Load More button on top of Messages -->
    <div class="text-center" :class="{ 'ios-safari-reverse-fix': isIOS }">
      <slot />
    </div>
  </div>
</template>

<script>
import { checkIOS } from "@/utils/functions";

export default {
  name: "MessageRenderer",
  props: {
    tlHistory: {
      type: Array,
      default: () => [],
    },
    fontSize: {
      type: Number,
      default: 13,
    },
    reverse: Boolean,
  },
  data() {
    return { isIOS: checkIOS() };
  },
  methods: {
    hideAuthor(index) {
      return !(
        index === 0 ||
        index === this.tlHistory.length - 1 ||
        this.tlHistory[index].name !== this.tlHistory[index - 1].name
      );
    },
    scrollToBottom() {
      if (
        Math.abs(
          this.$refs.tlBody.scrollTop / this.$refs.tlBody.scrollHeight
        ) <= 0.15
      ) {
        this.$refs.tlBody.scrollTop = 0;
      }
    },
  },
};
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
