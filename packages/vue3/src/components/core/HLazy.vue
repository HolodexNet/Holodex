<template>
  <div ref="target" class="h-lazy"><slot v-if="rendered" /></div>
</template>
<script setup lang="ts">
import {
  UseIntersectionObserverOptions,
  useIntersectionObserver,
} from "@vueuse/core";
const target = ref(null);
const rendered = ref(false);
interface Props extends UseIntersectionObserverOptions {}

const props = defineProps<Props>();

// Cant use withDefaults because of transpile bug
// rootMargin 25% makes images things render when it is close to being visible
const propsWithDefault = computed(() => ({ rootMargin: "25%", ...props }));

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      rendered.value = true;
      stop();
    }
  },
  propsWithDefault.value
);
</script>
