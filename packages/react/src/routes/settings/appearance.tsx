import React from "react";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { Button } from "@/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  THEME_BASE_COLORS,
  THEME_COLORS,
  darkAtom,
  primaryAtom,
  secondaryAtom,
} from "@/hooks/useTheme";

const ThemeSettings = () => {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);
  const [primary, setPrimary] = useAtom(primaryAtom);
  const [secondary, setSecondary] = useAtom(secondaryAtom);

  return (
    <div className="space-y-6">
      {/* Theme Mode Toggle */}
      <SettingsItem label={t("views.settings.darkModeLabel")} fullWidth>
        <div className="flex w-full max-w-md items-center justify-between rounded-lg border border-base-6 bg-base-3 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                dark ? "bg-base-5" : "bg-primary-4",
              )}
            >
              <div
                className={cn(
                  "h-5 w-5",
                  dark
                    ? "i-lucide:moon text-primary-11"
                    : "i-lucide:sun text-primary-11",
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                {dark ? "Dark Mode" : "Light Mode"}
              </span>
              <span className="text-sm text-base-11">
                {dark ? "Easier on the eyes" : "Better contrast"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setDark(!dark)}
            className={cn(
              "h-10 w-16 transition-colors",
              dark ? "bg-base-4" : "bg-primary-4",
            )}
          >
            <div
              className={cn("h-5 w-5", dark ? "i-lucide:moon" : "i-lucide:sun")}
            />
          </Button>
        </div>
      </SettingsItem>

      {/* Color Pickers */}
      <SettingsItem label="Theme Colors" fullWidth>
        <div className="grid gap-4 rounded-lg border border-base-6 bg-base-3 p-4">
          <ColorPickerRow
            label="Primary Color"
            value={primary}
            onChange={setPrimary}
            options={THEME_COLORS.concat(THEME_BASE_COLORS)}
          />
          <div className="h-px bg-base-6" />
          <ColorPickerRow
            label="Secondary Color"
            value={secondary}
            onChange={setSecondary}
            options={THEME_COLORS.concat(THEME_BASE_COLORS)}
          />
        </div>
      </SettingsItem>
    </div>
  );
};

const ColorPickerRow = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-full"
        style={{ backgroundColor: `var(--${value}-9)` }}
      />
      <div className="flex flex-col">
        <span className="font-medium">{label}</span>
        <span className="text-sm capitalize text-base-11">{value}</span>
      </div>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-24 justify-between bg-base-4"
        >
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: `var(--${value}-9)` }}
          />
          <div className="i-lucide:chevron-down h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Select a color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-1 p-1">
          {options.map((color) => (
            <DropdownMenuItem
              key={color}
              className="flex h-10 w-10 items-center justify-center p-0 hover:bg-base-4"
              onSelect={() => onChange(color)}
            >
              <div
                className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: `var(--${color}-9)` }}
              />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default ThemeSettings;
