import "./Frame.scss";
import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import {
  isFloatingAtom,
  isMobileAtom,
  isSidebarOpenAtom,
  onResizeAtom,
  indicatePageFullscreenAtom,
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
import Watch from "@/routes/watch";

export function Frame() {
  const location = useLocation();
  const navigate = useNavigate();

  const dark = useAtomValue(darkAtom);
  const org = useAtomValue(orgAtom);
  const miniPlayer = useAtomValue(miniPlayerAtom);
  const ref = useRef(null);

  const frameResize = useSetAtom(onResizeAtom);
  const indicatePageFullscreen = useSetAtom(indicatePageFullscreenAtom);
  useEffect(() => {
    window.addEventListener("resize", frameResize);
    return () => window.removeEventListener("resize", frameResize);
  }, [frameResize]);
  const floating = useAtomValue(isFloatingAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const [open, setOpen] = useAtom(isSidebarOpenAtom);
  useEffect(() => {
    if (
      location.pathname.startsWith("/watch") ||
      location.pathname.startsWith("/edit")
    ) {
      indicatePageFullscreen(true);
    } else {
      indicatePageFullscreen(false);
    }
  }, [indicatePageFullscreen, location]);

  if (location.pathname === "/") navigate(`/org/${org}`, { replace: true });

  const mainClasses = clsx({
    mobile: isMobile,
    "mobile-footer": isMobile,
    "sidebar-static": !floating,
    "sidebar-floating": floating,
    "sidebar-open": open,
    "sidebar-closed": !open,
    // "sidebar-fullscreen": fs,
    dark: dark,
  });

  return (
    <div className={mainClasses} id="layout">
      <aside className="z-50 border-r border-r-base" ref={ref}>
        <Sidebar id="sidebar" onClose={() => setOpen(false)} />
      </aside>
      <Header id="header" />
      <main className="">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Loading size="xl" />}>
            {(location.pathname.startsWith("/watch") ||
              // page.pathname.startsWith("/edit") ||
              miniPlayer) && <Watch></Watch>}
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  );
}
