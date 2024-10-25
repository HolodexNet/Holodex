import { useEffect } from "react";
import { atomWithStorageBroadcast } from "@/lib/jotai/atomWithStorageBroadcast";
import { useAtom } from "jotai";
import { GET_ON_INIT } from "@/lib/consts";

export const THEME_COLORS = [
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "brown",
  "bronze",
  "gold",
  "orange",
  "sky",
  "mint",
  "lime",
  "yellow",
  "amber",
];

export const THEME_DARK_FOREGROUND_TXT_COLORS = [
  "sky",
  "mint",
  "lime",
  "yellow",
  "amber",
];

export const THEME_BASE_COLORS = [
  "gray",
  "mauve",
  "slate",
  "sage",
  "olive",
  "sand",
] as const;

export const BASE_MAPPING: Record<
  (typeof THEME_COLORS)[number],
  (typeof THEME_BASE_COLORS)[number]
> = {
  tomato: "mauve",
  red: "mauve",
  ruby: "mauve",
  crimson: "mauve",
  pink: "mauve",
  plum: "mauve",
  purple: "mauve",
  violet: "mauve",
  iris: "slate",
  indigo: "slate",
  blue: "slate",
  sky: "slate",
  cyan: "slate",
  mint: "sage",
  teal: "sage",
  jade: "sage",
  green: "sage",
  grass: "olive",
  lime: "olive",
  yellow: "sand",
  amber: "sand",
  orange: "sand",
  brown: "sand",
  gold: "sand", // Not officially specified.
  bronze: "sand", // Not officially specified.
};

/** STORE **/
// export const baseAtom = atomWithStorageBroadcast(
//   "theme-base",
//   "mauve",
//   GET_ON_INIT,
// );
export const primaryAtom = atomWithStorageBroadcast(
  "theme-primary",
  "blue",
  GET_ON_INIT,
);
export const secondaryAtom = atomWithStorageBroadcast(
  "theme-secondary",
  "pink",
  GET_ON_INIT,
);
export const darkAtom = atomWithStorageBroadcast(
  "theme-dark",
  true,
  GET_ON_INIT,
);
/** END STORE **/

/**
 * Configures CSS variables using the body tag for all 1-12 levels
 *
 * @param property Sets the targeted semantic property (primary, secondary, base, etc)
 * @param targetColor to be this target color
 * @param alpha with optionally the alpha palette
 */
const setCssVariable = (
  property: string,
  targetColor: string,
  alpha: boolean = false,
) => {
  const A = alpha ? "a" : "";
  for (let i = 1; i <= 12; i++) {
    const propertyLevel = `--${property}-${A}${i}`;
    document.body.style.setProperty(
      propertyLevel,
      `var(--${targetColor}-${A}${i})`,
    );
  }
};

/**
 * Initializes the theme based on the current state. This function should only be called once
 *
 * @return {null} This function does not return any value.
 */
export function useThemeInit() {
  // const [base] = useAtom(baseAtom);
  const [primary] = useAtom(primaryAtom);
  const [secondary] = useAtom(secondaryAtom);
  const [dark] = useAtom(darkAtom);

  useEffect(() => {
    setCssVariable("base", BASE_MAPPING[primary] || primary);
    setCssVariable("primary", primary);
    setCssVariable("primary", primary, true);
  }, [primary]);

  useEffect(() => {
    setCssVariable("secondary", secondary);
    setCssVariable("secondary", secondary, true);
  }, [secondary]);

  useEffect(() => {
    document.body.classList.remove(
      "dark",
      "light",
      "hc-primary",
      "hc-secondary",
    );
    document.body.classList.add(dark ? "dark" : "light");
    if (dark) {
      if (THEME_DARK_FOREGROUND_TXT_COLORS.includes(primary))
        document.body.classList.add("hc-primary");
      if (THEME_DARK_FOREGROUND_TXT_COLORS.includes(secondary))
        document.body.classList.add("hc-secondary");
    }
  }, [dark, primary, secondary]);

  return null; // This component doesn't need to render anything visible
}
