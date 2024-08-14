import React from "react";
import { DropdownMenuItem } from "@/shadcn/ui/dropdown-menu";
// import { useTranslation } from "react-i18next";
import { MenuItem } from "../types";

// interface UserMenuItemProps
//   extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
//   item: QueryItem;
//   onSelect: (_: string) => void;
// }

interface UserMenuItemProps {
  item: MenuItem;
  onClick: () => void;
}

export function UserMenuItem({ item, onClick }: UserMenuItemProps) {
  return (
    <DropdownMenuItem
      onClick={() => onClick()}
      className="flex h-full w-64 flex-row gap-2"
    >
      <div className="p-4">{item.icon}</div>
      <div>{item.value}</div>
    </DropdownMenuItem>
  );
}
