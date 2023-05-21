import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

export function useDisplay() {
  const breakpoints = useBreakpoints({
    sm: 550,
    md: 816,
    lg: 1120,
    xl: 1440,
    "2xl": 1600,
  });
  //   WARNING DO NOT USE breakpoints.isSmaller etc. they are not reactive
  const mobile = breakpoints.smaller("sm");

  return { mobile, ...breakpoints };
}
