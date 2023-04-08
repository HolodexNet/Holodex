<template>
  <Listbox v-model="selectedItem">
    <div class="relative mt-1">
      <ListboxButton
        class="relative w-full cursor-default rounded-lg bg-bgColor-500 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
      >
        <span class="block truncate">
          {{ selectedItem?.[itemTitle] ?? selectedItem }}
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
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-bgColor-500 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="item in items"
            v-slot="{ active, selected }"
            :key="item?.[itemValue] ?? item"
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
                {{ item?.[itemTitle] ?? item }}
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

<script>
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";

export default {
  name: "VSelect",

  components: {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
  },

  props: {
    items: {
      type: Array,
      required: true,
    },
    itemValue: {
      type: String,
      required: true,
    },
    itemTitle: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Object,
    },
    placeholder: {
      type: String,
      default: "Select an item",
    },
    class: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "",
    },
    hideDetails: {
      type: Boolean,
      default: true,
    },
    hint: {
      type: String,
      default: "",
    },
    persistentHint: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedItem: this.modelValue,
      searchTerm: "",
    };
  },

  computed: {
    buttonClasses() {
      return [
        "w-full flex items-center justify-between border rounded-md",
        this.variant === "outlined"
          ? "border-gray-300"
          : "border-gray-400 bg-gray-50",
        this.class,
      ];
    },

    optionsClasses() {
      return [
        "absolute w-full mt-1 py-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto z-10",
        this.variant === "outlined"
          ? "border border-gray-300"
          : "border border-gray-400 bg-gray-50",
        this.class,
      ];
    },

    optionProps() {
      return {
        class:
          "text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9",
        activeClass: "bg-indigo-600 text-white",
        inactiveClass: "text-gray-900",
      };
    },

    filteredItems() {
      if (!this.searchTerm) {
        return this.items;
      }

      return this.items.filter((item) => {
        const itemTitle = item[this.itemTitle];
        return itemTitle.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    },
  },

  watch: {
    modelValue(newValue) {
      this.selectedItem = newValue;
    },
    selectedItem(newValue) {
      this.$emit("update:modelValue", newValue);
    },
  },
};
</script>
