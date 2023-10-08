import { useEffect } from "react";
import { atomWithStorageBroadcast } from "@/lib/atomWithStorageBroadcast";
import { useAtom } from "jotai";


/** STORE **/
export const baseAtom = atomWithStorageBroadcast('theme-base', 'mauve');
export const primaryAtom = atomWithStorageBroadcast('theme-primary', 'blue');
export const secondaryAtom = atomWithStorageBroadcast('theme-secondary', 'pink');
export const darkAtom = atomWithStorageBroadcast('theme-dark', true);
/** END STORE **/


/**
 * Configures CSS variables using the body tag for all 1-12 levels
 * 
 * @param property Sets the targeted semantic property (primary, secondary, base, etc)
 * @param targetColor to be this target color
 * @param alpha with optionally the alpha palette
 */
const setCssVariable = (property: string, targetColor: string, alpha: boolean = false) => {
  const A = alpha ? 'a' : ''
  for (let i = 1; i <= 12; i++) {
    const propertyLevel = `--${property}-${A}${i}`
    document.body.style.setProperty(propertyLevel, `var(--${targetColor}-${A}${i})`);
  }
};


/**
 * Initializes the theme based on the current state. This function should only be called once
 *
 * @return {null} This function does not return any value.
 */
export function useThemeInit() {

  const [base] = useAtom(baseAtom)
  const [primary] = useAtom(primaryAtom)
  const [secondary] = useAtom(secondaryAtom)
  const [dark] = useAtom(darkAtom)

  useEffect(() => {
    setCssVariable('base', base);
  }, [base]); // This effect runs whenever the snapshot (and thus the state) changes

  useEffect(() => {
    setCssVariable('primary', primary);
    setCssVariable('primary', primary, true);
  }, [primary]);

  useEffect(() => {
    setCssVariable('secondary', secondary);
    setCssVariable('secondary', secondary, true);
  }, [secondary]);

  useEffect(() => {
    document.body.classList.remove("dark", "light")
    document.body.classList.add(dark ? 'dark' : 'light');
  }, [dark]);


  return null; // This component doesn't need to render anything visible
};