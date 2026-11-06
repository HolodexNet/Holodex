/** How a time was settled, which decides whether it's worth playing right away. */
export type TimeCommit = "enter" | "blur" | "step" | "save"

/**
 * What the song editor's text boxes have in common. Song titles aren't words, so
 * nothing should underline them, capitalise them or correct them, and browsers and
 * password managers shouldn't offer a person's own name for a field labelled "name".
 */
export const PLAIN_TEXT_INPUT = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-form-type": "other",
} as const

/**
 * The Enter that confirms an input method's conversion isn't the person's Enter.
 * Safari reports it as finished by then, and only the old key code gives it away.
 */
export function isComposingKey(event: {
  nativeEvent: { isComposing: boolean }
  keyCode: number
}): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229
}
