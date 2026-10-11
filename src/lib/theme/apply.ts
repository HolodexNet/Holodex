import { derivePalette, type ResolvedMode } from "./palette"

export const THEME_CACHE_KEY = "holodex-v3/theme-cache"

const DARK_QUERY = "(prefers-color-scheme: dark)"

export function systemMode(): ResolvedMode {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

export function onSystemModeChange(listener: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener("change", listener)
  return () => query.removeEventListener("change", listener)
}

/** Suppresses transitions for one frame so a theme switch does not smear. */
function withoutTransitions(run: () => void) {
  const style = document.createElement("style")
  style.textContent =
    "*,*::before,*::after{transition:none!important;animation-duration:0s!important}"
  document.head.appendChild(style)
  run()
  // Force a style flush, then drop the override on the next frames.
  void window.getComputedStyle(document.body).opacity
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
}

/**
 * Computes the palette for a primary colour and writes it to the document.
 * The result is cached so index.html can restore it before first paint.
 */
export function applyTheme(primary: string, mode: ResolvedMode) {
  const palette = derivePalette(primary, mode)
  const root = document.documentElement

  withoutTransitions(() => {
    root.classList.toggle("dark", mode === "dark")
    root.style.colorScheme = mode
    for (const [name, value] of Object.entries(palette.vars)) {
      root.style.setProperty(name, value)
    }
  })

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", palette.background)

  try {
    localStorage.setItem(
      THEME_CACHE_KEY,
      JSON.stringify({ mode, vars: palette.vars, background: palette.background })
    )
  } catch {
    // Storage may be unavailable (private mode, quota); theming still works.
  }
}
