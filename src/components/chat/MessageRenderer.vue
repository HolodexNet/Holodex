<template>
  <v-card-text
    class="tl-body pa-1 pa-lg-3"
    :style="{
      'font-size': fontSize + 'px',
    }"
  >
    <transition-group name="fade">
      <template v-for="(item, index) in tlHistory">
        <chat-message
          :key="item.key"
          :source="item"
          :hide-author="hideAuthor(item, index)"
        />
      </template>
    </transition-group>
    <slot />
  </v-card-text>
</template>

<script>
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
        hideAuthor(item, index) {
            return !(index === 0
                || index === this.tlHistory.length - 1
                || item.name !== this.tlHistory[index - 1].name
                || !!item.breakpoint);
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
</style>
