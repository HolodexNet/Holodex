<template>
  <div ref="target" class="h-lazy"><slot v-if="rendered"></slot></div>
</template>
<script setup lang="ts">
import {
  UseIntersectionObserverOptions,
  useIntersectionObserver,
} from "@vueuse/core";
const target = ref(null);
const rendered = ref(false);
const props = defineProps<{
  observerOptions?: UseIntersectionObserverOptions;
}>();
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      rendered.value = true;
      stop();
    }
  },
  props.observerOptions
);
</script>
