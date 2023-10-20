import dayjs from "dayjs";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const localeAtom = atom({
  lang: window.localStorage.getItem("i18nextLng") ?? navigator.language,
  dayjs: (...args: Parameters<typeof dayjs>) => dayjs(...args),
});

export const currentLangAtom = atomWithStorage<Lang>("lang", {
  val: "en",
  display: "English",
  short: "en",
});
