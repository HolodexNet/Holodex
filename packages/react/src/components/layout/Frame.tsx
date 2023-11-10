import "./Frame.scss";
import {
  HtmlPortalNode,
  InPortal,
  createHtmlPortalNode,
} from "react-reverse-portal";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import React, {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  isFloatingAtom,
  isMobileAtom,
  onResizeAtom,
  toggleSidebarAtom,
  sidebarShouldBeFullscreenAtom,
  isSidebarOpenAtom,
} from "@/hooks/useFrame";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { darkAtom } from "@/hooks/useTheme";
import { Header } from "@/components/header/header";
import { Toaster } from "@/shadcn/ui/toaster";
import clsx from "clsx";
import { orgAtom } from "@/store/org";
import { ErrorFallback } from "../common/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "../common/Loading";
import ReactPlayer from "react-player";
import { MiniPlayer } from "../player/MiniPlayer";
import {
  currentVideoAtom,
  miniPlayerAtom,
  playerRefAtom,
  queueAtom,
} from "@/store/player";

export const VideoPortalContext = createContext<HtmlPortalNode>(
  createHtmlPortalNode(),
);

export function Frame() {
  const VideoPortalNode = useMemo(
    () =>
      createHtmlPortalNode({
        attributes: { class: "w-full h-full" },
      }),
    [],
  );
  const location = useLocation();
  const toggle = useSetAtom(toggleSidebarAtom);
  const resize = useSetAtom(onResizeAtom);
  const dark = useAtomValue(darkAtom);
  const org = useAtomValue(orgAtom);
  const miniPlayer = useAtomValue(miniPlayerAtom);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const floating = useAtomValue(isFloatingAtom);
  const open = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);
  // console.log(fs);

  if (location.pathname === "/") return <Navigate to={`/org/${org}`} replace />;

  const mainClasses = clsx({
    "mobile-footer": isMobile,
    "sidebar-static": !floating,
    "sidebar-floating": floating,
    "sidebar-open": open,
    "sidebar-closed": !open,
    "sidebar-fullscreen": fs,
    dark: dark,
  });

  return (
    <VideoPortalContext.Provider value={VideoPortalNode}>
      <div className={mainClasses} id="layout">
        <aside className="z-50 border-r border-r-base">
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
        <VideoPortalContainer />
        {miniPlayer && <MiniPlayer />}
        <Toaster />
      </div>
    </VideoPortalContext.Provider>
  );
}

const VideoPortalContainer = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const setPlayerRef = useSetAtom(playerRefAtom);
  const portalNode = useContext(VideoPortalContext);
  const [currentVideo, setCurrentVideo] = useAtom(currentVideoAtom);
  const queue = useAtomValue(queueAtom);

  // TODO: Find a way to move the player without reloading iframe
  // Element.replaceChildren() without reloading iframe is currently not supported
  // (https://github.com/whatwg/html/issues/5484)
  // Shadow DOM and slots may help to resolve this (https://github.com/whatwg/html/issues/5484#issuecomment-620481794)
  return (
    <InPortal node={portalNode}>
      <ReactPlayer
        ref={setPlayerRef}
        // pass `key` to prevent flicker issue https://github.com/CookPete/react-player/issues/413#issuecomment-395404630
        key={currentVideo?.url}
        style={{
          aspectRatio: "16 / 9",
        }}
        width="100%"
        height="fit-content"
        url={currentVideo?.url}
        controls
        config={{
          youtube: {
            playerVars: {
              origin: window.origin,
              autoplay: 1,
            },
          },
        }}
        onEnded={() => {
          const nextVideo =
            queue[queue.findIndex(({ id }) => currentVideo?.id === id) + 1] ??
            currentVideo;
          setCurrentVideo(nextVideo);
          if (location.pathname.startsWith("/watch"))
            navigate(`/watch/${nextVideo.id}`, {
              state: { isMinimizable: false },
            });
        }}
      />
    </InPortal>
  );
});
