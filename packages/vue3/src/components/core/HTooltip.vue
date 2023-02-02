<template>
  <Popper v-bind="props">
    <slot name="activator" />
    <template #content="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </Popper>
</template>

<script lang="ts" setup>
import Popper from "vue3-popper";
// type PopperInstanceType = InstanceType<typeof Popper>;
interface PopperProps {
  placement?:
    | "auto"
    | "auto-start"
    | "auto-end"
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "right"
    | "right-start"
    | "right-end"
    | "left"
    | "left-start"
    | "left-end";
  disableClickAway?: boolean;
  offsetSkid?: string;
  offsetDistance?: string;
  hover?: boolean;
  show?: boolean;
  disabled?: boolean;
  openDelay?: number | string;
  closeDelay?: number | string;
  zIndex?: number | string;
  arrow?: boolean;
  arrowPadding?: string;
  interactive?: boolean;
  locked?: boolean;
  content?: string;
  "onOpen:popper"?: () => void;
  "onClose:popper"?: () => void;
}
const props = withDefaults(defineProps<PopperProps>(), {
  placement: "auto",
  arrow: true,
  zIndex: 9999,
  offsetSkid: "0",
  offsetDistance: "12",
  //@ts-ignore
  show: null,
  arrowPadding: "0",
  interactive: true,

  hover: true,
});
console.log(props);
</script>
