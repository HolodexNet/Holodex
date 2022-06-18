import { store, Store } from './store'
import { genId, getKeyValue, prefersDarkMode, prefersLightMode } from './util'

export interface Theme {
    meta?: {
        darkMode?: boolean
        [prop: string]: any
    }
    theme: object
}

export interface ThemingOptions<T extends Theme> {
    initial: T
    light?: T
    dark?: T
    id?: string
    selector?: string
}

function genTheme(new_theme: object, prefix = '-'): string {
    const get = getKeyValue(new_theme)
    return Object.keys(new_theme)
        .map((key: string) =>
            typeof get(key) === 'object'
                ? genTheme(get(key), `${key}`)
                : `${key}: ${get(key)};`
        )
        .join('\n')
}

function createStyleElement(id?: string): HTMLStyleElement {
    const $style = document.createElement('style')
    $style.id = id || genId()
    document.head.appendChild($style)
    return $style
}

/**
 * Returns an instanced store that can be .set, every time you .set it'll apply the theme to the selector
 * @param param0 
 * @returns 
 */
export function useCSSVarTheme<T extends Theme>({
    initial,
    light,
    dark,
    id,
    selector,
}: ThemingOptions<T>): Store<T> {
    let used_theme = initial
    if (prefersDarkMode() && dark) {
        used_theme = dark
    }
    if (prefersLightMode() && light) {
        used_theme = light
    }
    const theme_store = store(used_theme)

    const $style = createStyleElement(id)
    theme_store.subscribe((t) => {
        $style.textContent = `${selector || ':root'} {
  ${genTheme(t.theme)}
}`
    })

    return theme_store
}
