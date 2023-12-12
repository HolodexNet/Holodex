import { isFloatingAtom, toggleSidebarAtom } from "@/hooks/useFrame";
import { darkAtom } from "@/hooks/useTheme";
import { Button } from "@/shadcn/ui/button";
import { userAtom } from "@/store/auth";
import { useAtom, useAtomValue } from "jotai";
import { useSetAtom } from "jotai/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shadcn/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { SearchBar } from "./searchbar/components/SearchBar";

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
  const user = useAtomValue(userAtom);
  const frameToggleSidebar = useSetAtom(toggleSidebarAtom);
  const floating = useAtomValue(isFloatingAtom);

  const { logout } = useAuth();

  return (
    <header id={id} className="z-40 flex items-center gap-4 bg-base-2 px-2">
      {floating && (
        <Button
          size="icon"
          variant="ghost"
          className="h-12 w-12 p-4"
          onClick={frameToggleSidebar}
        >
          <div className="i-heroicons:bars-3 rounded-md p-3" />
        </Button>
      )}
      <div className="hidden grow md:flex" />
      <SearchBar className="max-w-lg" />
      <Button
        size="icon"
        variant="ghost"
        className="p-0 text-base-9"
        onClick={() => toggle(!dark)}
      >
        <div className="i-heroicons:magnifying-glass h-full text-xl" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="hidden p-0 text-base-9 md:flex"
        onClick={() => toggle(!dark)}
      >
        <div className="i-heroicons:sun-20-solid h-full text-xl " />
      </Button>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="w-11 shrink-0 overflow-hidden rounded-full">
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user.id}`}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild>
          <Link to="/login">{t("component.mainNav.login")}</Link>
        </Button>
      )}
    </header>
  );
}
