import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

export function useDisplay() {
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const mobile = computed(() => breakpoints.sm);

  return { mobile, ...breakpoints };
}
