import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { useAtomValue } from "jotai";
import { OrgSelectorCombobox } from "../org/OrgPicker";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { orgAtom } from "@/store/org";
import { HTMLAttributes } from "react";
import { isMobileAtom } from "@/hooks/useFrame";
// import { ScrollArea } from "@/shadcn/ui/scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void;
}

export function Sidebar({ className, id, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const org = useAtomValue(orgAtom);

  return (
    <div className={cn("pb-12 border-r-base-5 border-r", className)} id={id}>
      <div className="min-h-[100dvh] space-y-2 bg-base-2 py-2">
        <div className="flex items-center gap-2 px-4 pb-2 pt-4">
          <img src="/icons/uetchy_logo.png" className="ml-1.5 h-6 w-6" />
          <h2 className="text-2xl font-semibold tracking-tight">Holodex</h2>
          <div className="flex grow" />
          <Button
            variant="ghost"
            className="i-heroicons:x-mark p-4 md:hidden"
            onClick={onClose}
          />
        </div>
        <div className="px-3 py-2">
          <div className="mb-2">
            <OrgSelectorCombobox />
          </div>
          {/* <h2 className="mb-2 px-4 font-semibold tracking-tight">Hololive</h2> */}
          <div className="space-y-1">
            <SidebarItem
              onClose={onClose}
              label={t("component.mainNav.home")}
              href={`/org/${org}`}
              icon="i-heroicons:home"
            />
            <SidebarItem
              onClose={onClose}
              label={t("component.mainNav.channels")}
              href={`/org/${org}/channels`}
              icon="i-heroicons:user-group"
            />
          </div>
        </div>
        {/* <hr className="border-base" /> */}
        <div className="px-3 py-2">
          {/* <h2 className="mb-2 px-4 font-semibold tracking-tight">Holodex</h2> */}
          <div className="space-y-2">
            <SidebarItem
              label={t("component.mainNav.favorites")}
              icon="i-heroicons:heart"
              href="/favorites"
              onClose={onClose}
            />
            <SidebarItem
              label={t("component.mainNav.multiview")}
              icon="i-heroicons:rectangle-group"
              href="/multiview"
              onClose={onClose}
            />
            <SidebarItem
              label="Musicdex"
              icon="i-heroicons:musical-note"
              href="https://music.holodex.net"
              onClose={onClose}
            />
            <hr className="border-base" />
            <SidebarItem
              className="text-base-11"
              label={t("component.mainNav.playlist")}
              icon="i-heroicons:queue-list"
              href="/playlists"
              onClose={onClose}
            />
            <SidebarItem
              className="text-base-11"
              label={t("component.mainNav.settings")}
              icon="i-heroicons:cog-6-tooth"
              href="/settings"
              onClose={onClose}
            />
            <SidebarItem
              className="text-base-11"
              label={t("component.mainNav.about")}
              icon="i-heroicons:information-circle"
              href="/about"
              onClose={onClose}
            />
          </div>
        </div>
        <div className="py-2">
          {/* <h2 className="relative px-7 text-lg font-semibold tracking-tight">
            Favorites
          </h2> */}
          {/* <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {playlists?.map((playlist, i) => (
                <Button
                  key={`${playlist}-${i}`}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M21 15V6" />
                    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                  </svg>
                  {playlist}
                </Button>
              ))}
            </div>
          </ScrollArea> */}
        </div>
        {/* <div className="relative bottom-0">
          <Button
            size="icon"
            className="w-20 h-20"
            onClick={() => toggle(!dark)}
          >
            <div className="i-heroicons:sun-20-solid w-20 h-20 text-4xl" />
          </Button>
        </div> */}
      </div>
    </div>
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

  const isHere = href === location.pathname;

  return (
    <Button
      asChild
      className={cn(
        "w-full justify-start",
        className,
        { "text-base-12 font-semibold": isHere },
        { "font-base-11 font-light": !isHere },
      )}
      variant={isHere ? "default" : "ghost"}
      onClick={isMobile ? onClose : undefined}
    >
      <Link to={href}>
        <span className={icon}></span>
        {label}
      </Link>
    </Button>
  );
}
