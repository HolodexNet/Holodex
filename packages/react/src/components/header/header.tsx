import { darkAtom } from "@/hooks/useTheme";
import { Button } from "@/shadcn/ui/button";
import { userAtom } from "@/store/auth";
import { useAtom, useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface HeaderProps {
  onClick: () => void;
  id: string;
}

export function Header({ onClick, id }: HeaderProps) {
  const { t } = useTranslation();
  const [dark, toggle] = useAtom(darkAtom);
  const user = useAtomValue(userAtom);

  return (
    <header
      id={id}
      className="bg-base-2 flex items-center px-8 py-auto gap-4 sticky top-0 z-40"
    >
      <Button size="icon-lg" variant="ghost" onClick={onClick}>
        <div className="i-heroicons:bars-3 rounded-md px-3 py-3 " />
      </Button>
      <div className="justify-start py-1 pl-3 text-xl">Hololive</div>
      <div className="i-heroicons:chevron-down py-5" />
      <div className="flex flex-grow" />
      <Button
        size="icon-lg"
        variant="ghost"
        className="p-2"
        onClick={() => toggle(!dark)}
      >
        <div className="i-heroicons:sun-20-solid h-full text-4xl" />
      </Button>
      {user ? (
        <img
          className="w-auto h-full p-2 rounded-full"
          src={`https://avatars.dicebear.com/api/jdenticon/${user.id}.svg`}
        />
      ) : (
        <Button asChild>
          <Link to="/login">{t("Login")}</Link>
        </Button>
      )}
    </header>
  );
}
