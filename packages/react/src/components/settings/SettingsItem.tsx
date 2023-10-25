import { Children, ReactNode } from "react";

interface SettingsItemProps {
  label: string;
  children: ReactNode;
}

export function SettingsItem({ label, children }: SettingsItemProps) {
  return (
    <div className="border-base flex flex-wrap justify-between gap-4 border-b-2 py-6 last:border-b-0">
      <h3 className="text-xl font-bold">{label}</h3>
      {Children.only(children)}
    </div>
  );
}
