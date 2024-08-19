import { useAuth } from "@/hooks/useAuth";
import { userAtom } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { GearIcon, CalendarIcon, ExitIcon } from "@radix-ui/react-icons";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UserMenuItem } from "./UserMenuItem";
import { Button } from "@/shadcn/ui/button";
import { DropdownMenuLabel } from "@/shadcn/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";

export function UserMenu() {
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);
  const { logout } = useAuth();

  const mockUserMenuItems = [
    {
      key: "settings",
      value: "Settings",
      fn: () => console.log("settings"),
      icon: <GearIcon />,
    },
    {
      key: "iCalFeed",
      value: "ICal Feed",
      fn: () => console.log("iCalFeed"),
      icon: <CalendarIcon />,
    },
    { key: "logout", value: "Logout", fn: logout, icon: <ExitIcon /> },
  ];

  if (!user) {
    return (
      <Button asChild>
        <Link to="/login">{t("component.mainNav.login")}</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="z-30 mx-2 w-8 shrink-0 overflow-hidden rounded-full bg-base-2">
        <img
          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user.id}`}
          alt="User avatar"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative right-8 z-30 w-72 bg-base-2">
        <div className="grid grid-cols-4 grid-rows-3 p-4">
          <Avatar className="col-start-1 row-span-3 row-start-1 self-center justify-self-center">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user.id}`}
              alt="userIcon"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="col-span-3 col-start-2 row-span-2 row-start-1">
            <DropdownMenuLabel className="overflow-hidden text-ellipsis">
              {user.username}
            </DropdownMenuLabel>
            <div className="flex flex-row gap-2 px-2 py-1.5 ">
              <div
                className={user.google_id ? "text-secondary-11" : "text-base"}
              >
                <div className="i-mdi:google p-1 text-xs" />
              </div>
              <div
                className={user.discord_id ? "text-secondary-11" : "text-base"}
              >
                <div className="i-mdi:discord p-1 text-xs" />
              </div>
              <div
                className={user.twitter_id ? "text-secondary-11" : "text-base"}
              >
                <div className="i-mdi:twitter p-1 text-xs" />
              </div>
            </div>
          </div>
          <DropdownMenuLabel className="col-span-3 col-start-2 row-start-3 capitalize text-base-11">
            {user.role} : {user.contribution_count}
            {t("component.mainNav.points")}
          </DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator className="border-base" />
        {mockUserMenuItems.map((item) => {
          return (
            <UserMenuItem
              key={item.key + item.value}
              item={{ key: item.key, value: item.value, icon: item.icon }}
              onClick={item.fn}
            />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
