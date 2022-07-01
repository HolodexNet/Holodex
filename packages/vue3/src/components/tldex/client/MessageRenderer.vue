<template>
  <v-card-text
    ref="tlBody"
    class="tl-body pa-1 pa-lg-3"
    :style="{
      'font-size': fontSize + 'px',
    }"
    :class="{ 'ios-safari-reverse-fix': isIOS }"
  >
    <transition-group name="fade" :class="{ 'ios-safari-reverse-fix': isIOS }">
      <chat-message
        v-for="(item, index) in tlHistory"
        :key="item.key"
        :source="item"
        :hide-author="hideAuthor(index)"
      />
    </transition-group>
    <!-- Slot for adding a Load More button on top of Messages -->
    <div class="text-center" :class="{ 'ios-safari-reverse-fix': isIOS }">
      <slot />
    </div>
  </v-card-text>
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
      default: 14,
    },
  },
  data() {
    return { isIOS: checkIOS() };
  },
  methods: {
    hideAuthor(index) {
      return !(
        index === 0 ||
        index === this.tlHistory.length - 1 ||
        this.tlHistory[index].name !== this.tlHistory[index - 1].name ||
        !!this.tlHistory[index].breakpoint
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
</style>
