import { localeAtom } from "@/store/i18n";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

export function formatDuration(millisecs: number) {
  const seconds = millisecs / 1000;
  const s = Math.abs(millisecs / 1000);

  const t = [0, 0, 0];
  let r = s % 3600;

  t[0] = Math.floor(s / 3600);
  t[1] = Math.floor(r / 60);
  r = r % 60;
  t[2] = Math.floor(r);

  return (
    (seconds < 0 ? "-" : "") +
    (t[0] < 10 ? "0" : "") +
    t[0] +
    ":" +
    (t[1] < 10 ? "0" + t[1] : t[1]) +
    ":" +
    (t[2] < 10 ? "0" + t[2] : t[2])
  );
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
