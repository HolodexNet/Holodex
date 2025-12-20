import { useEffect } from "react";
import { atomWithStorageBroadcast } from "@/lib/jotai/atomWithStorageBroadcast";
import { useAtom } from "jotai";
import { GET_ON_INIT } from "@/lib/consts";
import { generateTheme } from "../utils/themeGenerator";

/** STORE **/
export const primaryHexAtom = atomWithStorageBroadcast(
  "theme-primary-hex",
  "#8A2BE2", // Default Primary
  GET_ON_INIT,
);
export const secondaryHexAtom = atomWithStorageBroadcast(
  "theme-secondary-hex",
  "#FF6347", // Default Secondary
  GET_ON_INIT,
);
export const baseColorAtom = atomWithStorageBroadcast(
  "theme-base-color",
  "#808080", // Default Base
  GET_ON_INIT,
);
export const darkAtom = atomWithStorageBroadcast(
  "theme-dark",
  true,
  GET_ON_INIT,
);
/** END STORE **/

/**
 * Initializes the theme based on the current state. This function should only be called once
 *
 * @return {null} This function does not return any value.
 */
export function useThemeInit() {
  const [primaryHex] = useAtom(primaryHexAtom);
  const [secondaryHex] = useAtom(secondaryHexAtom);
  const [baseColor] = useAtom(baseColorAtom);
  const [dark] = useAtom(darkAtom);

  useEffect(() => {
    const mode = dark ? "dark" : "light";
    const themeVariables = generateTheme(
      primaryHex,
      secondaryHex,
      baseColor,
      mode,
    );

    // Apply variables to documentElement (root) so that derived variables in :root (like --color-primary)
    // can resolve using the updated values.
    Object.entries(themeVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Handle classList for dark/light mode
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(mode);
  }, [primaryHex, secondaryHex, baseColor, dark]);

  return null; // This component doesn't need to render anything visible
}
