<template>
  <h-alert
    :model-value="open"
    v-bind="$attrs"
    persistent
    @update:model-value="
      (o) => {
        if (!o) cancel();
      }
    "
  >
    <h3 v-if="title" class="text-lg font-bold">{{ title }}</h3>
    <p v-if="description" class="py-4">
      {{ description }}
    </p>
    <div class="modal-action">
      <label for="my-modal" class="btn-primary btn" @click="confirm">
        {{ confirmText || "OK" }}
      </label>
      <label for="my-modal" class="btn-neutral btn" @click="cancel">
        {{ cancelText || "Cancel" }}
      </label>
    </div>
  </h-alert>
</template>
<script setup lang="ts">
/**
 * Defines a modal popup that asks the user for confirmation. Provides two buttons, a confirm button and a cancel button
 */

const props = defineProps<{
  // persistent?: boolean; (Confirm Modals are always persistent)
  width?: string | number;
  maxWidth?: string | number;

  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;

  cancelFn?: () => void;
  confirmFn?: () => void;
}>();

const open = ref(true);

function confirm() {
  props.confirmFn?.();
  open.value = false;
}
function cancel() {
  props.cancelFn?.();
  open.value = false;
}
</script>
