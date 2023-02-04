<template>
  <div
    class="alert shadow-lg"
    :class="{
      'alert-info': type === 'info',
      'alert-success': type === 'success',
      'alert-warning': type === 'warning',
      'alert-error': type === 'error',
    }"
  >
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  type?: "info" | "success" | "warning" | "error";
}>();
</script>
