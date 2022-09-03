<template>
  <div
    class="sticky z-10 px-4 overflow-x-auto overflow-y-hidden tabs top-14 bg-bgColor-500 flex-nowrap no-scrollbar sm:mb-4"
  >
    <div
      class="flex w-full"
      :class="{ 'container mx-auto': props.withContainer }"
    >
      <slot></slot>
      <div v-if="!display.mobile.value" class="ml-auto mt-auto">
        <slot name="filters"></slot>
      </div>
    </div>
  </div>
  <div v-if="display.mobile.value" class="flex justify-end my-2">
    <slot name="filters"></slot>
  </div>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework";
// with-container will add a container wrapper to the tab
const props = defineProps<{ withContainer?: boolean }>();

const display = useDisplay();
</script>
