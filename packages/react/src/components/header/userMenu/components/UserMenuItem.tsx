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
    <DropdownMenuItem onClick={() => onClick()} className="cursor-pointer">
      <div className="mr-2">{item.icon}</div>
      {item.value}
    </DropdownMenuItem>
  );
}
