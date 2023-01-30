<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text">{{ title }}</span>
      <span v-if="subtitle" class="label-text-alt text-opacity-60">
        {{ subtitle }}
      </span>
    </label>
    <input
      v-model="localValue"
      v-bind="$attrs"
      type="text"
      class="input-bordered input w-full border-solid"
    />
    <label v-if="error || explanation" class="label">
      <span class="label-text-alt text-opacity-60">
        {{ error ? explanation : error }}
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
      type: String,
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

<style scoped></style>
