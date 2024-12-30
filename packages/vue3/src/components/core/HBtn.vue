<template>
  <component
    :is="comp"
    :to="to"
    class="btn"
    :class="{
      'btn-primary': !noColor,
      'btn-sm': small,
      'btn-ghost': text || ghost,
      'shadow-md': shadow,
      'w-full': block,
    }"
    :title="tooltip ? undefined : title"
    v-bind="activatorProps"
  >
    <!-- <component
      :is="tooltipContent && tooltipClass ? 'ins' : 'fragment'"
      :class="tooltipClass"
      :data-tip="tooltipContent"
    > -->
    <h-icon
      v-if="icon"
      :class="{ [icon!]: icon, '-ml-1 mr-1': $slots.default }"
    />
    <slot />
    <!-- </component> -->
    <Teleport v-if="tooltip" to="#h-floating-container">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class=" opacity-0"
        enter-to-class=" opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class=" opacity-100"
        leave-to-class=" opacity-0"
      >
        <div
          v-show="showTooltip"
          ref="floating"
          class="badge badge-sm"
          :class="
            typeof tooltip == 'string'
              ? tooltip
              : 'bg-inherit text-inherit opacity-50'
          "
          :style="{ zIndex: 9999, ...floatingStyles }"
          role="tooltip"
        >
          {{ tooltipContent }}
        </div>
      </Transition>
    </Teleport>
  </component>
</template>

<script lang="ts">
import { RouteLocationRaw, RouterLink } from "vue-router";
import { HTMLAttributes, ReservedProps, TransitionProps, VNodeRef } from "vue";
import { onClickOutside, useElementHover, useFocus } from "@vueuse/core";
import {
  autoUpdate,
  flip,
  offset,
  Placement,
  shift,
  useFloating,
} from "@floating-ui/vue";
import useTouchOutside from "@/hooks/common/useTouchOutside";

export default defineComponent({
  components: {},
  props: {
    small: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: undefined,
    },
    text: {
      type: Boolean,
      default: false,
    },
    ghost: {
      type: Boolean,
      default: false,
    },
    shadow: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    to: {
      type: Object as PropType<string | RouteLocationRaw>,
      default: undefined,
    },
    noColor: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: [Boolean, String] as PropType<string | boolean>,
      default: undefined,
    },
    tooltipPlacement: {
      type: String as PropType<Placement>,
      default: "top",
    },
    tooltipText: {
      type: String,
      default: undefined,
    },
    title: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const activator = ref<HTMLElement | null>(null);
    const floating = ref<HTMLElement | null>(null);

    const isTouched = ref(false);

    function onTouchEnd(e: TouchEvent) {
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
    const activatorProps: HTMLAttributes & ReservedProps = {
      onTouchend: onTouchEnd,
      ref: (r: any) => (activator.value = r),
    };

    const { focused } = useFocus(activator);
    const isHovered = useElementHover(activator);

    const showTooltip = computed(
      () => isHovered.value || focused.value || isTouched.value,
    );
    const middleware = computed(() => [shift(), flip(), offset(2)]);
    const { x, y, strategy, floatingStyles } = useFloating(
      activator,
      floating,
      {
        whileElementsMounted(...args) {
          const cleanup = autoUpdate(...args, { animationFrame: true });
          // Important! Always return the cleanup function.
          return cleanup;
        },
        placement: props.tooltipPlacement,
        middleware,
      },
    );
    // const floatingStyle: any = computed(() => ({
    //   // ...(props.transform
    //   // ? {
    //   position: strategy.value,
    //   zIndex: 9999,
    //   top: "0",
    //   left: "0",
    //   right: "auto",
    //   bottom: "auto",
    //   transform: `translate(${Math.round(x.value || 0)}px,${Math.round(
    //     y.value || 0
    //   )}px)`,
    // }));

    return {
      activatorProps,
      floatingStyles,
      showTooltip,
      strategy,
      floating,
      activator,
    };
  },
  computed: {
    comp() {
      return this.to ? RouterLink : "a";
    },
    tooltipContent(): string | undefined {
      return this.tooltipText || this.title;
    },
  },
});
</script>

<style lang="scss" scoped></style>
