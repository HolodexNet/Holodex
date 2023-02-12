<template>
  <div class="h-tooltip">
    <div ref="activator">
      <slot name="activator" />
    </div>
    <div ref="floating" :style="floatingStyle">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <slot v-if="isHovered" />
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  autoUpdate,
  flip,
  offset,
  Placement,
  shift,
  useFloating,
} from "@floating-ui/vue";
import { useElementHover } from "@vueuse/core";
import type { Options as OffsetOptions } from "@floating-ui/core/src/middleware/offset";
import { TransitionProps } from "vue";

const activator = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);

const isHovered = useElementHover(activator);
interface Props extends TransitionProps {
  // as?: string | Component;
  // floatingAs?: string | Component;
  show?: boolean;
  placement?: Placement;
  // strategy?: Strategy;
  offset?: OffsetOptions;
  // autoUpdate?: boolean | Partial<AutoUpdateOptions>;
  zIndex?: number | string;
  // TODO: impl transition stuff
  transition?: string;
}
const props = withDefaults(defineProps<Props>(), {
  placement: "bottom",
  zIndex: 1,
  middleware: () => [],
  transition: "fade",
  offset: undefined,
});

const middleware = computed(() => {
  const _middleware = [shift(), flip()];
  if (
    typeof props.offset === "number" ||
    typeof props.offset === "object" ||
    typeof props.offset === "function"
  ) {
    _middleware.push(offset(props.offset));
  }
  return _middleware;
});

const { x, y, strategy } = useFloating(activator, floating, {
  whileElementsMounted(...args) {
    const cleanup = autoUpdate(...args, { animationFrame: true });
    // Important! Always return the cleanup function.
    return cleanup;
  },
  placement: props.placement,
  middleware: middleware,
});

const floatingStyle: any = computed(() => ({
  // ...(props.transform
  // ? {
  position: strategy.value,
  zIndex: 1,
  top: "0",
  left: "0",
  right: "auto",
  bottom: "auto",
  transform: `translate(${Math.round(x.value || 0)}px,${Math.round(
    y.value || 0
  )}px)`,
  // }
  // : {
  //     position: strategy.value,
  //     zIndex: props.zIndex,
  //     top: `${y.value || 0}px`,
  //     left: `${x.value || 0}px`,
  //   }),
  // width:
  //   props.adaptiveWidth && typeof referenceElWidth.value === "number"
  //     ? `${referenceElWidth.value}px`
  //     : "",
}));
</script>
