<template>
  <a
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
    ></h-icon>
    <slot></slot>
  </a>
</template>

<script lang="ts">
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
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>
