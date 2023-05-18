<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text">{{ title }}</span>
      <span v-if="subtitle" class="label-text-alt text-opacity-60">
        {{ subtitle }}
      </span>
    </label>
    <div class="h-group input-group" :class="{ 'shadow shadow-error': error }">
      <slot name="prepend" />
      <slot name="input">
        <input
          v-if="as === 'input'"
          v-model="localValue"
          v-bind="$attrs"
          type="text"
          class="input-anchor input-bordered input w-full border-solid bg-bgColor-500"
        />
        <textarea
          v-if="as === 'textarea'"
          v-model="localValue"
          v-bind="$attrs"
          type="text"
          class="input-bordered input w-full border-solid bg-bgColor-500"
        />
      </slot>
      <slot name="append" />
    </div>

    <label v-if="error || explanation" class="label">
      <span
        class="label-text-alt text-opacity-60"
        :class="{ ' text-error text-opacity-100 ': error }"
      >
        {{ error ? error : explanation }}
      </span>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      default: "",
      type: [String, Number],
    },
    title: {
      default: "",
      type: String,
    },
    subtitle: {
      default: "",
      type: String,
    },
    explanation: {
      default: undefined,
      type: String,
    },
    error: {
      default: undefined,
      type: String,
    },
    as: {
      default: "input",
      type: String,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });
    return { localValue };
  },
});
</script>
F

<style lang="scss">
.input-group.h-group > :first-child:last-child {
  border-radius: var(--rounded-btn, 0.5rem);
}
.input-group.h-group > :not(span) :where(span) {
  background-color: unset;
}
.h-group {
  & > .btn:first-child {
    height: 3rem !important;
  }
  .input-anchor ~ .btn {
    height: 3rem !important;
  }
}
</style>
