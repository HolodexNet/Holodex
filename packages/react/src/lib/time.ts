import { localeAtom } from "@/store/i18n";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

export function formatDuration(millisecs: number) {
  const negate = millisecs < 0;
  const secs = millisecs / 1000;
  const h = Math.floor(secs / (60 * 60));
  const m = Math.floor((secs % (60 * 60)) / 60);
  const s = Math.floor((secs % (60 * 60)) % 60);
  const hStr = h ? `${h}:` : "";
  const mStr = String(m).padStart(h ? 2 : 1, "0");
  const sStr = String(s).padStart(2, "0");
  return `${negate ? "-" : ""}${hStr}${mStr}:${sStr}`;
}

const numberFormatAdjust: Record<string, string> = {
  "lol-UWU": "en",
  "lol-PEKO": "en",
};

export function formatCount(n: number | string, lng = "en") {
  const { lang } = store.get(localeAtom);
  const converted = lang ?? numberFormatAdjust[lng] ?? lng;

  return new Intl.NumberFormat(converted, {
    compactDisplay: "short",
    notation: "compact",
    maximumSignificantDigits: 3,
  }).format(Number(n));
}
