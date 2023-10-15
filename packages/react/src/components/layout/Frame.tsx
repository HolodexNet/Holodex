import "./Frame.scss";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ReactPropTypes, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  isFloatingAtom,
  isMobileAtom,
  onResizeAtom,
  sidebarOpenAtom,
  sidebarShouldBeFullscreenAtom,
  toggleAtom,
} from "@/hooks/useFrame";
import { useAtomValue, useSetAtom } from "jotai/react";
import { darkAtom } from "@/hooks/useTheme";
import { Header } from "@/components/header/header";
import { Toaster } from "@/shadcn/ui/toaster";
import clsx from "clsx";
import { orgAtom } from "@/store/org";
import { ErrorFallback } from "../common/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";

export function Frame() {
  const location = useLocation();
  const toggle = useSetAtom(toggleAtom);
  const resize = useSetAtom(onResizeAtom);
  const dark = useAtomValue(darkAtom);
  const org = useAtomValue(orgAtom);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const floating = useAtomValue(isFloatingAtom);
  const open = useAtomValue(sidebarOpenAtom);
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
      <aside className="border-r border-r-base z-50">
        <Sidebar id="sidebar" onClose={toggle} />
      </aside>
      <Header onClick={toggle} id="header" />
      <main className="">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
      </main>
      {isMobile && <footer className="">Footer</footer>}
      <Toaster />
    </div>
  );
}
