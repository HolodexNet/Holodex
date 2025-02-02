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
import { mostRecentOrgAtom, orgRankingAtom } from "@/store/org";
import { miniPlayerAtom } from "@/store/player";
import clsx from "clsx";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect, useState } from "react";
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
import { useOrgs } from "@/services/orgs.service";
import { useTimeout } from "usehooks-ts";
import { defaultOpenAtom } from "@/store/settings";
import {
  abbreviatedSha,
  committerDate,
  lastTag,
  //@ts-expect-error commitssincelasttag
  commitsSinceLastTag,
} from "~build/git";
import dayjs from "dayjs";
import { CalendarGeneratorPopup } from "./CalendarPopup";
import { useSwipeRightInit } from "@/hooks/useSwipeRight";

export function LocationAwareReactivity() {
  const location = useLocation();
  const navigate = useNavigate();
  const org = useAtomValue(mostRecentOrgAtom);
  const defaultOpen = useAtomValue(defaultOpenAtom);
  const indicatePageFullscreen = useSetAtom(indicatePageFullscreenAtom);

  useEffect(() => {
    if (location.pathname === "/") {
      if (defaultOpen === "Favorites") {
        navigate("/favorites", { replace: true });
      }
      console.log("redirecting to org", org);
      navigate(`/org/${org}`, { replace: true });
    }
  }, [defaultOpen, location.pathname, navigate, org]);

  useEffect(() => {
    const isFullscreen =
      location.pathname.startsWith("/watch") ||
      location.pathname.startsWith("/edit") ||
      location.pathname.startsWith("/scripteditor") ||
      location.pathname.startsWith("/tlclient");

    indicatePageFullscreen(isFullscreen);
  }, [location.pathname, indicatePageFullscreen]);

  return <></>;
}

export function GlobalReactivity() {
  const [wait, setWait] = useState(false);
  useTimeout(() => setWait(true), 1000);
  const { data, isError } = useOrgs({ enabled: wait });
  const updateOrgRanking = useSetAtom(orgRankingAtom);
  useEffect(() => {
    if (data && data.length > 0) {
      console.log("updating org ranking");
      updateOrgRanking((orgs: Org[]) => {
        console.log("orgs:", orgs);
        // return orgs;
        return orgs
          .map((org) => data.find((x) => x.name === org.name))
          .filter((x): x is Org => !!x);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return <></>;
}

export function CopyrightNotice() {
  return (
    <div className="mt-16 text-center text-sm text-base-7">
      © 2020-2024 Holodex v{lastTag}.{commitsSinceLastTag}
      <small className="ml-2 inline-block opacity-80">
        b.{abbreviatedSha} / {dayjs(new Date(committerDate)).format("lll")}
      </small>{" "}
      /{" "}
      <a
        href="https://discord.gg/jctkgHBt4b"
        target="_blank"
        className="hover:text-secondary-8 hover:underline"
      >
        Discord
      </a>{" "}
      /{" "}
      <a
        href="https://ko-fi.com/holodex"
        target="_blank"
        className="hover:text-secondary-8 hover:underline"
      >
        Ko-fi
      </a>
    </div>
  );
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
  const ref = useSwipeRightInit();

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

  useEffect(() => {
    // wtf is this code block? it's to fix a pointerEvents:none issue with the document body when ShadCN/radix Dialog is open.
    // https://github.com/radix-ui/primitives/issues/2122
    if (reportedVideo) {
      // Pushing the change to the end of the call stack
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 0);

      return () => clearTimeout(timer);
    } else {
      document.body.style.pointerEvents = "auto";
    }
  }, [reportedVideo]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div ref={ref} className={mainClasses} id="layout">
        <LocationAwareReactivity />
        <Sidebar />
        <Header id="header" />
        <main className="">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<Loading size="xl" />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
          <CopyrightNotice />
        </main>
        <SelectionFooter />
        {reportedVideo && (
          <LazyVideoReportDialog
            open={!!reportedVideo}
            onOpenChange={(x) => !x && setReportedVideo(null)}
            video={reportedVideo}
          />
        )}

        {isMobile && <Footer />}
        {miniPlayer && <MiniPlayer />}
        <Toaster />
        <CalendarGeneratorPopup />
        <GlobalReactivity />
      </div>
    </ErrorBoundary>
  );
}
