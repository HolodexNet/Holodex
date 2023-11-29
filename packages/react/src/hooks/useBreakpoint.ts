import { useState, useEffect } from "react";

import { useMediaQuery } from "usehooks-ts";

/** INFO:
 *
 * Note that the useBreakpoints are using mediaQueries (window.watchMedia) which means they cannot
 *  replace UI logic operating on `@container` queries which are **not** `@media` queries.
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
};

// ==============

export const useIsXs = () =>
  useMediaQuery(`only screen and (max-width: ${BREAKPOINTS.sm - 1}px)`);

export const useIsSm = () =>
  useMediaQuery(
    `only screen and (min-width: ${BREAKPOINTS.sm}px) and (max-width: ${
      BREAKPOINTS.md - 1
    }px)`,
  );

export const useIsMd = () =>
  useMediaQuery(
    `only screen and (min-width: ${BREAKPOINTS.md}px) and (max-width: ${
      BREAKPOINTS.lg - 1
    }px)`,
  );

export const useIsLg = () =>
  useMediaQuery(
    `only screen and (min-width: ${BREAKPOINTS.lg}px) and (max-width: ${
      BREAKPOINTS.xl - 1
    }px)`,
  );

export const useIsXl = () =>
  useMediaQuery(
    `only screen and (min-width: ${BREAKPOINTS.xl}px) and (max-width: ${
      BREAKPOINTS["2xl"] - 1
    }px)`,
  );

export const useIs2xl = () =>
  useMediaQuery(`only screen and (min-width: ${BREAKPOINTS["2xl"]}px)`);

// ==============

export const useIsSmAndUp = () =>
  useMediaQuery(`only screen and (min-width: ${BREAKPOINTS.sm}px)`);

export const useIsMdAndUp = () =>
  useMediaQuery(`only screen and (min-width: ${BREAKPOINTS.md}px)`);

export const useIsLgAndUp = () =>
  useMediaQuery(`only screen and (min-width: ${BREAKPOINTS.lg}px)`);

export const useIsXlAndUp = () =>
  useMediaQuery(`only screen and (min-width: ${BREAKPOINTS.xl}px)`);

export const useIs2xlAndUp = () =>
  useMediaQuery(`only screen and (min-width: ${BREAKPOINTS["2xl"]}px)`);

/** INFO:
 *
 * Note that the useBreakpoints are using mediaQueries (window.watchMedia) which means they cannot
 *  replace UI logic operating on `@container` queries which are **not** `@media` queries.
 */

export default useMediaQuery;
