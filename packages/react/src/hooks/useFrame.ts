import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const MobileSizeBreak = 768;
const FooterSizeBreak = 500;

export const sidebarPrefOpenAtom = atomWithStorage('frames_sidebar_pref_open', true);

export const pageIsFullscreenAtom = atom(false);

export const siteIsSmallAtom = atom(window.innerWidth < MobileSizeBreak);

export const sidebarShouldBeFullscreenAtom = atom(window.innerWidth < FooterSizeBreak);

export const isFloatingAtom = atom(
  (get) => get(siteIsSmallAtom) || get(pageIsFullscreenAtom)
);

export const isMobileAtom = atom(
  (get) => get(sidebarShouldBeFullscreenAtom) //&& /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
);

export const sidebarOpenAtom = atom(window.innerWidth > MobileSizeBreak);

export const onResizeAtom = atom(
  null,
  (get, set) => {
    const width = window.innerWidth;
    set(siteIsSmallAtom, width < MobileSizeBreak);
    set(sidebarShouldBeFullscreenAtom, width < FooterSizeBreak);
    if (width < MobileSizeBreak) {
      console.log("closing")
      set(sidebarOpenAtom, false)
    } else {
      set(sidebarOpenAtom, get(sidebarPrefOpenAtom))
    }
  }
);

export const onNavigateAtom = atom(
  null,
  (get, set, pageIsFullscreen: boolean) => {
    const currentFullscreenStatus = get(pageIsFullscreenAtom);
    if (currentFullscreenStatus !== pageIsFullscreen && pageIsFullscreen) {
      set(sidebarOpenAtom, false);
    }
    else if (currentFullscreenStatus !== pageIsFullscreen && !pageIsFullscreen) {
      set(sidebarOpenAtom, get(sidebarPrefOpenAtom));
    }
    if (currentFullscreenStatus !== pageIsFullscreen) {
      set(pageIsFullscreenAtom, pageIsFullscreen);
    }
  }
);

export const toggleAtom = atom(
  null,
  (get, set) => {
    const currentOpenStatus = get(sidebarOpenAtom);
    set(sidebarOpenAtom, !currentOpenStatus);
    set(sidebarPrefOpenAtom, !currentOpenStatus);
  }
);

export const openAtom = atom(
  null,
  (_, set) => {
    set(sidebarOpenAtom, true);
    set(sidebarPrefOpenAtom, true);
  }
);

export const closeAtom = atom(
  null,
  (_, set) => {
    set(sidebarOpenAtom, false);
    set(sidebarPrefOpenAtom, false);
  }
);