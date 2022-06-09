import { colors, Dark, getCssVar, setCssVar } from "quasar";
import { presets } from "./presets";

type BRAND_COLORS =
    'primary' |
    'secondary' |
    'accent' |
    'dark' |
    'info' |
    'warning' |
    'positive' |
    'negative'


export interface Theme {
    name: string;
    dark: boolean;
    colors: Partial<Record<BRAND_COLORS, string>>;
    override?: Record<string, string>;
}

const DEFAULT_THEME: Theme = {
    name: 'default',
    colors: {
        primary: '#1976d2',
        secondary: '#26A69A',
        accent: '#9C27B0',

        dark: '#1d1d1d',

        positive: '#21BA45',
        negative: '#C10015',
        info: '#31CCEC',
        warning: '#F2C037'
    },
    dark: true
}

export const useThemeStore = defineStore("site-theme", {
    // convert to a function
    state: (): Theme => (presets[0]),
    getters: {
        // fullName: (state) => `${state.firstName} ${state.lastName}`,
        // loggedIn: (state) => state.userId !== null,
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
            Dark.set(this.dark);
        },
        setCustomTheme(this: Theme, prop: BRAND_COLORS, color: `#${string}`) {
            this.name = 'USER'
            this.colors[prop] = color;

            setCompiledTheme(compileTheme(this));
        },
        setCustomThemeDark(this: Theme, bool: boolean) {
            this.dark = bool;
            Dark.set(bool);
        },
        init(this: Theme) {
            setCompiledTheme(compileTheme(this));
            Dark.set(this.dark);
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

const expandColors = ['primary', 'secondary', 'accent']
export function compileTheme(theme: Theme) {
    const colorset = { ...DEFAULT_THEME.colors, ...theme.colors };

    const output = {}

    // convert to #hex
    for (const brand in colorset) {
        if (!colorset[brand].startsWith('#')) {
            output[brand] = colors.getPaletteColor(brand);
        } else {
            output[brand] = colorset[brand];
        }
    }


    // add darken and lighten for main branding colors
    for (const brand of expandColors) {
        output[`${brand}-darken-2`] = colors.lighten(colorset[brand], -30)
        output[`${brand}-darken-1`] = colors.lighten(colorset[brand], -10)
        output[`${brand}-lighten-1`] = colors.lighten(colorset[brand], 10)
        output[`${brand}-lighten-2`] = colors.lighten(colorset[brand], 30)
    }

    return output;
}

export function setCompiledTheme(compiledColors: Record<string, string>) {
    for (const c in compiledColors) {
        setCssVar(c, compiledColors[c]);
    }
}