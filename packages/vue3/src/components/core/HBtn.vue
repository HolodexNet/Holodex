<template>
  <!-- PLAIN BUTTON MODE -->
  <a
    v-if="!to"
    class="btn btn-primary"
    :class="{
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
  </a>
  <!-- ROUTER LINK MODE -->
  <router-link
    v-else
    :to="to"
    class="btn btn-primary"
    :class="{
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
  </router-link>
</template>

<script lang="ts">
import { RouteLocationRaw } from "vue-router";

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
      type: Object as PropType<RouteLocationRaw>,
      default: undefined,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>
