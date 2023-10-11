import "./Frame.scss";
import { RouterProvider } from "react-router-dom";
import router from "@/routes/router";
import { ReactPropTypes, useEffect } from "react";
import classNames from "classnames";
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

export function Frame() {
  const toggle = useSetAtom(toggleAtom);
  const resize = useSetAtom(onResizeAtom);
  const dark = useAtomValue(darkAtom);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const floating = useAtomValue(isFloatingAtom);
  const open = useAtomValue(sidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);
  console.log(fs);

  const mainClasses = classNames({
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
        <RouterProvider router={router}></RouterProvider>
      </main>
      {isMobile && <footer className="">Footer</footer>}
      <Toaster />
    </div>
  );
}
