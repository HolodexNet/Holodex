import { useThemeStore } from "@/stores/theme";
import { useTheme } from "vuetify";
import { useCSSVarTheme } from "./css-var-theme";

export function useThemeInitialization() {
  const theme = useThemeStore();

  if (window.currentTheme !== theme.name) {
    theme.init();
    window.currentTheme = theme.name;
  }

  const vt = useTheme();

  const daisyTheme = useCSSVarTheme({
    initial: { theme: theme.outputCache[1] },
  });

  watch(
    () => [theme.outputCache, theme.outputCacheTS],
    () => {
      console.log("Applying Color Cache to Themes...");
      vt.themes.value[vt.name.value].colors = theme.outputCache[0] as any;
      daisyTheme.set({ theme: theme.outputCache[1] });
    }
  );
  vt.themes.value[vt.name.value].colors = theme.outputCache[0] as any;

  return { theme };
}
