import React from "react";
import { DropdownMenuItem } from "@/shadcn/ui/dropdown-menu";
// import { useTranslation } from "react-i18next";
import { MenuItem } from "../types";

interface UserMenuItemProps {
  item: MenuItem;
  onClick: () => void;
}

export function UserMenuItem({ item, onClick }: UserMenuItemProps) {
  return (
    <DropdownMenuItem
      onClick={() => onClick()}
      className="grid h-full w-full cursor-pointer grid-cols-4 p-4"
    >
      <div className="col-start-1 self-center justify-self-center">
        {item.icon}
      </div>
      <div className="col-span-3 col-start-2 px-2">{item.value}</div>
    </DropdownMenuItem>
  );
}
