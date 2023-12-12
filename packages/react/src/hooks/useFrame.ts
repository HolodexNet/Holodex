import { atom } from "jotai";
import { BREAKPOINTS } from "./useBreakpoint";

const MobileSizeBreak = BREAKPOINTS.md;

const _pageIsFullscreenAtom = atom(false);
const _sidebarStateAtom = atom(false);
const _siteLessThanMobileBreakPoint = atom(window.innerWidth < MobileSizeBreak);

export const isSidebarOpenAtom = atom(
  (get) => !get(isFloatingAtom) || get(_sidebarStateAtom),
  (_get, set, val: boolean) => set(_sidebarStateAtom, val),
);

export const onResizeAtom = atom(null, (_get, set) => {
  const width = window.innerWidth;
  set(_siteLessThanMobileBreakPoint, width < MobileSizeBreak);
});

export const indicatePageFullscreenAtom = atom(
  null,
  (_, set, pageIsFullscreen: boolean) => {
    set(isSidebarOpenAtom, false);
    set(_pageIsFullscreenAtom, pageIsFullscreen);
  },
);

export const toggleSidebarAtom = atom(null, (get, set) => {
  const currentOpenStatus = get(isSidebarOpenAtom);
  set(isSidebarOpenAtom, !currentOpenStatus);
});

export const isFloatingAtom = atom(
  (get) => get(_siteLessThanMobileBreakPoint) || get(_pageIsFullscreenAtom),
);

export const isMobileAtom = atom(
  (get) => get(_siteLessThanMobileBreakPoint), //&& /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
);
