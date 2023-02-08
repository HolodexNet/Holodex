<template>
  <div
    class="no-scrollbar tabs sticky top-14 z-10 flex-nowrap overflow-x-auto overflow-y-hidden px-4 sm:mb-4"
    :class="xclass"
    style="box-shadow: inset 0px -1px hsl(var(--bc) / 0.2)"
  >
    <div
      class="flex w-full"
      :class="{ 'container mx-auto': props.withContainer }"
    >
      <slot/>
      <div v-if="!display.mobile.value" class="ml-auto mt-auto mb-auto">
        <slot name="filters"/>
      </div>
    </div>
  </div>
  <div v-if="display.mobile.value" class="my-2 -mt-4 flex justify-end">
    <slot name="filters"/>
  </div>
</template>
<script setup lang="ts">
import { useDisplay } from "vuetify";
// with-container will add a container wrapper to the tab
const props = defineProps<{ withContainer?: boolean; xclass?: string }>();

const display = useDisplay();
</script>
