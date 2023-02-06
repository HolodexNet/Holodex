<template>
  <div class="h-menu">
    <div ref="activator" @click="toggled = !toggled">
      <slot name="activator" />
    </div>
    <Teleport to="#h-floating-container">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="toggled"
          ref="floating"
          :style="{
            position: strategy,
            top: `${y ?? 0}px`,
            left: `${x ?? 0}px`,
            width: 'max-content',
            zIndex: 9999,
          }"
          @click="toggled = false"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { PopperProps } from "./types";
import { autoUpdate, useFloating, shift } from "@floating-ui/vue";
import { onClickOutside } from "@vueuse/core";

interface Props extends PopperProps {}
const props = defineProps<Props>();

const activator = ref(null);
const floating = ref(null);

const toggled = ref(false);

const { x, y, strategy, isPositioned } = useFloating(activator, floating, {
  whileElementsMounted(...args) {
    const cleanup = autoUpdate(...args, { animationFrame: true });
    // Important! Always return the cleanup function.
    return cleanup;
  },
  middleware: [shift()],
  placement: "bottom-end",
});

onClickOutside(floating, () => (toggled.value = false), {
  ignore: [activator],
});
</script>
