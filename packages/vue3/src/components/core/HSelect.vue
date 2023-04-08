<template>
  <Listbox
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <div class="relative">
      <ListboxButton
        class="relative w-full cursor-default rounded-lg bg-bgColor-500 py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-300 sm:text-sm"
      >
        <span class="block truncate">
          {{
            (itemTitle ? modelValue?.[itemTitle] : undefined) ??
            modelValue ??
            placeholder
          }}
        </span>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute mt-2 max-h-80 w-full overflow-auto rounded-md bg-bgColor-500 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="item in items"
            v-slot="{ active, selected }"
            :key="itemValue ? item?.[itemValue] : item"
            :value="item"
            as="template"
          >
            <li
              :class="[
                active ? 'text-primary' : 'text-base-content',
                'relative cursor-default select-none py-2 pl-10 pr-4',
              ]"
            >
              <span
                :class="[
                  selected ? 'font-medium' : 'font-normal',
                  'block truncate',
                ]"
              >
                {{ itemTitle ? item?.[itemTitle] : item }}
              </span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script lang="ts" setup>
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
// import { useVModel } from "@vueuse/core";

const props = defineProps<{
  items: readonly any[] | readonly Record<string, unknown>[];
  itemValue?: string;
  itemTitle?: string;
  modelValue: any | Record<string, unknown>;
  placeholder?: string;
}>();
const emit = defineEmits(["update:modelValue"]);
// const currentItem = useVModel(props, "modelValue", emit);
</script>
