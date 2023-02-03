<template>
  <div class="h-progress-bar" :class="backClass">
    <div class="h-progress-bar__progress" :class="foreClass"></div>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line vue/prop-name-casing
withDefaults(defineProps<{ foreClass?: string; backClass?: string }>(), {
  backClass: "bg-primary-700",
  foreClass: "bg-accent-200",
});
</script>

<style>
.h-progress-bar {
  /* Color */
  background-color: #d1d5db;

  /* Rounded border */
  border-radius: 9999px;

  /* Size */
  height: 0.5rem;

  position: relative;
  overflow: hidden;
}

.h-progress-bar__progress {
  /* Color */
  background-color: #3b82f6;

  /* Absolute position */
  position: absolute;
  bottom: 0;
  top: 0;
  width: 50%;

  /* Move the bar infinitely */
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: h-progress-bar;
}

@keyframes h-progress-bar {
  from {
    left: -50%;
  }
  to {
    left: 100%;
  }
}
</style>
