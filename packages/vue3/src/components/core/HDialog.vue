<template>
  <Teleport to="#modal">
    <div
      v-if="props.modelValue"
      class="modal"
      :class="{ 'modal-open': props.modelValue }"
    >
      <div ref="target">
        <slot v-bind="{ close }"></slot>
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

// const show = ref(true);
const target = ref(null);
// function open() {
//   show.value = true;
// }
function close() {
  emit("update:modelValue", false);
}
// watchEffect(() => console.log(target.value));
onClickOutside(target, () => {
  emit("update:modelValue", false);
});
</script>
