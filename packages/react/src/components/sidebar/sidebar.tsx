import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { OrgSelectorCombobox } from "../org/OrgPicker";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import { HTMLAttributes, useRef, useState } from "react";
import {
  isSidebarFloatingAtom,
  isMobileAtom,
  isSidebarOpenAtom,
  sidebarShouldBeFullscreenAtom,
  toggleSidebarAtom,
} from "@/hooks/useFrame";
import { Logo } from "../header/Logo";
import { MUSICDEX_URL } from "@/lib/consts";
import { useOnClickOutside } from "usehooks-ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";
import { orgRankingAtom } from "@/store/org";
import { TLDexLogo } from "../common/TLDexLogo";
import { getThumbnailForOrg } from "@/lib/thumb";

export function Sidebar() {
  const { t } = useTranslation();
  const rankedOrgs = useAtomValue(orgRankingAtom);
  const [tldexOpen, setTldexOpen] = useState(false);
  const { org } = useParams();
  const ref = useRef(null);

  const floating = useAtomValue(isSidebarFloatingAtom);
  const [open, setOpen] = useAtom(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const toggle = useSetAtom(toggleSidebarAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);

  const handleClickOutside = () => {
    floating && open && setOpen(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <aside
      className=" z-40 border-r border-r-base pb-12"
      id="sidebar"
      ref={ref}
    >
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
        <div className="group/sidebar flex grow flex-col space-y-1 px-3 py-2">
          <div className="mb-2">
            <OrgSelectorCombobox />
          </div>
          {rankedOrgs.map((pinnedOrg) => (
            <div key={pinnedOrg.name} className="space-y-1">
              {/* {org === pinnedOrg && <hr className="border-base" />} */}

              <SidebarItem
                onClose={toggle}
                label={pinnedOrg.name}
                href={`/org/${pinnedOrg.name}`}
                icon={pinnedOrg.icon ? undefined : "i-ph:placeholder-fill"}
                image={getThumbnailForOrg(pinnedOrg.icon)}
              />
              {org === pinnedOrg.name && (
                <div className="w-full pl-6">
                  <SidebarItem
                    onClose={toggle}
                    label={"Members"}
                    href={`/org/${pinnedOrg.name}/channels`}
                    icon="i-heroicons:identification"
                  />
                </div>
              )}

              {org === pinnedOrg.name && <hr className="border-base" />}
            </div>
          ))}
          <Link
            to="/settings/orgs"
            className={cn(
              "w-full justify-start rounded-md px-4 py-2 text-center text-sm font-semibold tracking-tight text-base-9 transition-opacity duration-300 hover:bg-base-3",
              {
                "visible opacity-70": fs,
                "opacity-0 group-hover/sidebar:opacity-50 hover:!opacity-80":
                  !fs,
              },
            )}
            style={{
              //dotted border:
              border: "2px dashed var(--base-4)",
            }}
          >
            Change Starred Orgs
          </Link>
        </div>
        <div className="grow"></div>
        <hr className="mx-3 my-1 border-base" />
        <div className="flex flex-col space-y-1 px-3 pb-1">
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
                <TLDexLogo></TLDexLogo>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">TLdex</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="p-2"
                size="icon-lg"
                asChild
                onClick={isMobile ? toggle : undefined}
              >
                <Link to="/settings">
                  <span className="i-heroicons:cog-6-tooth" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Settings</TooltipContent>
          </Tooltip>{" "}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="p-2"
                size="icon-lg"
                asChild
                onClick={isMobile ? toggle : undefined}
              >
                <Link to="/about">
                  <span className="i-heroicons:question-mark-circle" />
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
  image,
}: {
  className?: HTMLAttributes<HTMLButtonElement>["className"];
  onClose: () => void;
  icon?: HTMLAttributes<HTMLSpanElement>["className"];
  label: string;
  href: string;
  image?: string; // either an icon or a image should be supplied.
}) {
  const location = useLocation();
  const isMobile = useAtomValue(isMobileAtom);

  const isHere =
    encodeURI(href) === location.pathname ||
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
        {icon && <span className={icon}></span>}
        {image && <img src={image} className="h-4 w-4" />}
        {label}
      </Link>
    </Button>
  );
}
