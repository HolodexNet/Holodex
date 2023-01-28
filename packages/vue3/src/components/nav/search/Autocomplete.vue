<template>
  <div
    v-if="options"
    class="multiselect"
    :class="{
      'is-open': !dropUp && optionsShown,
      'is-open-top': dropUp && optionsShown,
    }"
  >
    <!-- Dropdown Input -->
    <div class="relative mx-auto flex w-full cursor-pointer flex-nowrap">
      <div class="multiselect-wrapper">
        <div class="tags">
          <slot name="chips" :selection="selection"></slot>
        </div>
        <input
          ref="inputField"
          v-model="searchContent"
          class="dropdown-input"
          :placeholder="placeholder"
          @focus="showOptions()"
          @blur="exit"
          @keydown="keyMonitor"
        />
      </div>
      <slot name="caret" :open="showDropdown" :input="inputField"></slot>
    </div>
    <!-- Dropdown Menu -->
    <div
      v-show="showDropdown && showMenu"
      class="multiselect-dropdown"
      :class="{ 'is-top': dropUp, 'flex-col-reverse': dropUp }"
    >
      <slot name="dropdown" :active="activeIndex" :up="dropUp"> </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { refDebounced, useVModel } from "@vueuse/core";
import type { Ref, WritableComputedRef } from "vue";

function useRange(length: Ref<number>) {
  const state = ref(-1);

  watch(length, (c) => {
    if (state.value >= c && state.value > -1) state.value = c - 1;
  });
  return {
    state,
    reset: () => {
      state.value = -1;
    },
    incr: () => {
      state.value = (state.value + 1) % Math.max(1, length.value);
    },
    decr: () => {
      state.value =
        (state.value - 1 + Math.max(1, length.value)) %
        Math.max(1, length.value);
    },
  };
}

export default defineComponent({
  name: "Dropdown",
  props: {
    selection: {
      type: Array,
      required: true,
      default: () => [],
      note: "Reactive model value",
    },
    search: {
      type: String,
      required: true,
      default: () => "",
      note: "The search query that goes into the string",
    },
    options: {
      type: Array,
      required: true,
      default: () => [],
      note: "Options of dropdown. An array of options with id and name",
    },
    showMenu: {
      type: Boolean,
      required: false,
      default: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: "Please select an option",
      note: "Placeholder of dropdown",
    },
    linear: {
      type: Boolean,
      required: false,
      default: true,
      note: "Linear makes the search bar fully inline",
    },
    maxItem: {
      type: Number,
      required: false,
      default: 6,
      note: "Max items showing",
    },
    dropUp: {
      type: Boolean,
      required: false,
      default: false,
      note: "Bottom to Top instead of Top to bottom.",
    },
  },
  emits: ["update:search", "popChip", "pointed", "select", "submit"],
  setup(props, { emit }) {
    const searchContent: WritableComputedRef<string> | Ref<string> = useVModel(
      props,
      "search",
      emit
    );
    const currentValue = useRange(computed(() => props.options.length));

    function keyMonitor(event: KeyboardEvent) {
      switch (event.key) {
        case "Backspace":
          currentValue.reset();
          if (searchContent.value === "") emit("popChip");
          return;
        case "Enter":
          if (searchContent.value === "" && currentValue.state.value == -1)
            emit("submit");
          else {
            emit("select", { n: currentValue.state.value });
            currentValue.reset();
          }
          event.preventDefault();
          return;
        case "ArrowUp":
          currentValue.decr();
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        case "Tab":
          if (event.shiftKey) {
            currentValue.decr();
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
        case "ArrowDown":
          currentValue.incr();
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        case "Escape":
          currentValue.reset();
          event.preventDefault();
          event.stopImmediatePropagation();
        default:
          currentValue.reset();
          return; //business as usual
      }
    }

    watch(currentValue.state, (n) => {
      emit("pointed", { n });
    });

    // menu open /close
    const optionsShown = ref(false);
    const showDropdown = refDebounced(optionsShown, 300);

    const inputField = ref<HTMLInputElement>();

    return {
      optionsShown,
      showDropdown,
      searchContent,
      keyMonitor,
      inputField,
      activeIndex: currentValue.state,
    };
  },
  computed: {},
  watch: {},
  methods: {
    showOptions() {
      this.optionsShown = true;
    },
    exit() {
      this.optionsShown = false;
    },
    // Selecting when pressing Enter
  },
});
</script>
<style scoped>
.multiselect-wrapper {
  flex-wrap: v-bind("linear ? 'nowrap' : 'wrap'");
}
</style>
<style lang="scss" scoped>
.multiselect {
  @apply relative mx-auto box-border flex w-full cursor-pointer items-center justify-end rounded border border-bgColor-400 leading-snug outline-none;
}

.multiselect.is-disabled {
  @apply cursor-default;
}

.multiselect.is-open {
  @apply rounded-b-none;
}

.multiselect.is-open-top {
  @apply rounded-t-none;
}

.multiselect-wrapper {
  @apply relative mx-auto flex w-full cursor-pointer items-center outline-none;

  overflow-x: auto;
  overflow-wrap: unset;
  overflow-y: clip;
  // height: 40px;
  white-space: nowrap;
  font-size: 13px;
  line-height: 20px;
  height: 32px;

  flex-wrap: nowrap;

  // scrollbar-width: thin;
  // scrollbar-width: 4px;

  & .tags {
    @apply flex flex-shrink-0 flex-grow-0 flex-nowrap items-center;
    margin: 0 2px;
  }

  & input {
    @apply relative inline-block h-full flex-shrink flex-grow focus:outline-none;
    min-width: 150px !important;
  }
}

.multiselect-dropdown {
  left: -1px;
  right: -1px;
  z-index: 5000;
  @apply absolute bottom-0 -mt-[1px] flex max-h-80 translate-y-full transform flex-col overflow-y-scroll rounded-b border border-bgColor-100 bg-bgColor;
}

.multiselect-dropdown.is-top {
  @apply top-px bottom-auto -translate-y-full rounded-b-none rounded-t;
}
</style>
