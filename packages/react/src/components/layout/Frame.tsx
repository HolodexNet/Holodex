import "./Frame.scss";
import { Header } from "@/components/header/header";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  headerHiddenAtom,
  indicatePageFullscreenAtom,
  isFloatingAtom,
  isMobileAtom,
  isSidebarOpenAtom,
  onResizeAtom,
  sidebarShouldBeFullscreenAtom,
  toggleSidebarAtom,
} from "@/hooks/useFrame";
import { darkAtom } from "@/hooks/useTheme";
import { Toaster } from "@/shadcn/ui/toaster";
import { orgAtom } from "@/store/org";
import { miniPlayerAtom } from "@/store/player";
import clsx from "clsx";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ErrorFallback } from "../common/ErrorFallback";
import { Loading } from "../common/Loading";
import { MiniPlayer } from "../player/MiniPlayer";
import { DefaultPlayerContainer } from "./DefaultPlayerContainer";
import { useOnClickOutside } from "usehooks-ts";

export function Frame() {
  console.log("rerendered frame!");

  const location = useLocation();
  const navigate = useNavigate();
  const toggle = useSetAtom(toggleSidebarAtom);
  const resize = useSetAtom(onResizeAtom);
  const dark = useAtomValue(darkAtom);
  const org = useAtomValue(orgAtom);
  const miniPlayer = useAtomValue(miniPlayerAtom);
  const headerHidden = useAtomValue(headerHiddenAtom);
  const ref = useRef(null);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const floating = useAtomValue(isFloatingAtom);
  const [open, setOpen] = useAtom(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);
  const indicatePageFullscreen = useSetAtom(indicatePageFullscreenAtom);
  // console.log(fs);

  if (location.pathname === "/") navigate(`/org/${org}`, { replace: true });

  useEffect(() => {
    if (
      location.pathname.startsWith("/watch") ||
      location.pathname.startsWith("/edit") ||
      location.pathname.startsWith("/scripteditor")
    ) {
      indicatePageFullscreen(true);
    } else {
      indicatePageFullscreen(false);
    }
  });

  const mainClasses = clsx({
    "mobile-footer": isMobile,
    "sidebar-static": !floating,
    "sidebar-floating": floating,
    "sidebar-open": open,
    "sidebar-closed": !open,
    "sidebar-fullscreen": fs,
    "header-hidden": headerHidden,
    dark: dark,
  });

  const handleClickOutside = () => {
    floating && open && setOpen(false);
  };

  useOnClickOutside(ref, handleClickOutside);
  return (
    <div className={mainClasses} id="layout">
      <aside className="z-50 border-r border-r-base" ref={ref}>
        <Sidebar id="sidebar" onClose={toggle} />
      </aside>
      <Header id="header" />
      <main className="">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Loading size="xl" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      {isMobile && <footer className="">Footer</footer>}
      <DefaultPlayerContainer />
      {miniPlayer && <MiniPlayer />}
      <Toaster />
    </div>
  );
}
