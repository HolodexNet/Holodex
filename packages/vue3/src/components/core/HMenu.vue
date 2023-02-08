<template>
  <Menu>
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
      v-bind="props"
    >
      <slot name="activator"/>
      <!-- <div
        aria-haspopup="true"
        :aria-expanded="show"
        @click="toggle"
        @keydown.space.prevent="toggle"
      >
        <div ref="activator">
          <slot name="activator"></slot>
        </div>
      </div> -->
      <!-- <div ref="floating" @click="show = false"> -->

      <slot/>

      <!-- </div> -->
    </Float>
  </Menu>
</template>

<script setup lang="ts">
import { Float } from "@headlessui-float/vue";
// import { onClickOutside } from "@vueuse/core";
import { Menu } from "@headlessui/vue";
type FloatProps = InstanceType<typeof Float>["$props"];
interface Props extends FloatProps {}
const props = defineProps<Props>();

// const activator = ref(null);
// const floating = ref<HTMLElement | null>(null);
// const show = ref(false);
// watchEffect(() => console.log(floating));
// const toggle = () => {
//   show.value = !show.value;
// };
// onClickOutside(floating, () => (show.value = false), {
//   ignore: [activator],
// });
</script>
<style>
[data-headlessui-state="active"] {
  @apply bg-primary-400 text-white;
}
</style>
