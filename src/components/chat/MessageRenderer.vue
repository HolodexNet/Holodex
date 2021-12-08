<template>
  <v-card-text
    id="scroll-target"
    ref="tlBody"
    class="tl-body pa-1 pa-lg-3"
    :style="{
      'font-size': fontSize + 'px',
    }"
  >
    <div ref="start" />
    <transition-group name="fade">
      <template v-for="(item, index) in tlHistory">
        <chat-message
          :key="item.key"
          :source="item"
          :hide-author="hideAuthor(item, index)"
        />
      </template>
    </transition-group>
    <!-- Slot for adding a Load More button on top of Messages -->
    <slot />
    <span v-scroll:#scroll-target="(e) => { pos = e.target.scrollTop }" style="position: absolute; top: 10px">Position: {{ pos }} </span>
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
    data() {
        return {
            pos: 0,
        };
    },
    methods: {
        hideAuthor(item, index) {
            return !(index === 0
                || index === this.tlHistory.length - 1
                || item.name !== this.tlHistory[index - 1].name
                || !!item.breakpoint);
        },
        scrollToBottom() {
            if (Math.abs(this.$refs.tlBody.scrollTop / this.$refs.tlBody.scrollHeight) <= 0.15) {
                this.$nextTick(() => {
                    this.$refs.start.scrollIntoView({ behavior: "smooth" });
                });
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
</style>
