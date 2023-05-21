<template>
  <div
    class="grid-frame bg-bgColor-600"
    :class="{
      'hide-sidebar': !$slots.sidebar?.() || !props.modelValue,
      'hide-header': mustHideTopBar,
      'temporary-sidebar': isTemporary,
    }"
  >
    <div class="header"><slot name="header" /></div>
    <Transition name="slide">
      <div v-show="$slots.sidebar?.() && props.modelValue" class="sidebar">
        <div class="sidebar-content bg-bgColor">
          <slot name="sidebar" />
        </div>
      </div>
    </Transition>
    <div
      v-if="isTemporary && props.modelValue"
      class="temporary-sidebar-overlay"
      @click="setShow(false)"
    />
    <div class="main"><slot name="main" /></div>
    <div class="footer"><slot name="footer" /></div>
  </div>
</template>
<script setup lang="ts">
import { useDisplay } from "@/hooks/common/useDisplay";
import router from "@/router";
import { mustHideTopBar } from "@/stores/frame";

// Show sidebar?
const props = defineProps<{ modelValue: boolean; temporary?: boolean }>();
const emit = defineEmits(["update:modelValue"]);

const display = useDisplay();
const isTemporary = computed(
  () => display.smaller("md").value || props.temporary
);

const setShow = (val: boolean) => emit("update:modelValue", val);
// When temporary changes, usually because the window was resized
watch(
  () => isTemporary.value,
  () => {
    setShow(!isTemporary.value);
  },
  { immediate: true }
);

router.afterEach(() => {
  if (isTemporary.value) setShow(false);
});
</script>
<style lang="scss" scoped>
$header-height: 56px;

.header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 10;
  height: $header-height;
  grid-row: $header-height;
  transition: top 0.2s ease-in-out;
}
.sidebar {
  grid-area: sidebar;
  height: calc(100vh - $header-height);
  position: fixed;
  top: $header-height;
  z-index: 10;
}

.temporary-sidebar-overlay {
  position: fixed;
  top: $header-height;
  width: 100vw;
  height: 100vh;
  content: "";
  z-index: 10;
  @apply bg-black opacity-50;
}

/* Here we need to make assumption that the first sidebar */
.sidebar > .sidebar-content {
  overflow-y: hidden;
  height: 100%;
  width: var(--sidebar-width-px);
}

.sidebar > .sidebar-content:hover {
  overflow-y: auto;
  overflow-y: overlay;
}

.main {
  grid-area: main;
  scrollbar-gutter: stable both-edges;
}
.right {
  grid-area: right;
}
.footer {
  grid-area: footer;
  position: sticky;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}
.grid-frame {
  display: grid;
  grid-template-areas:
    "header header header header header header"
    "sidebar main main main main main"
    "sidebar footer footer footer footer footer";
  min-height: 100vh;
  /* grid-template-rows: 56px calc(100vh - 56px); */
  grid-template-rows: $header-height auto;
  grid-template-columns: var(--sidebar-width-px) auto;
  position: relative;
  @apply duration-300 ease-in-out;
}

.grid-frame.hide-sidebar {
  display: grid;
  grid-template-columns: 0px auto;
}

.grid-frame.temporary-sidebar {
  display: grid;
  grid-template-columns: 0px auto;
  & .sidebar {
    z-index: 100;
  }
}

.grid-frame.hide-header {
  grid-template-rows: 0px auto;
  .header {
    top: -60px;
    position: absolute;
  }
  .sidebar {
    top: 0;
    height: 100vh;
  }
}

.slide-leave-active,
.slide-enter-active {
  @apply transition duration-300 ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(calc(-1 * var(--sidebar-width-px)));
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}
</style>
