import { useThemeStore } from "@/stores/theme";

export function useThemeInitialization() {
    const theme = useThemeStore();
    if (window.currentTheme !== theme.name) {
        theme.init();
        window.currentTheme = theme.name;
    }
    return { theme }
}