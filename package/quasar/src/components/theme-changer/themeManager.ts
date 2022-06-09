import { colors, LocalStorage, Dark, Dialog, setCssVar } from 'quasar'

import ThemeCustomizationDialog from 'theme-manager/components/ThemeCustomizationDialog'
import { themes } from './presets'

const LOCAL_STORAGE_KEY = 'quasar-theme-manager'
const ACTIVE_THEMES_KEY = 'activeThemes'

const DARK = true;
const LIGHT = false;

const BRAND_COLORS = [
    'primary',
    'secondary',
    'accent',
    'dark',
    'info',
    'warning',
    'positive',
    'negative'
]

const DEFAULT_COLORS = Object.fromEntries(BRAND_COLORS.map(brand => [brand, colors.getBrand(brand)]))

export const getTheme = (themeName: string, dark: boolean) => {
    const mode = dark == null ? Dark.isActive : dark

    return themes.find(theme => theme.isDark === mode && theme.name === themeName) || themes.find(theme => theme.isDark);
}

// First valid theme of each mode becomes the "default"
const DEFAULT_LIGHT_THEME = getTheme('', LIGHT).name
const DEFAULT_DARK_THEME = getTheme('', DARK).name

export const applyTheme = theme => {
    const mergedColors = { ...DEFAULT_COLORS, ...theme.colors }

    Object.keys(mergedColors).forEach(brand => {
        const color = mergedColors[brand].startsWith('#')
            ? mergedColors[brand]
            : colors.getPaletteColor(mergedColors[brand])

        if (color == null) {
            return
        }

        setCssVar(brand, color)
    })
}

export const loadThemeFromStorage = (isDark) => {
    if (!LocalStorage.has(LOCAL_STORAGE_KEY)) {
        return isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME
    }

    const themeStorage = LocalStorage.getItem(LOCAL_STORAGE_KEY)
    const mode = isDark ? 'dark' : 'light'

    return themeStorage[ACTIVE_THEMES_KEY][mode]
}

export const theming = defineComponent({
    data() {
        return {
            activeDarkTheme: null,
            activeLightTheme: null
        }
    },
    computed: {
        darkTheme: {
            get() {
                return this.activeDarkTheme
            },
            set(themeName) {
                this.saveAndApplyTheme(themeName, DARK)
            }
        },
        isDark() {
            return Dark.isActive
        },
        lightTheme: {
            get() {
                return this.activeLightTheme
            },
            set(themeName) {
                this.saveAndApplyTheme(themeName, LIGHT)
            }
        },
        themes() {
            return {
                light: themes.filter(theme => theme.isDark === false),
                dark: themes.filter(theme => theme.isDark === true)
            }
        },
        themeSettings() {
            return {
                [ACTIVE_THEMES_KEY]: {
                    dark: this.activeDarkTheme,
                    light: this.activeLightTheme
                }
            }
        }
    },
    methods: {
        openThemeCustomizationDialog() {
            Dialog.create({
                component: ThemeCustomizationDialog,
            })
        },
        persistThemeSettingsToStorage() {
            LocalStorage.set(LOCAL_STORAGE_KEY, this.themeSettings)
        },
        saveAndApplyTheme(themeName, isDark) {
            const activeTheme = isDark ? this.activeDarkTheme : this.activeLightTheme

            const theme = getTheme(themeName, isDark)

            if (activeTheme.name === theme.name) {
                return
            }

            if (theme.isDark) {
                this.activeDarkTheme = theme.name
            } else {
                this.activeLightTheme = theme.name
            }

            if (this.isDark === isDark) {
                applyTheme(theme)
            }

            this.persistThemeSettingsToStorage()
        }
    },
    setup() {
        const theme = useLocalStorage();
    },
    created() {
        this.activeDarkTheme = getTheme(loadThemeFromStorage(DARK), DARK).name
        this.activeLightTheme = getTheme(loadThemeFromStorage(LIGHT), LIGHT).name

        applyTheme(getTheme(this.isDark ? this.activeDarkTheme : this.activeLightTheme, this.isDark))
    },
    watch: {
        isDark: function (newValue) {
            const themeName = newValue ? this.activeDarkTheme : this.activeLightTheme
            applyTheme(getTheme(themeName, newValue))
        }
    }
})
