<template>
  <component
    :is="component || 'a'"
    class=""
    :class="
      (props.active ? aclass || 'tab-active' : '') +
      ' ' +
      (xclass || 'tab sm:tab-lg')
    "
  >
    <slot></slot>
  </component>
</template>
<script setup lang="ts">
const props = defineProps<{
  active: boolean;
  component?: any;
  aclass?: string;
  xclass?: string;
}>();
</script>
