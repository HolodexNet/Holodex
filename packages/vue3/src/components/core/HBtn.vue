<template>
  <a
    class="btn btn-primary shadow-md"
    :class="{ 'btn-sm': small, 'btn-ghost': text }"
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
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>
