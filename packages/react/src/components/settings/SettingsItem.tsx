import { ReactNode } from "react";

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
    <div className="my-2 flex flex-wrap justify-between gap-4 first:mt-0 last:mb-4 last:border-b-0">
      <h3
        className={
          "mb-2 mt-3 text-2xl tracking-tight md:text-3xl " +
          (fullWidth && " w-full")
        }
      >
        {label}
      </h3>
      <div className={fullWidth ? "px-4" : ""}>{children}</div>
    </div>
  );
}
