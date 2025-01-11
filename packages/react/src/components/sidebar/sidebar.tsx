import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { OrgSelectorCombobox } from "../org/OrgSelectorCombobox";
import { useTranslation } from "react-i18next";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  HTMLAttributes,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
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
import { orgRankingAtom } from "@/store/org";
import { TLDexLogo } from "../common/TLDexLogo";
import { getThumbnailForOrg } from "@/lib/thumb";

export function Sidebar() {
  const { t } = useTranslation();
  const rankedOrgs = useAtomValue(orgRankingAtom);
  const [tldexOpen, setTldexOpen] = useState(false);
  const ref = useRef(null);

  const floating = useAtomValue(isSidebarFloatingAtom);
  const [open, setOpen] = useAtom(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const toggle = useSetAtom(toggleSidebarAtom);
  const fs = useAtomValue(sidebarShouldBeFullscreenAtom);
  const navigate = useNavigate();
  const org = useParams().org;
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
  }, [floating, open]);

  useOnClickOutside(ref, handleClickOutside);

  return (
    <aside
      className=" z-40 border-r border-r-base pb-12"
      id="sidebar"
      ref={ref}
    >
      <div className="flex min-h-[100dvh] flex-col bg-base-2">
        <div
          className="flex cursor-pointer items-center gap-2 px-4 pb-2 pt-4"
          onClick={() => navigate("/")}
        >
          <Logo className="ml-1.5 h-8 w-8" />
          <h2 className="text-3xl font-semibold tracking-tight">Holodex</h2>
          <div className="flex grow" />
          <Button
            variant="ghost"
            className="i-lucide:x p-4 md:hidden"
            onClick={toggle}
          />
        </div>
        <div className="group/sidebar flex grow flex-col space-y-1 px-3 py-2">
          <div className="mb-2">
            <OrgSelectorCombobox setOrg={setOrg} />
          </div>
          <div className="space-y-2">
            <SidebarItem
              key={"fav-sb"}
              onClose={toggle}
              label={"Favorites"}
              href={`/favorites`}
              icon={"i-ph:heart-fill"}
            />
            {rankedOrgs.map((pinnedOrg) => (
              <SidebarItem
                key={pinnedOrg.name}
                onClose={toggle}
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
              `w-full justify-start rounded-md px-4 py-2 
              text-center text-sm font-semibold tracking-tight text-base-9 
              transition-opacity duration-300 hover:bg-base-3`,
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
        <div className="flex flex-col space-y-1 px-3 pb-4">
          {/* <SidebarItem
            label={t("component.mainNav.favorites")}
            icon="i-heroicons:heart"
            href="/favorites"
            onClose={toggle}
          /> */}
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
          <Button
            className={cn("w-full justify-start", "font-light text-base-11")}
            variant={"ghost"}
            onClick={() => setTldexOpen((o) => !o)}
          >
            <TLDexLogo size={16}></TLDexLogo>
            TLDex
          </Button>
          {tldexOpen && (
            <div className="space-y-1 pl-2 animate-in zoom-in-75">
              <SidebarItem
                className=""
                label={t("component.mainNav.tlclient")}
                icon="i-heroicons:language"
                href="/tlclient"
                onClose={toggle}
              />
              <SidebarItem
                className=""
                label={t("component.mainNav.scriptEditor")}
                icon="i-fluent:gantt-chart-16-regular"
                href="/scripteditor"
                onClose={toggle}
              />
            </div>
          )}
          <SidebarItem
            label="Settings"
            icon="i-heroicons:cog-6-tooth"
            href="/settings"
            onClose={toggle}
          />
          <SidebarItem
            label="About"
            icon="i-heroicons:question-mark-circle"
            href="/about"
            onClose={toggle}
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
        "text-base-12 font-semibold tracking-tight": isHere,
        "text-base-11 font-light": !isHere,
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
