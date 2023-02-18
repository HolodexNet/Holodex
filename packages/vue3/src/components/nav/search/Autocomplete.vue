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
    <h-menu :model-value="optionsShown" use-ref-width>
      <template
        #activator="{ props: { ref: referenceEl, ariaExpanded, ariaHasPopup } }"
      >
        <div
          :ref="referenceEl"
          :aria-expanded="ariaExpanded"
          :aria-haspopup="ariaHasPopup"
          class="relative mx-auto flex w-full cursor-pointer flex-nowrap"
        >
          <div class="multiselect-wrapper">
            <div class="tags">
              <slot name="chips" :selection="selection" />
            </div>
            <input
              ref="inputField"
              v-model="searchContent"
              class="dropdown-input bg-transparent"
              :placeholder="placeholder"
              @focus="showOptions()"
              @blur="exit"
              @keydown="keyMonitor"
            />
          </div>
          <slot name="caret" :open="optionsShown" :input="inputField">
            <div
              class="i-ion:search opacity-40"
              style="margin: auto 4px"
              @click="
                $nextTick(() => {
                  inputField?.focus();
                })
              "
            />
          </slot>
        </div>
      </template>
      <div v-show="showMenu" class="multiselect-dropdown">
        <slot name="dropdown" :active="activeIndex" :up="dropUp" />
      </div>
    </h-menu>
    <!-- Dropdown Menu -->
  </div>
</template>

<script lang="ts">
import { useVModel } from "@vueuse/core";
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
            emit("select", {
              n: currentValue.state.value,
              item: props.options[currentValue.state.value],
            });
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

    const inputField = ref<HTMLInputElement>();
    const log = console.log;
    return {
      optionsShown,
      searchContent,
      keyMonitor,
      inputField,
      activeIndex: currentValue.state,
      log,
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
  @apply relative mx-auto box-border flex w-full cursor-pointer items-center justify-end rounded leading-snug;
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
    @apply flex flex-shrink-0 flex-nowrap items-center;
    margin: 0 2px;
  }

  & input {
    @apply relative inline-block h-full flex-shrink flex-grow focus:outline-none;
    min-width: 150px !important;
  }
}

.multiselect-dropdown {
  @apply flex max-h-80 min-w-max flex-col overflow-y-scroll rounded-b border border-bgColor-100 bg-bgColor;
}
</style>
