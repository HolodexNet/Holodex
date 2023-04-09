<template>
  <component
    :is="component || 'a'"
    class="tab-bordered tab tab-lg border-transparent lg:px-4"
    style="--tab-padding: 0.5rem"
    :class="props.active ? 'tab-active !border-secondary text-secondary' : ''"
  >
    <slot />
  </component>
</template>
<script setup lang="ts">
const props = defineProps<{ active: boolean; component?: any }>();
</script>
