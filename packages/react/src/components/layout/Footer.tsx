import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { openSidebarAtom } from "@/hooks/useFrame";

export const Footer = () => {
  const { t } = useTranslation();
  const openSidebar = useSetAtom(openSidebarAtom);

  const navItems = [
    {
      icon: "i-heroicons:bars-3",
      label: "Menu",
      onClick: () => {
        openSidebar();
      },
    },
    {
      icon: "i-heroicons:heart",
      label: t("component.mainNav.favorites"),
      href: "/favorites",
    },
    {
      icon: "i-heroicons:queue-list",
      label: t("component.mainNav.playlist"),
      href: "/playlists",
    },
    {
      icon: "i-heroicons:cog-6-tooth",
      label: t("component.mainNav.settings"),
      href: "/settings",
    },
  ];

  return (
    <footer
      id="footer"
      className="fixed inset-x-0 bottom-0 border-t border-base-5 bg-base-2 p-1"
    >
      <nav className="flex items-center justify-between">
        {navItems.map((item, index) => (
          <FooterItem key={index} {...item} />
        ))}
      </nav>
    </footer>
  );
};
const FooterItem = ({
  icon,
  label,
  href,
  onClick,
}: {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive =
    href === location.pathname ||
    (href?.startsWith("/settings") &&
      location.pathname.startsWith("/settings")) ||
    (href?.startsWith("/about") && location.pathname.startsWith("/about"));

  const Comp = href ? Link : "div";
  return (
    <Comp
      to={href || "#"}
      onClick={onClick}
      className={cn(
        "flex basis-1/4 flex-col items-center justify-center text-xs",
        isActive ? "text-primary" : "text-base-11",
      )}
    >
      <span className={cn(icon, "mb-1 text-xl")}></span>
      {label}
    </Comp>
  );
};
