import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { OrgSelectorCombobox } from "../org/OrgPicker";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import { HTMLAttributes, useRef, useState } from "react";
import {
  isFloatingAtom,
  isMobileAtom,
  isSidebarOpenAtom,
  sidebarShouldBeFullscreenAtom,
  toggleSidebarAtom,
} from "@/hooks/useFrame";
import { Logo } from "../header/Logo";
import { MUSICDEX_URL } from "@/lib/consts";
import { atom } from "jotai";
import { useOnClickOutside } from "usehooks-ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";

// New atom for pinned orgs
const pinnedOrgsAtom = atom<string[]>(["Hololive", "Nijisanji", "VSPo"]);

export function Sidebar() {
  const { t } = useTranslation();
  const [pinnedOrgs] = useAtom(pinnedOrgsAtom);
  const [tldexOpen, setTldexOpen] = useState(false);
  const { org } = useParams();
  const ref = useRef(null);

  const floating = useAtomValue(isFloatingAtom);
  const [open, setOpen] = useAtom(isSidebarOpenAtom);
  const toggle = useSetAtom(toggleSidebarAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);

  const handleClickOutside = () => {
    floating && open && setOpen(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <aside className="z-30 border-r border-r-base pb-12" id="sidebar" ref={ref}>
      <div className="flex min-h-[100dvh] flex-col bg-base-2">
        <div className="flex items-center gap-2 px-4 pb-2 pt-4">
          <Logo className="ml-1.5 h-8 w-8" />
          <h2 className="text-3xl font-semibold tracking-tight">Holodex</h2>
          <div className="flex grow" />
          <Button
            variant="ghost"
            className="i-heroicons:x-mark p-4 md:hidden"
            onClick={toggle}
          />
        </div>
        <div className="flex grow flex-col space-y-1 px-3 py-2">
          <div className="mb-2">
            <OrgSelectorCombobox />
          </div>
          {pinnedOrgs.map((pinnedOrg) => (
            <div key={pinnedOrg} className="space-y-1">
              {/* {org === pinnedOrg && <hr className="border-base" />} */}

              <SidebarItem
                onClose={toggle}
                label={pinnedOrg}
                href={`/org/${pinnedOrg}`}
                icon="i-ph:placeholder-fill"
              />
              {org === pinnedOrg && (
                <div className="w-full pl-6">
                  <SidebarItem
                    onClose={toggle}
                    label={"Members"}
                    href={`/org/${pinnedOrg}/channels`}
                    icon="i-heroicons:identification"
                  />
                </div>
              )}

              {org === pinnedOrg && <hr className="border-base" />}
            </div>
          ))}
          <div className="grow"></div>
          <hr className="my-2 border-base" />
          <SidebarItem
            label={t("component.mainNav.favorites")}
            icon="i-heroicons:heart"
            href="/favorites"
            onClose={toggle}
          />
          <SidebarItem
            label={t("component.mainNav.multiview")}
            icon="i-heroicons:rectangle-group"
            href="/multiview"
            onClose={toggle}
          />
          <SidebarItem
            label="Musicdex"
            icon="i-heroicons:musical-note"
            href={MUSICDEX_URL}
            onClose={toggle}
          />
          <SidebarItem
            label={t("component.mainNav.playlist")}
            icon="i-heroicons:queue-list"
            href="/playlists"
            onClose={toggle}
          />
        </div>
        {/* Icon-only buttons row */}
        <div className="flex justify-around pb-2 text-base-11">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="p-2"
                size="icon-lg"
                onClick={() => setTldexOpen(!tldexOpen)}
              >
                <svg
                  version="1.1"
                  id="Layer_1"
                  viewBox="0 0 24 24"
                  xmlSpace="preserve"
                  style={{ fill: "var(--base-11)", width: 24, height: 24 }}
                >
                  <path
                    d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M4,10h4v2H4V10z M14,16H4v-2h10V16z M20,16h-4v-2
    h4V16z M20,12H10v-2h10V12z"
                  />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">TLdex</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="p-2" size="icon-lg" asChild>
                <Link to="/settings">
                  <span className="i-heroicons:cog-6-tooth" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Settings</TooltipContent>
          </Tooltip>{" "}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="p-2" size="icon-lg" asChild>
                <Link to="/about">
                  <span className="i-heroicons:information-circle" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">About</TooltipContent>
          </Tooltip>
        </div>
        {/* TLDex submenu */}
        {tldexOpen && (
          <div className="space-y-1 px-3 pb-3">
            <SidebarItem
              className="text-base-11"
              label={t("component.mainNav.tlclient")}
              icon="i-heroicons:language"
              href="/tlclient"
              onClose={toggle}
            />
            <SidebarItem
              className="text-base-11"
              label={t("component.mainNav.scriptEditor")}
              icon="i-fluent:gantt-chart-16-regular"
              href="/scripteditor"
              onClose={toggle}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
function SidebarItem({
  className,
  onClose,
  icon,
  label,
  href,
}: {
  className?: HTMLAttributes<HTMLButtonElement>["className"];
  onClose: () => void;
  icon: HTMLAttributes<HTMLSpanElement>["className"];
  label: string;
  href: string;
}) {
  const location = useLocation();
  const isMobile = useAtomValue(isMobileAtom);

  const isHere =
    href === location.pathname ||
    ((href.startsWith("/settings") || href.startsWith("/about")) &&
      location.pathname.startsWith(href));

  return (
    <Button
      asChild
      className={cn(
        "w-full justify-start",
        className,
        { "text-base-12 font-semibold tracking-tight": isHere },
        { "text-base-11 font-light": !isHere },
      )}
      variant={isHere ? "primary" : "ghost"}
      onClick={isMobile ? onClose : undefined}
    >
      <Link to={href}>
        <span className={icon}></span>
        {label}
      </Link>
    </Button>
  );
}
