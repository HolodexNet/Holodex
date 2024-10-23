import "./Frame.scss";
import { Header } from "@/components/header/header";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  headerHiddenAtom,
  indicatePageFullscreenAtom,
  isSidebarFloatingAtom,
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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ErrorFallback } from "../common/ErrorFallback";
import { Loading } from "../common/Loading";
import { MiniPlayer } from "../player/MiniPlayer";
import { Footer } from "./Footer";
import SelectionFooter from "./SelectionFooter";
import { selectionModeAtom } from "@/hooks/useVideoSelection";
import { videoReportAtom } from "@/store/video";
import React from "react";

export function LocationAwareReactivity() {
  const location = useLocation();
  const navigate = useNavigate();
  const org = useAtomValue(orgAtom);
  const indicatePageFullscreen = useSetAtom(indicatePageFullscreenAtom);

  useEffect(() => {
    if (location.pathname === "/") {
      console.log("redirecting to org", org);
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

const LazyVideoReportDialog = React.lazy(() => import("../video/VideoReport"));

export function Frame() {
  console.log("rerendered frame!");
  const resize = useSetAtom(onResizeAtom);
  const dark = useAtomValue(darkAtom);
  const miniPlayer = useAtomValue(miniPlayerAtom);
  const headerHidden = useAtomValue(headerHiddenAtom);
  const floating = useAtomValue(isSidebarFloatingAtom);
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
    "selection-footer-shown": useAtomValue(selectionModeAtom),
    dark: dark,
  });

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const [reportedVideo, setReportedVideo] = useAtom(videoReportAtom);

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
      <SelectionFooter />
      {reportedVideo && (
        <LazyVideoReportDialog
          open={!!reportedVideo}
          onOpenChange={() => setReportedVideo(null)}
          video={reportedVideo}
        />
      )}

      {isMobile && <Footer />}
      {miniPlayer && <MiniPlayer />}
      <Toaster />
    </div>
  );
}
