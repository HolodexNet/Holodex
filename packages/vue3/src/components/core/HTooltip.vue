<template>
  <div class="h-tooltip">
    <div @click="focused = false">
      <slot name="activator" :activator-props="activatorProps" />
    </div>
    <div v-if="showTooltip" ref="floating" :style="floatingStyle">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <slot />
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
import { onClickOutside, useElementHover, useFocus } from "@vueuse/core";
import type { Options as OffsetOptions } from "@floating-ui/core/src/middleware/offset";
import { HTMLAttributes, ReservedProps, TransitionProps, VNodeRef } from "vue";

import useTouchOutside from "@/hooks/common/useTouchOutside";

const activator = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);

const { focused } = useFocus(activator);
const isHovered = useElementHover(activator);
const showTooltip = computed(
  () => isHovered.value || focused.value || isTouched.value
);

// TODO: switch to HTMLAttributes & ReservedProps on version vue v3.3
const activatorProps: HTMLAttributes & ReservedProps = {
  onTouchend: onTouchEnd,
  ref: (r: any) => (activator.value = r),
};

const isTouched = ref(false);

function onTouchEnd(e: TouchEvent) {
  if (!props.showOnFirstTouch) return;
  if (!isTouched.value) {
    e.preventDefault();
    isTouched.value = true;
    // Listeners should be cleaned up afterwards?
    useTouchOutside(activator, () => {
      isTouched.value = false;
    });
    // Edge case, touch screen computer + mouse
    onClickOutside(activator, () => {
      isTouched.value = false;
    });
  }
}

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

  showOnFirstTouch?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  placement: "bottom",
  zIndex: 9999,
  middleware: () => [],
  transition: "fade",
  offset: undefined,
  showOnFirstTouch: true,
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
  zIndex: props.zIndex,
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
