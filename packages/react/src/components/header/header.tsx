import {
  isMobileAtom,
  isSidebarOpenAtom,
  toggleSidebarAtom,
} from "@/hooks/useFrame";
import { darkAtom } from "@/hooks/useTheme";
import { Button } from "@/shadcn/ui/button";
import { useAtom, useAtomValue } from "jotai";
import { useSetAtom } from "jotai/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SearchBar } from "./searchbar/components/SearchBar";
import clsx from "clsx";
import { Logo } from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { userAtom } from "@/store/auth";
import { useState } from "react";
interface HeaderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  id: string;
}

export function Header({ id }: HeaderProps) {
  const { t } = useTranslation();
  const [dark, toggle] = useAtom(darkAtom);
  const frameToggleSidebar = useSetAtom(toggleSidebarAtom);
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const [isSearching, setIsSearching] = useState(false);

  return (
    <header id={id} className="z-20 flex items-center gap-1 px-2">
      <Button
        size="icon"
        variant="ghost"
        className="h-12 w-12 p-4"
        onClick={frameToggleSidebar}
      >
        <div className="i-heroicons:bars-3 rounded-md p-3" />
      </Button>

      {!isSearching && (
        <Button
          size="icon"
          variant="link"
          className={clsx(
            "h-12 w-12 p-0 opacity-100 transition-all hover:bg-secondaryA-2",
            {
              "-translate-y-8 duration-200 opacity-0": isSidebarOpen,
            },
          )}
          asChild
        >
          <Link to="/">
            <Logo className="h-8 w-8" />
          </Link>
        </Button>
      )}

      <div className="hidden grow md:flex" />

      {isMobile || isSearching ? (
        isSearching ? (
          <div className="mt-3 flex w-full items-start self-start">
            <SearchBar className="shrink grow" autoFocus />
            <Button
              size="icon"
              variant="ghost"
              className="ml-2 text-lg text-base-10"
              onClick={() => setIsSearching(false)}
            >
              <div className="i-heroicons:x-mark h-8 w-8" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto h-12 w-12 text-xl text-base-10"
            onClick={() => setIsSearching(true)}
          >
            <div className="i-heroicons:magnifying-glass h-8 w-8" />
          </Button>
        )
      ) : (
        <SearchBar className="mt-3 max-w-lg self-start md:mr-1 lg:mr-2" />
      )}

      {!isSearching && <UserMenu />}
    </header>
  );
}
export function UserMenu() {
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);
  const { logout } = useAuth();

  if (!user) {
    return (
      <Button asChild>
        <Link to="/login">{t("component.mainNav.login")}</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mx-2 w-8 shrink-0 overflow-hidden rounded-full">
        <img
          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user.id}`}
          alt="User avatar"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
