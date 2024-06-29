import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { orgAtom } from "@/store/org";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const FooterItem = ({
  icon,
  label,
  href,
}: {
  icon: string;
  label: string;
  href: string;
}) => {
  const location = useLocation();
  const isActive =
    href === location.pathname ||
    (href.startsWith("/settings") &&
      location.pathname.startsWith("/settings")) ||
    (href.startsWith("/about") && location.pathname.startsWith("/about"));

  return (
    <Link
      to={href}
      className={cn(
        "flex basis-1/5 flex-col items-center justify-center text-xs",
        isActive ? "text-primary" : "text-base-11",
      )}
    >
      <span className={cn(icon, "mb-1 text-2xl")}></span>
      {label}
    </Link>
  );
};

export const Footer = () => {
  const { t } = useTranslation();
  const org = useAtomValue(orgAtom);

  const navItems = [
    {
      icon: "i-heroicons:home",
      label: t("component.mainNav.home"),
      href: `/org/${org}`,
    },
    {
      icon: "i-heroicons:user-group",
      label: t("component.mainNav.channels"),
      href: `/org/${org}/channels`,
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
    <footer className="fixed inset-x-0 bottom-0 border-t border-base-5 bg-base-2 px-4 py-2">
      <nav className="flex items-center justify-between">
        {navItems.map((item, index) => (
          <FooterItem key={index} {...item} />
        ))}
      </nav>
    </footer>
  );
};