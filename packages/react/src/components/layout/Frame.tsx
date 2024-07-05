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
} from "@/hooks/useFrame";
import { darkAtom } from "@/hooks/useTheme";
import { Toaster } from "@/shadcn/ui/toaster";
import { orgAtom } from "@/store/org";
import { miniPlayerAtom } from "@/store/player";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ErrorFallback } from "../common/ErrorFallback";
import { Loading } from "../common/Loading";
import { MiniPlayer } from "../player/MiniPlayer";
import { Footer } from "./Footer";

export function LocationAwareReactivity() {
  const location = useLocation();
  const navigate = useNavigate();
  const org = useAtomValue(orgAtom);
  const indicatePageFullscreen = useSetAtom(indicatePageFullscreenAtom);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate(`/org/${org}`, { replace: true });
    }
  }, [location.pathname, navigate, org]);

  useEffect(() => {
    const isFullscreen =
      location.pathname.startsWith("/watch") ||
      location.pathname.startsWith("/edit") ||
      location.pathname.startsWith("/scripteditor");

    indicatePageFullscreen(isFullscreen);
  }, [location.pathname, indicatePageFullscreen]);

  return <></>;
}

export function Frame() {
  console.log("rerendered frame!");
  const resize = useSetAtom(onResizeAtom);
  const dark = useAtomValue(darkAtom);
  const miniPlayer = useAtomValue(miniPlayerAtom);
  const headerHidden = useAtomValue(headerHiddenAtom);
  const floating = useAtomValue(isFloatingAtom);
  const open = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);

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

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className={mainClasses} id="layout">
      <LocationAwareReactivity />
      <Sidebar />
      <Header id="header" />
      <main className="">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Loading size="xl" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      {isMobile && <Footer />}
      {miniPlayer && <MiniPlayer />}
      <Toaster />
    </div>
  );
}
