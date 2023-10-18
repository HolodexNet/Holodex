import dayjs from "dayjs";
import { atom } from "jotai";

export const localeAtom = atom({
  lang: window.localStorage.getItem("i18nextLng") ?? navigator.language,
  dayjs: (...args: Parameters<typeof dayjs>) => dayjs(...args),
});
