import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { OrgSelectorCombobox } from "../org/OrgSelectorCombobox";
import { useTranslation } from "react-i18next";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  HTMLAttributes,
  type ReactNode,
  RefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  isSidebarFloatingAtom,
  isMobileAtom,
  isSidebarOpenAtom,
  sidebarShouldBeFullscreenAtom,
  closeSidebarAtom,
} from "@/hooks/useFrame";
import { Logo } from "../header/Logo";
import { MUSICDEX_URL } from "@/lib/consts";
import { useOnClickOutside } from "usehooks-ts";
import { orgRankingAtom } from "@/store/org";
import { TLDexLogo } from "../common/TLDexLogo";
import { getThumbnailForOrg } from "@/lib/thumb";

export function Sidebar() {
  const { t } = useTranslation();
  const rankedOrgs = useAtomValue(orgRankingAtom);
  const [tldexOpen, setTldexOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const floating = useAtomValue(isSidebarFloatingAtom);
  const [open, setOpen] = useAtom(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const setClose = useSetAtom(closeSidebarAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const setOrg = useCallback(
    (org?: Org) => {
      navigate({
        pathname: `/org/${org?.name}`,
        search: ["members", "live", "clips", "archive"].includes(
          params.get("tab") || "",
        )
          ? `?tab=${params.get("tab")}`
          : "",
      });
    },
    [navigate, params],
  );

  const handleClickOutside = useCallback(() => {
    floating && open && setOpen(false);
  }, [floating, open, setOpen]);

  useOnClickOutside(ref as RefObject<HTMLElement>, handleClickOutside);

  return (
    <aside
      className="z-40 border-r border-r-base pb-12 bg-sidebar"
      id="sidebar"
      ref={ref}
    >
      <div className="flex flex-col min-h-dvh">
        <div className="flex items-center gap-2 px-4 pb-2 justify-end pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 overflow-hidden"
            onClick={isMobile ? setClose : undefined}
          >
            <Logo className="h-8 w-8 ml-1.5" />
            <h2 className="tracking-tight font-semibold text-3xl">Holodex</h2>
          </Link>
          <div className="grow" />
          <Button
            variant="ghost"
            className="i-lucide:x p-4 md:hidden"
            onClick={setClose}
          />
        </div>
        <div className="flex grow flex-col py-2 px-3 group/sidebar space-y-1">
          <div className="mb-2">
            <OrgSelectorCombobox setOrg={setOrg} />
          </div>
          <div className="space-y-2">
            <SidebarItem
              key={"fav-sb"}
              onClose={setClose}
              label={"Favorites"}
              href={`/favorites`}
              icon={"i-ph:heart-fill"}
            />
            {rankedOrgs.map((pinnedOrg) => (
              <SidebarItem
                key={pinnedOrg.name}
                onClose={setClose}
                label={pinnedOrg.name}
                href={`/org/${pinnedOrg.name}`}
                icon={pinnedOrg.icon ? undefined : "i-ph:placeholder-fill"}
                image={getThumbnailForOrg(pinnedOrg.icon)}
              />
            ))}
          </div>

          <Link
            to="/settings/content"
            className={cn(
              // Base styles
              `w-full justify-start rounded-md px-4 py-1.5 h-9 mt-1`,

              // Text and font styles
              `text-center text-sm font-semibold tracking-tight`,

              // Transition and hover effect
              `transition-opacity duration-300 hover:`,
              {
                // Visible state when fs is true
                "visible opacity-70": fs,
                // Hidden state with hover effect when fs is false
                "opacity-0 group-hover/sidebar:opacity-40 hover:opacity-60!":
                  !fs,
              },
            )}
            style={{
              //dotted border:
              border:
                "2px dashed color-mix(in oklch, var(--foreground) 50%, transparent)",
            }}
          >
            Change Starred Orgs
          </Link>
        </div>
        <div className="grow"></div>
        <hr className="border-base mx-3 my-1" />
        <div className="flex flex-col space-y-1 px-3 pb-4">
          {/* <SidebarItem
            label={t("component.mainNav.favorites")}
            icon="i-heroicons:heart"
            href="/favorites"
            onClose={setClose}
          /> */}
          <SidebarItem
            label={t("component.mainNav.multiview")}
            icon="i-heroicons:rectangle-group"
            href="/multiview"
            onClose={setClose}
          />
          <SidebarItem
            label="Musicdex"
            icon="i-heroicons:musical-note"
            href={MUSICDEX_URL}
            onClose={setClose}
          />
          <SidebarItem
            label={t("component.mainNav.playlist")}
            icon="i-heroicons:queue-list"
            href="/playlists"
            onClose={setClose}
          />
          <Button
            className={cn("w-full justify-start", "font-light cursor-pointer")}
            variant={"ghost"}
            onClick={() => setTldexOpen((o) => !o)}
          >
            <TLDexLogo size={16}></TLDexLogo>
            TLDex
          </Button>
          {tldexOpen && (
            <div className="space-y-1 animate-in pl-2 zoom-in-75">
              <SidebarItem
                className=""
                label={t("component.mainNav.tlclient")}
                icon="i-heroicons:language"
                href="/tlclient"
                onClose={setClose}
              />
              <SidebarItem
                className=""
                label={t("component.mainNav.scriptEditor")}
                icon="i-fluent:gantt-chart-16-regular"
                href="/scripteditor"
                onClose={setClose}
              />
            </div>
          )}
          <SidebarItem
            label="Settings"
            icon="i-heroicons:cog-6-tooth"
            href="/settings"
            onClose={setClose}
          />
          <SidebarItem
            label="About"
            icon="i-heroicons:question-mark-circle"
            href="/about"
            onClose={setClose}
          />
        </div>
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
  icon?: HTMLAttributes<HTMLSpanElement>["className"] | ReactNode;
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
      className={cn("w-full justify-start", className, {
        " font-semibold tracking-tight": isHere,
        " font-light": !isHere,
      })}
      variant={isHere ? "primary" : "ghost"}
      onClick={isMobile ? onClose : undefined}
    >
      <Link to={href}>
        {icon && typeof icon === "string" && <span className={icon}></span>}
        {icon && typeof icon === "object" && icon}
        {image && <img src={image} className="h-4 w-4 rounded-sm" />}
        {label}
      </Link>
    </Button>
  );
}
