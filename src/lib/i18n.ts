import { create } from "zustand"

import { UI_LANGS } from "@/lib/consts"
import enMessages from "@/locales/en/ui.yml"

/**
 * Translations live in src/locales/<locale>/ui.yml and are managed through
 * Crowdin. The files use the vue-i18n message format of the previous UI
 * (`{0}` / `{name}` placeholders, `a | b` plural forms, list values), which
 * this small runtime understands directly so no translation needs converting.
 */

type Messages = { [key: string]: Messages | string | string[] }
type Params = Record<string, string | number> | (string | number)[]

const loaders = import.meta.glob<{ default: Messages }>("../locales/*/ui.yml")

const fallback = enMessages as Messages

interface I18nStore {
  lang: string
  messages: Messages
}

const useI18nStore = create<I18nStore>(() => ({
  lang: "en",
  messages: fallback,
}))

function lookup(messages: Messages, key: string): unknown {
  let node: unknown = messages
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return node
}

function interpolate(message: string, params?: Params): string {
  if (!params) return message
  return message.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = Array.isArray(params)
      ? params[Number(name)]
      : params[name]
    return value === undefined ? match : String(value)
  })
}

function resolve(messages: Messages, key: string): unknown {
  return lookup(messages, key) ?? lookup(fallback, key)
}

function translate(messages: Messages, key: string, params?: Params): string {
  const message = resolve(messages, key)
  return typeof message === "string" ? interpolate(message, params) : key
}

/** vue-i18n plural rule: "zero | one | many" or "one | many". */
function translatePlural(
  messages: Messages,
  key: string,
  count: number,
  params?: Params
): string {
  const message = resolve(messages, key)
  if (typeof message !== "string") return key
  const forms = message.split("|").map((form) => form.trim())
  let form = forms[0]
  if (forms.length === 2) form = count === 1 ? forms[0] : forms[1]
  if (forms.length >= 3) form = forms[Math.min(count, 2)]
  const merged = Array.isArray(params)
    ? params
    : { n: count, count, ...params }
  return interpolate(form, merged)
}

export interface Translator {
  /** Translates a key, falling back to English and then to the key itself. */
  t: (key: string, params?: Params) => string
  /** Translates a key that has plural forms. */
  tc: (key: string, count: number, params?: Params) => string
  /** Returns a list-valued message, e.g. the grid size names. */
  tl: (key: string) => string[]
  lang: string
}

function makeTranslator({ lang, messages }: I18nStore): Translator {
  return {
    lang,
    t: (key, params) => translate(messages, key, params),
    tc: (key, count, params) => translatePlural(messages, key, count, params),
    tl: (key) => {
      const value = resolve(messages, key)
      return Array.isArray(value) ? value.map(String) : []
    },
  }
}

let memo: { state: I18nStore; translator: Translator } | null = null

function selectTranslator(state: I18nStore): Translator {
  if (memo?.state !== state) {
    memo = { state, translator: makeTranslator(state) }
  }
  return memo.translator
}

export function useT(): Translator {
  return useI18nStore(selectTranslator)
}

/** For code outside React (toasts, document titles set from effects). */
export function getT(): Translator {
  return selectTranslator(useI18nStore.getState())
}

let requested = "en"

export async function setLanguage(lang: string): Promise<void> {
  requested = lang
  const dir = UI_LANGS.find((l) => l.val === lang)?.dir ?? "en"
  document.documentElement.lang = intlLocale(lang)

  if (dir === "en") {
    useI18nStore.setState({ lang, messages: fallback })
    return
  }

  const loader = loaders[`../locales/${dir}/ui.yml`]
  try {
    const messages = loader ? (await loader()).default : fallback
    // A newer request may have superseded this one while it was loading.
    if (requested === lang) useI18nStore.setState({ lang, messages })
  } catch {
    if (requested === lang) useI18nStore.setState({ lang, messages: fallback })
  }
}

const INTL_OVERRIDES: Record<string, string> = {
  "lol-UWU": "en",
  "lol-PEKO": "en",
  zh: "zh-TW",
}

/** BCP 47 tag to hand to `Intl` for a UI language. */
export function intlLocale(lang: string): string {
  return INTL_OVERRIDES[lang] ?? lang
}
