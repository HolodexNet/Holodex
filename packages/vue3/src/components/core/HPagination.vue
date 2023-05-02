<template>
  <div class="btn-group drop-shadow-xl">
    <button
      class="btn-md btn border-opacity-20 bg-bgColor text-base-content"
      :class="{
        'btn-disabled': modelValue === 1,
      }"
      @click="() => changePage(Math.max(modelValue - 1, 1))"
    >
      <div class="i-material-symbols:chevron-left-rounded text-lg" />
    </button>
    <template v-for="(pageNum, index) in paginationPages" :key="pageNum">
      <button
        class="btn-md btn border-opacity-20 bg-bgColor text-base-content"
        :class="{
          'btn-active': modelValue === pageNum,
          'btn-disabled': pageNum === '...',
          '!bg-bgColor-600': pageNum === '...',
          'max-md:hidden': index > 6,
        }"
        @click="() => changePage(pageNum)"
      >
        {{ pageNum }}
      </button>
    </template>
    <button
      class="btn-md btn border-opacity-20 bg-bgColor text-base-content"
      :class="{
        'btn-disabled': modelValue === totalPages,
      }"
      @click="() => changePage(Math.min(props.modelValue + 1, totalPages))"
    >
      <div class="i-material-symbols:chevron-right-rounded text-lg" />
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

const MAX_DISPLAY = 10;
// Calculate what pages to show in pagination buttons
const paginationPages = computed(() => {
  // check if there's less page than required
  const toDisplay = Math.min(MAX_DISPLAY, props.totalPages);
  const toShift =
    toDisplay === MAX_DISPLAY && props.modelValue > toDisplay / 2
      ? Math.floor(props.modelValue - toDisplay / 2)
      : 0;
  const pages = Array(toDisplay)
    .fill(0)
    .map((_, idx) => idx + 1 + toShift);
  if (toShift > 0) {
    return [1, "...", ...pages.slice(2, pages.length)];
  }
  return pages;
});
</script>
