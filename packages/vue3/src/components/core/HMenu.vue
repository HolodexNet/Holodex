<template>
  <slot
    name="activator"
    v-bind="{
      props: {
        onClick: toggle,
        ariaExpanded: isOpen,
        ariaHasPopup: true,
        ref: (el: any) => activator = el,
      },
    }"
  />
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
        v-if="isOpen"
        ref="floating"
        :style="floatingStyle"
        role="menu"
        @click="closeOnContentClick && (isOpen = false)"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
/* eslint-disable vue/require-default-prop */

import {
  autoUpdate,
  useFloating,
  shift,
  autoPlacement,
  hide,
  offset,
  DetectOverflowOptions,
  Middleware,
  Placement,
  Strategy,
  flip,
} from "@floating-ui/vue";
import type { Options as OffsetOptions } from "@floating-ui/core/src/middleware/offset";
import type { Options as ShiftOptions } from "@floating-ui/core/src/middleware/shift";
import type { Options as FlipOptions } from "@floating-ui/core/src/middleware/flip";
import type { Options as AutoPlacementOptions } from "@floating-ui/core/src/middleware/autoPlacement";
import type { Options as HideOptions } from "@floating-ui/core/src/middleware/hide";
// import type { Options as AutoUpdateOptions } from "@floating-ui/dom/src/autoUpdate";
import { onClickOutside } from "@vueuse/core";
import { Ref, TransitionProps } from "vue";
export interface FloatPropsType extends TransitionProps {
  // as?: string | Component;
  // floatingAs?: string | Component;
  show?: boolean;
  placement?: "auto" | Placement;
  strategy?: Strategy;
  offset?: OffsetOptions;
  shift?: boolean | number | Partial<ShiftOptions & DetectOverflowOptions>;
  flip?: boolean | number | Partial<FlipOptions & DetectOverflowOptions>;
  // arrow?: boolean | number;
  autoPlacement?:
    | boolean
    | Partial<AutoPlacementOptions & DetectOverflowOptions>;
  hide?: boolean | Partial<HideOptions & DetectOverflowOptions>;
  // autoUpdate?: boolean | Partial<AutoUpdateOptions>;
  zIndex?: number | string;
  // transitionName?: string;
  // transitionType?: "transition" | "animation";
  // enter?: string;
  // enterFrom?: string;
  // enterTo?: string;
  // leave?: string;
  // leaveFrom?: string;
  // leaveTo?: string;
  // originClass?: string;
  // tailwindcssOriginClass?: boolean;
  // portal?: boolean | string;
  transform?: boolean;
  // adaptiveWidth?: boolean;
  middleware?:
    | Middleware[]
    | ((refs: {
        referenceEl: Ref<HTMLElement | null>;
        floatingEl: Ref<HTMLElement | null>;
      }) => Middleware[]);
  closeOnContentClick?: boolean;
}

// interface Props extends PopperProps {}
const props = withDefaults(defineProps<FloatPropsType>(), {
  placement: "auto",
  zIndex: 9999,
  strategy: "absolute",
  middleware: () => [],
  transform: false,
  closeOnClick: true,
});
const activator = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const isOpen = ref(false);
function toggle() {
  isOpen.value = !isOpen.value;
}

const middleware = ref<Middleware[]>([]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { x, y, strategy, middlewareData, update, isPositioned } = useFloating(
  activator,
  floating,
  {
    whileElementsMounted(...args) {
      const cleanup = autoUpdate(...args, { animationFrame: true });
      // Important! Always return the cleanup function.
      return cleanup;
    },
    middleware: middleware,
    placement: props.placement !== "auto" ? props.placement : "bottom-start",
    strategy: props.strategy,
  }
);

const floatingStyle: any = computed(() => ({
  ...(props.transform
    ? {
        position: strategy.value,
        zIndex: props.zIndex,
        top: "0",
        left: "0",
        right: "auto",
        bottom: "auto",
        transform: `translate(${Math.round(x.value || 0)}px,${Math.round(
          y.value || 0
        )}px)`,
      }
    : {
        position: strategy.value,
        zIndex: props.zIndex,
        top: `${y.value || 0}px`,
        left: `${x.value || 0}px`,
      }),
  // width:
  //   props.adaptiveWidth && typeof referenceElWidth.value === "number"
  //     ? `${referenceElWidth.value}px`
  //     : "",
}));

watch(
  [
    () => props.offset,
    () => props.flip,
    () => props.shift,
    () => props.autoPlacement,
    () => props.placement,
    () => props.hide,
    () => props.middleware,
  ],
  () => {
    // updateElements();
    const _middleware = [];
    if (
      typeof props.offset === "number" ||
      typeof props.offset === "object" ||
      typeof props.offset === "function"
    ) {
      _middleware.push(offset(props.offset));
    }
    if (
      props.flip === true ||
      typeof props.flip === "number" ||
      typeof props.flip === "object"
    ) {
      _middleware.push(
        flip({
          padding: typeof props.flip === "number" ? props.flip : undefined,
          ...(typeof props.flip === "object" ? props.flip : {}),
        })
      );
    }
    if (
      props.shift === true ||
      typeof props.shift === "number" ||
      typeof props.shift === "object"
    ) {
      _middleware.push(
        shift({
          padding: typeof props.shift === "number" ? props.shift : undefined,
          ...(typeof props.shift === "object" ? props.shift : {}),
        })
      );
    }
    if (
      props.autoPlacement === true ||
      typeof props.autoPlacement === "object" ||
      props.placement === "auto"
    ) {
      console.log("using auto");
      _middleware.push(
        autoPlacement(
          typeof props.autoPlacement === "object"
            ? props.autoPlacement
            : undefined
        )
      );
    }
    _middleware.push(
      ...(typeof props.middleware === "function"
        ? props.middleware({
            referenceEl: activator,
            floatingEl: floating,
          })
        : props.middleware)
    );
    if (props.hide === true || typeof props.hide === "object") {
      _middleware.push(
        hide(typeof props.hide === "object" ? props.hide : undefined)
      );
    }
    middleware.value = _middleware;
  },
  { immediate: true }
);

onClickOutside(floating, () => (isOpen.value = false), {
  ignore: [activator],
});
</script>
