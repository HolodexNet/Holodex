<template>
  <a
    class="btn-primary btn mt-2 w-32 text-lg shadow-md"
    :class="{ 'btn-sm': small }"
  >
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
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>
