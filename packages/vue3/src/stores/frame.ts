// if true, the menu MUST be shown.
export const mustHideTopBar = ref(false);

export function useForceHideTopBarWhileActive() {
  onActivated(() => {
    mustHideTopBar.value = true;
  });

  onDeactivated(() => {
    mustHideTopBar.value = false;
  });

  onMounted(() => {
    mustHideTopBar.value = true;
  });
  onUnmounted(() => {
    mustHideTopBar.value = false;
  });

  return mustHideTopBar;
}

// if true, the menu MUST be shown.
export const shouldHideSidebar = ref(false);

export function indicateShouldHideSideBar() {
  onActivated(() => {
    shouldHideSidebar.value = true;
  });

  onDeactivated(() => {
    shouldHideSidebar.value = false;
  });

  return shouldHideSidebar;
}
