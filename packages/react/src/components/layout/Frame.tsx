import "./Frame.scss";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  isFloatingAtom,
  isMobileAtom,
  onResizeAtom,
  toggleSidebarAtom,
  sidebarShouldBeFullscreenAtom,
  openSidebarAtom,
  isSidebarOpenAtom,
} from "@/hooks/useFrame";
import { useAtomValue, useSetAtom } from "jotai/react";
import { darkAtom } from "@/hooks/useTheme";
import { Header } from "@/components/header/header";
import { Toaster } from "@/shadcn/ui/toaster";
import clsx from "clsx";
import { orgAtom } from "@/store/org";
import { ErrorFallback } from "../common/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "../common/Loading";

export function Frame() {
  const location = useLocation();
  const toggle = useSetAtom(toggleSidebarAtom);
  const resize = useSetAtom(onResizeAtom);
  const dark = useAtomValue(darkAtom);
  const org = useAtomValue(orgAtom);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const floating = useAtomValue(isFloatingAtom);
  const open = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);
  console.log(fs);

  if (location.pathname === "/") return <Navigate to={`/org/${org}`} />;

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
      <Header id="header"/>
      <main className="">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Loading size="xl" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      {isMobile && <footer className="">Footer</footer>}
      <Toaster />
    </div>
  );
}
