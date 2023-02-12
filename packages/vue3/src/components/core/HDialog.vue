<template>
  <Teleport to="#h-floating-container">
    <Transition name="fade-pop">
      <div
        v-if="props.modelValue"
        class="modal z-[9999]"
        :class="{ 'modal-open': props.modelValue }"
        v-bind="$attrs"
      >
        <div
          ref="target"
          class="modal-box w-fit bg-transparent p-0"
          :style="{ width, maxWidth }"
        >
          <slot v-bind="{ close }" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script lang="ts">
// use normal <script> to declare options
// see: https://vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance
export default {
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

const props = defineProps<{
  modelValue: boolean;
  persistent?: boolean;
  width?: string | number;
  maxWidth?: string | number;
}>();
const emit = defineEmits(["update:modelValue"]);
const target = ref(null);
function close() {
  emit("update:modelValue", false);
}
onClickOutside(target, (e) => {
  console.log(e);
  if (!props.persistent) emit("update:modelValue", false);
});
</script>
<style lang="scss">
.fade-pop-enter-active,
.fade-pop-leave-active {
  .modal-box {
    --tw-scale-x: 1;
    --tw-scale-y: 1;
    transform: scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    opacity: 1;
  }

  &.modal {
    --tw-bg-opacity: 0.6;
    background-color: hsl(var(--nf, var(--n)) / var((--tw-bg-opacity)));
  }
}
.fade-pop-enter-from,
.fade-pop-leave-to {
  .modal-box {
    --tw-scale-x: 0.9;
    --tw-scale-y: 0.9;
    transform: scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    opacity: 0;
  }

  &.modal {
    --tw-bg-opacity: 0;
    background-color: hsl(var(--nf, var(--n)) / var(--tw-bg-opacity));
  }
}
</style>
