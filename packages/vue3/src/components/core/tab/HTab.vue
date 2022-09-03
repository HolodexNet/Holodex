<template>
  <a
    class="tab min-h-[2.25rem] sm:tab-lg tab-bordered"
    :class="props.active ? 'tab-active text-secondary !border-secondary' : ''"
  >
    <slot></slot>
  </a>
</template>
<script setup lang="ts">
const props = defineProps<{ active: boolean }>();
</script>
