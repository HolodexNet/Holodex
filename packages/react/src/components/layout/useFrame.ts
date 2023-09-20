import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';

const MobileSizeBreak = 768;
const FooterSizeBreak = 500;

export const frameContext = proxy({
  pageIsFullscreen: false,
  siteIsSmall: window.innerWidth < MobileSizeBreak,
  sidebarShouldBeFullscreen: window.innerWidth < FooterSizeBreak,

  get isFloating() {
    return frameContext.siteIsSmall || frameContext.pageIsFullscreen
  },

  get isMobile() {
    return frameContext.sidebarShouldBeFullscreen && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  },

  // it's always open at init unless it's small.
  sidebarOpen: window.innerWidth < MobileSizeBreak,
  // sidebar would stay open if it could.
  sidebarPrefOpen: true,

  onResize: () => {
    const width = window.innerWidth;
    frameContext.siteIsSmall = width < MobileSizeBreak
    frameContext.sidebarShouldBeFullscreen = width < FooterSizeBreak
  },

  onNavigate: (pageIsFullscreen: boolean) => {
    if (frameContext.pageIsFullscreen != pageIsFullscreen && pageIsFullscreen) {
      // hide the sidebar if we are navigating from a non-fullscreen page to a fullscreen page
      frameContext.sidebarOpen = false;
    }
    else if (frameContext.pageIsFullscreen != pageIsFullscreen && !pageIsFullscreen) {
      // show the sidebar if we are navigating from a fullscreen page to a non-fullscreen page, but only if the preference is to be open.
      // if a user has closed it then it'll prefer to stay closed.
      // TODO maybe extract prefOpen into a separate stored state for long term?
      frameContext.sidebarOpen = frameContext.sidebarPrefOpen
    }
    if (frameContext.pageIsFullscreen != pageIsFullscreen) {
      frameContext.pageIsFullscreen = pageIsFullscreen
    }
  },

  toggle: () => {
    frameContext.sidebarOpen = !frameContext.sidebarOpen;
    frameContext.sidebarPrefOpen = frameContext.sidebarOpen;
  },

  open: () => {
    frameContext.sidebarOpen = true;
    frameContext.sidebarPrefOpen = frameContext.sidebarOpen;
  },

  close: () => {
    frameContext.sidebarOpen = true;
    frameContext.sidebarPrefOpen = frameContext.sidebarOpen;
  }
})

