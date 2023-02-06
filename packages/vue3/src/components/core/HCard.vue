<template>
  <div
    class="card-compact card bg-base-100"
    :class="{
      'border border-solid border-bgColor-50': outlined,
      shadow: !flat && !tile,
      'rounded-none': tile,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  flat?: boolean;
  tile?: boolean;
  outlined?: boolean;
}>();
</script>

<style scoped></style>
