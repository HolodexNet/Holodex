import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const MobileSizeBreak = 768;
const FooterSizeBreak = 500;

export const sidebarPrefOpenAtom = atomWithStorage(
  "frames_sidebar_pref_open",
  true,
);

export const pageIsFullscreenAtom = atom(false);

export const siteIsSmallAtom = atom(window.innerWidth < MobileSizeBreak);

export const sidebarShouldBeFullscreenAtom = atom(
  window.innerWidth < FooterSizeBreak,
);

export const isFloatingAtom = atom(
  (get) => get(siteIsSmallAtom) || get(pageIsFullscreenAtom),
);

export const isMobileAtom = atom(
  (get) => get(sidebarShouldBeFullscreenAtom), //&& /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
);

export const isSidebarOpenAtom = atom(window.innerWidth > MobileSizeBreak);

export const onResizeAtom = atom(null, (get, set) => {
  const width = window.innerWidth;
  set(siteIsSmallAtom, width < MobileSizeBreak);
  set(sidebarShouldBeFullscreenAtom, width < FooterSizeBreak);
  if (width < MobileSizeBreak) {
    console.log("closing");
    set(isSidebarOpenAtom, false);
  } else {
    set(isSidebarOpenAtom, get(sidebarPrefOpenAtom));
  }
});

export const indicatePageFullscreenAtom = atom(
  null,
  (get, set, pageIsFullscreen: boolean) => {
    const currentFullscreenStatus = get(pageIsFullscreenAtom);
    if (currentFullscreenStatus !== pageIsFullscreen && pageIsFullscreen) {
      set(isSidebarOpenAtom, false);
    } else if (
      currentFullscreenStatus !== pageIsFullscreen &&
      !pageIsFullscreen
    ) {
      set(isSidebarOpenAtom, get(sidebarPrefOpenAtom));
    }
    if (currentFullscreenStatus !== pageIsFullscreen) {
      set(pageIsFullscreenAtom, pageIsFullscreen);
      if (!pageIsFullscreen) set(isSidebarOpenAtom, get(sidebarPrefOpenAtom));
    }
  },
);

export const toggleSidebarAtom = atom(null, (get, set) => {
  const currentOpenStatus = get(isSidebarOpenAtom);
  set(isSidebarOpenAtom, !currentOpenStatus);
  set(sidebarPrefOpenAtom, !currentOpenStatus);
});

export const openSidebarAtom = atom(null, (_, set) => {
  set(isSidebarOpenAtom, true);
  set(sidebarPrefOpenAtom, true);
});

export const closeSidebarAtom = atom(null, (_, set) => {
  set(isSidebarOpenAtom, false);
  set(sidebarPrefOpenAtom, false);
});
