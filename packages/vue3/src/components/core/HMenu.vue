<template>
  <Float
    :offset="8"
    flip
    enter="transition duration-200 ease-out"
    enter-from="scale-95 opacity-0"
    enter-to="scale-100 opacity-100"
    leave="transition duration-150 ease-in"
    leave-from="scale-100 opacity-100"
    leave-to="scale-95 opacity-0"
    tailwindcss-origin-class
    portal="#h-floating-container"
    :show="show"
    v-bind="props"
  >
    <div @click="toggle">
      <div ref="activator">
        <slot name="activator"></slot>
      </div>
    </div>
    <div ref="floating" @click="show = false">
      <slot v-if="show"></slot>
    </div>
  </Float>
</template>

<script setup lang="ts">
import { Float } from "@headlessui-float/vue";
import { onClickOutside } from "@vueuse/core";

type FloatProps = InstanceType<typeof Float>["$props"];
interface Props extends FloatProps {}
const props = defineProps<Props>();

const activator = ref(null);
const floating = ref(null);
const show = ref(false);
const toggle = () => {
  show.value = !show.value;
};
onClickOutside(floating, () => (show.value = false), {
  ignore: [activator],
});
</script>
