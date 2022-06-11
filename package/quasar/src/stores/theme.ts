import { Theme, setCompiledTheme, compileTheme, VuetifyBrandColors } from "@/hooks/theme-changer/helpers";
import { presets } from "@/hooks/theme-changer/presets";
import { convertToHsl, DaisyColorName, DaisyColorShorthand } from "daisyui/src/colors/functions.js";

export const useThemeStore = defineStore("site-theme", {
    // convert to a function
    state: (): Theme => (presets[0]),
    getters: {
        compiledColors: (state): [VuetifyBrandColors, Record<DaisyColorShorthand, string>] => {
            const convert = convertToHsl(state.colors);
            const hsl = (e: string) => `hsl(${e})`

            return [{
                background: hsl(convert['--b1']),
                surface: hsl(convert['--b2']),
                primary: hsl(convert['--n']),
                secondary: hsl(convert['--n']),
                accent: hsl(convert['--a']),
                error: hsl(convert['--er']),
                success: hsl(convert['--su']),
                info: hsl(convert['--in']),
                warning: hsl(convert['--wa']),
            }, convert]
        }
    },
    actions: {
        setTheme(this: Theme, name: string) {
            const a = presets.find(x => x.name === name)
            if (!a) return;
            this.colors = a.colors;
            this.dark = a.dark;
            this.name = a.name;

            setCompiledTheme(compileTheme(this));
            // Dark.set(this.dark);
        },
        setCustomTheme(this: Theme, prop: DaisyColorName, color: `#${string}`) {
            this.name = 'USER'
            this.colors[prop] = color;

            setCompiledTheme(compileTheme(this));
        },
        setCustomThemeDark(this: Theme, bool: boolean) {
            this.dark = bool;
            // Dark.set(bool);
        },
        init(this: Theme) {
            setCompiledTheme(compileTheme(this));
            // Dark.set(this.dark);
        }
    },
    share: {
        enable: true,
        initialize: true, // when initializing, fetch from another tab.
    },
    persistedState: {
        persist: true,
    }
});
