<template>
  <Disclosure v-slot="{ open }">
    <DisclosureButton
      class="text flex w-full justify-between bg-primary-500 bg-opacity-10 px-4 py-2 text-left font-medium first-of-type:rounded-t last-of-type:rounded-b hover:bg-opacity-20"
    >
      <span>{{ title }}</span>
      <div
        :class="open ? 'rotate-180 ' : ''"
        class="i-heroicons:chevron-up h-5 w-5 transform text-primary-500 transition-transform"
      />
    </DisclosureButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-out"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <DisclosurePanel
        class="text bg-primary-700 bg-opacity-5 p-4 text-opacity-80"
      >
        <slot />
      </DisclosurePanel>
    </transition>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";

defineProps<{ title: string }>();
</script>
