import "./Frame.scss";
// import { InPortal, createHtmlPortalNode } from "react-reverse-portal";
import { Header } from "@/components/header/header";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
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
import {
  currentVideoAtom,
  defaultPlayerEventBus,
  miniPlayerAtom,
  playerLocationAtom,
  playerRefAtom,
} from "@/store/player";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import React, { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ReactPlayer from "react-player";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ErrorFallback } from "../common/ErrorFallback";
import { Loading } from "../common/Loading";
import { MiniPlayer } from "../player/MiniPlayer";

export function Frame() {
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
      <DefaultPlayerContainer />
      {miniPlayer && <MiniPlayer />}
      <Toaster />
    </div>
  );
}

const DefaultPlayerContainer = React.memo(() => {
  const setPlayerRef = useSetAtom(playerRefAtom);
  const currentVideo = useAtomValue(currentVideoAtom);
  const locations = useAtomValue(playerLocationAtom);
  const page = useLocation();
  const miniPlayer = useAtomValue(miniPlayerAtom);

  return (
    <div
      className={clsx([
        "fixed",
        page.pathname.startsWith("/watch") || miniPlayer ? "z-10" : "-z-10",
      ])}
      style={locations}
    >
      <ReactPlayer
        ref={setPlayerRef}
        // pass `key` to prevent flicker issue https://github.com/CookPete/react-player/issues/413#issuecomment-395404630
        key={currentVideo?.url}
        style={{
          aspectRatio: "16 / 9",
        }}
        width="100%"
        height="100%"
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
        onStart={() =>
          defaultPlayerEventBus.emit("onStart", currentVideo?.id || "")
        }
        onPlay={() =>
          defaultPlayerEventBus.emit("onPlay", currentVideo?.id || "")
        }
        onPause={() =>
          defaultPlayerEventBus.emit("onPause", currentVideo?.id || "")
        }
        onBuffer={() =>
          defaultPlayerEventBus.emit("onBuffer", currentVideo?.id || "")
        }
        onBufferEnd={() =>
          defaultPlayerEventBus.emit("onBufferEnd", currentVideo?.id || "")
        }
        onClickPreview={(e) =>
          defaultPlayerEventBus.emit(
            "onClickPreview",
            currentVideo?.id || "",
            e,
          )
        }
        onError={(a, b, c, d) =>
          defaultPlayerEventBus.emit(
            "onError",
            currentVideo?.id || "",
            a,
            b,
            c,
            d,
          )
        }
        onEnablePIP={() =>
          defaultPlayerEventBus.emit("onEnablePIP", currentVideo?.id || "")
        }
        onDisablePIP={() =>
          defaultPlayerEventBus.emit("onDisablePIP", currentVideo?.id || "")
        }
        onProgress={(state) =>
          defaultPlayerEventBus.emit(
            "onProgress",
            currentVideo?.id || "",
            state,
          )
        }
        onDuration={(dur) =>
          defaultPlayerEventBus.emit("onDuration", currentVideo?.id || "", dur)
        }
        onSeek={(s) =>
          defaultPlayerEventBus.emit("onSeek", currentVideo?.id || "", s)
        }
        onEnded={() => {
          defaultPlayerEventBus.emit("onEnded", currentVideo?.id || "");
          // advance to the next video?
          // TODO move this behavior into the watch page.
          // const nextVideo =
          //   queue[queue.findIndex(({ id }) => currentVideo?.id === id) + 1] ??
          //   currentVideo;
          // setCurrentVideo(nextVideo);
          // if (location.pathname.startsWith("/watch"))
          //   navigate(`/watch/${nextVideo.id}`, {
          //     state: { isMinimizable: false },
          //   });
        }}
      />
    </div>
  );
});
