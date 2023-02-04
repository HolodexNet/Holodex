<template>
  <component
    :is="component || 'a'"
    class="tab tab-bordered border-transparent sm:tab-lg"
    :class="props.active ? 'tab-active !border-secondary text-secondary' : ''"
  >
    <slot></slot>
  </component>
</template>
<script setup lang="ts">
const props = defineProps<{ active: boolean; component?: any }>();
</script>
