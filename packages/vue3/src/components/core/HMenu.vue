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
  OffsetOptions,
  ShiftOptions,
  FlipOptions,
  AutoPlacementOptions,
  HideOptions,
} from "@floating-ui/core";
import {
  autoUpdate,
  useFloating,
  shift,
  autoPlacement,
  hide,
  offset,
  Middleware,
  flip,
  Placement,
  DetectOverflowOptions,
  Strategy,
} from "@floating-ui/vue";
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
  // TODO: impl transition stuff
  transition?: string;
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
  modelValue?: boolean;
}

const props = withDefaults(defineProps<FloatPropsType>(), {
  placement: "auto",
  zIndex: 9999,
  strategy: "absolute",
  middleware: () => [],
  transform: false,
  closeOnClick: true,
  modelValue: undefined,
});

const activator = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);

const emit = defineEmits(["update:modelValue"]);
const _isOpen = ref(false);

// Allows v-model binding when needed
const isOpen = computed({
  get() {
    return typeof props.modelValue !== "undefined"
      ? props.modelValue
      : _isOpen.value;
  },
  set(val) {
    if (typeof props.modelValue !== "undefined") {
      emit("update:modelValue", val);
      return;
    }
    _isOpen.value = val;
  },
});

function toggle() {
  isOpen.value = !isOpen.value;
}

const middleware = ref<Middleware[]>([]);
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

// Handles outside click closing them menu
onClickOutside(floating, () => (isOpen.value = false), {
  ignore: [activator],
});

// Style object for floating piece
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

// Modifies middleware list for useFloating based on props
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
</script>
