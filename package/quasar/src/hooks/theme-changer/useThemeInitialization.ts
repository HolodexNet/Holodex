import { useThemeStore } from "@/stores/theme";
import { useTheme } from "vuetify"
import { useCSSVarTheme } from "./css-var-theme";

export function useThemeInitialization() {
    const theme = useThemeStore();

    const defaultColors = {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: '#6200EE',
        'primary-darken-1': '#3700B3',
        secondary: '#03DAC6',
        'secondary-darken-1': '#018786',
        error: '#B00020',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
    };

    if (window.currentTheme !== theme.name) {

        console.log("Theme Init")
        theme.init();
        window.currentTheme = theme.name;
    }

    const vt = useTheme()

    const daisyTheme = useCSSVarTheme({ initial: { theme: theme.outputCache[1] } })

    watch(theme.colors, () => {
        vt.themes.value[vt.name.value].colors = theme.outputCache[0] as any
        daisyTheme.set({ theme: theme.outputCache[1] })
    })
    vt.themes.value[vt.name.value].colors = theme.outputCache[0] as any

    return { theme }
}