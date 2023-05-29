<template>
  <component
    :is="comp"
    :to="to"
    class="btn"
    :class="{
      'btn-primary': !noColor,
      'btn-sm': small,
      'btn-ghost': text || ghost,
      'shadow-md': shadow,
      'w-full': block,
    }"
  >
    <h-icon
      v-if="icon"
      :class="{[icon!]: icon, '-ml-1 mr-1': $slots.default}"
    />
    <slot />
  </component>
</template>

<script lang="ts">
import { RouteLocationRaw, RouterLink } from "vue-router";

export default defineComponent({
  props: {
    small: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: undefined,
    },
    text: {
      type: Boolean,
      default: false,
    },
    ghost: {
      type: Boolean,
      default: false,
    },
    shadow: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    to: {
      type: [String, Object as PropType<RouteLocationRaw>],
      default: undefined,
    },
    noColor: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {};
  },
  computed: {
    comp() {
      return this.to ? RouterLink : "a";
    },
  },
});
</script>

<style lang="scss" scoped></style>
