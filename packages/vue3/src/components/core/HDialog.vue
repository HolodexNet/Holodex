<template>
  <Teleport to="#h-floating-container">
    <Transition name="fade-pop">
      <div
        v-if="props.modelValue"
        class="modal-visible modal z-[9999]"
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
const target = ref<HTMLElement | null>(null);
function close() {
  emit("update:modelValue", false);
}
onClickOutside(target, (e) => {
  if (!props.persistent) emit("update:modelValue", false);
});

function handleKeydown(e: KeyboardEvent) {
  console.log(e);
  if (e.key === "Escape") {
    close();
  }
}
watch(
  () => props.modelValue,
  () => {
    if (props.modelValue) {
      console.log("ESC listener attached");
      document.addEventListener("keydown", handleKeydown);
    } else {
      console.log("ESC listener detached");
      document.removeEventListener("keydown", handleKeydown);
    }
  },
);
</script>
<style lang="scss" scoped>
.modal.modal-visible {
  pointer-events: auto;
  visibility: visible;
  opacity: 1;
}
.modal-visible .modal-box {
  --tw-scale-x: 1;
  --tw-scale-y: 1;
}
.fade-pop-enter-active,
.fade-pop-leave-active {
  .modal-box {
    --tw-scale-x: 1;
    --tw-scale-y: 1;
    opacity: 1;
  }
}
.fade-pop-enter-from,
.fade-pop-leave-to {
  .modal-box {
    --tw-scale-x: 0.9;
    --tw-scale-y: 0.9;
    opacity: 0;
  }
}
</style>
