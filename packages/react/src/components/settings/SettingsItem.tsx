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
    <div className="my-4 flex flex-wrap justify-between gap-4 first:pt-0 last:border-b-0">
      <h3 className={"text-xl font-bold " + (fullWidth && " w-full")}>
        {label}
      </h3>
      <div className={fullWidth ? "px-4" : ""}>{children}</div>
    </div>
  );
}
