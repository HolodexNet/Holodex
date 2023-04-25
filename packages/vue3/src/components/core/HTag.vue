<template>
  <div
    class="badge badge-lg border-bgColor-100 text-sm text-base-content"
    :class="{
      'bg-bgColor-300': !color,
      'rounded-md': tile,
      [color!]: color,
    }"
  >
    <slot />
    <div
      v-if="closeable"
      class="ml-2 hover:text-warning"
      :class="icons.close"
      @click="$emit('close')"
    />
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  tile?: boolean;
  color?: string;
  closeable?: boolean;
}>();
defineEmits(["close"]);
</script>
