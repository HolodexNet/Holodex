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
          "mt-3 mb-2 ml-4 text-2xl tracking-tight md:ml-0 md:text-3xl" +
          (fullWidth && " w-full")
        }
      >
        {label}
      </h3>
      <div className="grid w-full gap-2 rounded-lg border p-2 md:p-4">
        {children}
      </div>
    </div>
  );
}
