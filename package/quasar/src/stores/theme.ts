import { Theme, setCompiledTheme, compileTheme, BRAND_COLORS } from "@/hooks/theme-changer/helpers";
import { presets } from "@/hooks/theme-changer/presets";

export const useThemeStore = defineStore("site-theme", {
    // convert to a function
    state: (): Theme => (presets[0]),
    getters: {
    },
    actions: {
        setTheme(this: Theme, name: string) {
            const a = presets.find(x => x.name === name)
            if (!a) return;
            this.colors = a.colors;
            this.dark = a.dark;
            this.name = a.name;
            this.override = a.override;

            setCompiledTheme(compileTheme(this));
            // Dark.set(this.dark);
        },
        setCustomTheme(this: Theme, prop: BRAND_COLORS, color: `#${string}`) {
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
