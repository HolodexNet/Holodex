import { toggleSidebarAtom } from "@/hooks/useFrame";
import { darkAtom } from "@/hooks/useTheme";
import { Button } from "@/shadcn/ui/button";
import { userAtom } from "@/store/auth";
import { useAtom, useAtomValue } from "jotai";
import { useSetAtom } from "jotai/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SearchBar } from "./searchbar/SearchBar";

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

  return (
    <header id={id} className="z-40 flex items-center gap-4 bg-base-2 pl-2">
      <Button
        size="icon"
        variant="ghost"
        className="h-12 w-12 p-4"
        onClick={frameToggleSidebar}
      >
        <div className="i-heroicons:bars-3 rounded-md p-3" />
      </Button>
      <div className="hidden grow md:flex" />
      <SearchBar className="max-w-lg" />
      <Button
        size="icon"
        variant="ghost"
        className="-ml-3 p-0 text-base-9"
        onClick={() => toggle(!dark)}
      >
        <div className="i-heroicons:magnifying-glass h-full text-xl" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="p-0 text-base-9"
        onClick={() => toggle(!dark)}
      >
        <div className="i-heroicons:sun-20-solid h-full text-xl " />
      </Button>
      {user ? (
        <img
          className="h-14 w-14 shrink-0 rounded-full p-2"
          src={`https://avatars.dicebear.com/api/jdenticon/${user.id}.svg`}
        />
      ) : (
        <Button asChild>
          <Link to="/login">{t("component.mainNav.login")}</Link>
        </Button>
      )}
    </header>
  );
}
