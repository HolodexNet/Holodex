import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

export function useDisplay() {
  const breakpoints = useBreakpoints(breakpointsTailwind);
  //   WARNING DO NOT USE breakpoints.isSmaller etc. they are not reactive
  const mobile = breakpoints.smaller("sm");

  return { mobile, ...breakpoints };
}
