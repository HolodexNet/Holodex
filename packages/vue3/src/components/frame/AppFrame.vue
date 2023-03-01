<template>
  <div
    class="grid-frame bg-bgColor-600"
    :class="{ 'hide-sidebar': !$slots.sidebar?.() || !props.modelValue }"
  >
    <div class="header"><slot name="header" /></div>
    <Transition name="slide">
      <div v-show="$slots.sidebar?.() && props.modelValue" class="sidebar">
        <div class="sidebar-content">
          <slot name="sidebar" />
        </div>
      </div>
    </Transition>
    <div class="main"><slot name="main" /></div>
    <div class="footer"><slot name="footer" /></div>
  </div>
</template>
<script setup lang="ts">
import { useDisplay } from "@/hooks/common/useDisplay";

// Show sidebar?
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

const display = useDisplay();
const shouldShow = display.greater("lg");
watch(
  () => shouldShow.value,
  () => {
    if (shouldShow.value !== props.modelValue) {
      emit("update:modelValue", shouldShow.value);
    }
  },
  { immediate: true }
);
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
}
.sidebar {
  grid-area: sidebar;
  height: calc(100vh - $header-height);
  position: fixed;
  top: $header-height;
  z-index: 10;
}

/* Here we need to make assumption that the first sidebar */
.sidebar > .sidebar-content {
  overflow-y: hidden;
  height: 100%;
  width: var(--sidebar-width-px);
}

.sidebar > .sidebar-content:hover {
  overflow-y: scroll;
  overflow-y: overlay;
}

.main {
  grid-area: main;
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
