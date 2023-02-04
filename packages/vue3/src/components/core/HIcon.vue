<template>
  <div
    class="h-icon"
    :class="{
      '-ml-1 mr-1': left,
    }"
  ></div>
</template>
<script lang="ts" setup>
withDefaults(
  defineProps<{
    left?: boolean;
  }>(),
  {
    left: false,
  }
);
</script>
<style>
.h-icon {
  @apply inline-block;
}
.btn > .h-icon {
  @apply h-6 w-6;
  font-size: inherit !important;
  line-height: inherit !important;
}
.btn-sm > .h-icon {
  @apply h-5 w-5;
}
.btn-lg > .h-icon {
  @apply h-8 w-8;
}
.btn-xl > .h-icon {
  @apply h-8 w-8;
}
</style>
