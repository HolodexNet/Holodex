<template>
  <span v-if="!editMode" class="line-clamp-3" @click="editMode = true">
    {{ modelValue }}
  </span>
  <div v-else ref="inputRef" class="input-group w-full">
    <input
      v-model="modelValue"
      class="input h-8 grow"
      @keypress.enter="editMode = false"
    />
    <button class="btn-square btn" @click="editMode = false">OK</button>
  </div>
</template>
<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

const editMode = ref(false);
const modelValue = defineModel<string>();
const inputRef = ref<HTMLDivElement>();

onClickOutside(inputRef, () => {
  if (editMode.value) {
    editMode.value = false;
  }
});
</script>
