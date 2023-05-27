<template>
  <div
    class="bar"
    :style="{
      width: '5px',
      height: Math.floor(((Math.max(source[1], -60) + 60) / 60) * 100) + 'px',
      marginTop: 0,
    }"
    :title="source.join(':')"
  />
</template>
<script setup lang="ts">
defineProps<{
  source: [number, number];
  index: number;
}>();
</script>
<style>
.bar {
  @apply inline-block bg-primary-200 bg-opacity-50;
}
</style>
