import {
  isMobileAtom,
  isSidebarOpenAtom,
  toggleSidebarAtom,
} from "@/hooks/useFrame";
import { Button } from "@/shadcn/ui/button";
import { useAtomValue } from "jotai";
import { useSetAtom } from "jotai/react";
import { Link, useLocation } from "react-router-dom";

import { SearchBar } from "./searchbar/components/SearchBar";
import clsx from "clsx";
import { Logo } from "./Logo";
import { useState } from "react";
import { UserMenu } from "./userMenu/components/UserMenu";
interface HeaderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  id: string;
}

export function Header({ id }: HeaderProps) {
  const frameToggleSidebar = useSetAtom(toggleSidebarAtom);
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const [isSearching, setIsSearching] = useState(false);
  const path = useLocation().pathname;

  return (
    <header id={id} className="flex items-center gap-1 px-2">
      <Button
        size="icon"
        variant="ghost"
        className="p-4 h-12 w-12"
        onClick={frameToggleSidebar}
      >
        <div className="rounded-md p-3 i-heroicons:bars-3" />
      </Button>

      {!isSearching && (
        <Button
          size="icon"
          variant="link"
          className={clsx(
            "h-12 w-12 p-0 opacity-100 transition-all starting:opacity-0 starting:-translate-y-6  duration-1000 hover:bg-secondaryA-2",
            isSidebarOpen && "hidden",
          )}
          asChild
        >
          <Link to="/">
            <Logo className="h-8 w-8" />
          </Link>
        </Button>
      )}

      <div className="hidden grow md:flex" />

      {path !== "/search" && (
        <>
          {/* Mobile-specific search bar */}
          {isMobile &&
            (isSearching ? (
              <div className="flex w-full items-start mt-3 self-start">
                <SearchBar className="grow shrink" autoFocus />
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-2 text-lg text-base-10"
                  onClick={() => setIsSearching(false)}
                >
                  <div className="h-8 w-8 i-lucide:x" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="ml-auto h-12 w-12 text-xl text-base-10"
                onClick={() => setIsSearching(true)}
              >
                <div className="h-8 w-8 i-heroicons:magnifying-glass" />
              </Button>
            ))}

          {/* Desktop-specific search bar */}
          {!isMobile && (
            <SearchBar className="mt-3 self-start max-w-lg md:mr-1 lg:mr-2" />
          )}
        </>
      )}

      {!isSearching && <UserMenu />}
    </header>
  );
}
