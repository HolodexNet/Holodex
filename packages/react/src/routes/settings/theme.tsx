import { SettingsItem } from "@/components/settings/SettingsItem";
import {
  THEME_BASE_COLORS,
  THEME_COLORS,
  darkAtom,
  primaryAtom,
  secondaryAtom,
} from "@/hooks/useTheme";
import { Button } from "@/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";

import { Switch } from "@/shadcn/ui/switch";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

export function SettingsTheme() {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);
  const [primary, setPrimary] = useAtom(primaryAtom);
  const [secondary, setSecondary] = useAtom(secondaryAtom);

  return (
    <div className="flex flex-col">
      <SettingsItem label={t("views.settings.darkModeLabel")} fullWidth>
        <Switch checked={dark} onCheckedChange={setDark} />
      </SettingsItem>

      <SettingsItem label={"Theme Colors"} fullWidth>
        <div className="flex flex-wrap gap-4">
          <div className="flex max-w-20 flex-col gap-2">
            <ColorPicker
              options={THEME_COLORS.concat(THEME_BASE_COLORS)}
              value={primary}
              onValueChange={setPrimary}
            ></ColorPicker>
          </div>
          <div className="flex max-w-20 flex-col gap-2">
            <ColorPicker
              options={THEME_COLORS.concat(THEME_BASE_COLORS)}
              value={secondary}
              onValueChange={setSecondary}
            ></ColorPicker>
          </div>
        </div>
      </SettingsItem>
    </div>
  );
}

interface ColorPickerProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
}

function ColorPicker({ options, value, onValueChange }: ColorPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="max-w-sm">
        <Button
          variant="base-outline"
          className="h-10 w-10 p-0 focus-visible:ring-0"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium"
            style={{
              backgroundColor: `var(--${value}-9)`,
              color: `var(--${value}-12)`,
            }}
          >
            <div className="i-lucide:chevron-down h-4 w-4 opacity-60"></div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuLabel>Select a color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-2">
          {options.map((x) => {
            return (
              <DropdownMenuItem
                key={"color_" + x}
                className="hover:bg-base-4"
                onSelect={() => onValueChange(x)}
              >
                <div
                  className="mr-2 size-4 rounded-full"
                  style={{
                    backgroundColor: `var(--${x}-9)`,
                    color: `var(--${x}-12)`,
                  }}
                ></div>
                <span className="capitalize">{x}</span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
