<template>
  <v-card-text
    ref="tlBody"
    class="tl-body pa-1 pa-lg-3"
    :style="{
      'font-size': fontSize + 'px',
    }"
    :class="{'ios-safari-reverse-fix': checkIOS() }"
  >
    <transition-group name="fade" :class="{'ios-safari-reverse-fix': checkIOS() }">
      <template v-for="(item, index) in tlHistory">
        <chat-message
          :key="item.key"
          :source="item"
          :hide-author="hideAuthor(item, index)"
        />
      </template>
    </transition-group>
    <!-- Slot for adding a Load More button on top of Messages -->
    <div class="text-center" :class="{'ios-safari-reverse-fix': checkIOS() }">
      <slot />
    </div>
  </v-card-text>
</template>

<script>
import { checkIOS } from "@/utils/functions";
import ChatMessage from "./ChatMessage.vue";

export default {
    name: "MessageRenderer",
    components: { ChatMessage },
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
    methods: {
        checkIOS,
        hideAuthor(item, index) {
            return !(index === 0
                || index === this.tlHistory.length - 1
                || item.name !== this.tlHistory[index - 1].name
                || !!item.breakpoint);
        },
        scrollToBottom() {
            if (Math.abs(this.$refs.tlBody.scrollTop / this.$refs.tlBody.scrollHeight) <= 0.15) {
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
  transform: scale(1,-1);
  flex-direction: column !important;
}
</style>
