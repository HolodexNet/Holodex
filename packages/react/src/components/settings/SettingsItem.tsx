import { Children, ReactNode } from "react";

interface SettingsItemProps {
  label: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function SettingsItem({
  label,
  children,
  fullWidth,
}: SettingsItemProps) {
  return (
    <div className="flex flex-wrap justify-between gap-4 border-b-2 border-base-5 py-6 first:pt-0 last:border-b-0">
      <h3 className={"text-xl font-bold " + (fullWidth && " w-full")}>
        {label}
      </h3>
      {Children.only(children)}
    </div>
  );
}
