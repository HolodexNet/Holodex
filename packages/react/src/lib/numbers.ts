import { localeAtom } from "@/store/i18n";
import { getDefaultStore } from "jotai";

export const store = getDefaultStore();

const numberFormatAdjust: Record<string, string> = {
  "lol-UWU": "en",
  "lol-PEKO": "en",
};
/**
 * Formats a number or string into a localized count format.
 *
 * @param {number | string} n - The number or string to format.
 * @param {string} lng - The language code for localization (default is "en").
 * @return {string} The formatted count as a string.
 */

export function formatCount(n: number | string, lng = "en") {
  const { lang } = store.get(localeAtom);
  const converted = lang ?? numberFormatAdjust[lng] ?? lng;

  return new Intl.NumberFormat(converted, {
    compactDisplay: "short",
    notation: "compact",
    maximumSignificantDigits: 3,
  }).format(Number(n));
}
