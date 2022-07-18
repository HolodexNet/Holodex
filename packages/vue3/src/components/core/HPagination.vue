<template>
  <div class="btn-group">
    <button
      class="btn btn-md text-base-content bg-base-300"
      :class="{
        'btn-disabled': modelValue === 1,
      }"
      @click="() => changePage(Math.max(modelValue - 1, 1))"
    >
      «
    </button>
    <template v-for="pageNum in paginationPages" :key="pageNum">
      <button
        class="btn btn-md text-base-content bg-base-300"
        :class="{
          'btn-active': modelValue === pageNum,
          'btn-disabled': pageNum === '...',
        }"
        @click="() => changePage(pageNum)"
      >
        {{ pageNum }}
      </button>
    </template>
    <button
      class="btn btn-md text-base-content bg-base-300"
      :class="{
        'btn-disabled': modelValue === totalPages,
      }"
      @click="() => changePage(Math.min(props.modelValue + 1, totalPages))"
    >
      »
    </button>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  totalPages: {
    type: Number,
    default: 0,
  },
  modelValue: {
    type: Number,
    default: 1,
  },
});
const emit = defineEmits(["update:modelValue"]);

function changePage(page: string | number) {
  emit("update:modelValue", page);
}

// Calculate what pages to show in pagination buttons
const paginationPages = computed(() => {
  const toDisplay = Math.min(10, props.totalPages);
  const toShift =
    toDisplay === 10 && props.modelValue > toDisplay / 2
      ? Math.ceil(props.modelValue - toDisplay / 2)
      : 0;
  const pages: any[] = Array(toDisplay)
    .fill(0)
    .map((_, idx) => idx + 1 + toShift);
  if (toShift > 0) {
    return [1, "...", ...pages.slice(2, pages.length)];
  }
  return pages;
});
</script>
