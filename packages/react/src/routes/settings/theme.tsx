import { SettingsItem } from "@/components/settings/SettingsItem";
import {
  THEME_BASE_COLORS,
  THEME_COLORS,
  baseAtom,
  darkAtom,
  primaryAtom,
  secondaryAtom,
} from "@/hooks/useTheme";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Label } from "@/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { Switch } from "@/shadcn/ui/switch";
import type { SelectProps } from "@radix-ui/react-select";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

export function SettingsTheme() {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);
  const [base, setBase] = useAtom(baseAtom);
  const [primary, setPrimary] = useAtom(primaryAtom);
  const [secondary, setSecondary] = useAtom(secondaryAtom);

  return (
    <div className="flex flex-col p-2 md:p-4">
      <SettingsItem label={t("views.settings.darkModeLabel")} fullWidth>
        <Switch checked={dark} onCheckedChange={setDark} />
      </SettingsItem>

      <SettingsItem label={"Theme Colors"} fullWidth>
        <div className="flex flex-wrap gap-4">
          <div className="flex w-full flex-col gap-2">
            <Label className="text-base-11">Base Color</Label>
            <ColorPicker
              options={THEME_BASE_COLORS}
              value={base}
              onValueChange={setBase}
            ></ColorPicker>
          </div>
          <div className="flex max-w-sm flex-col gap-2">
            <Label className="text-base-11">Primary Color</Label>
            <ColorPicker
              options={THEME_COLORS.concat(THEME_BASE_COLORS)}
              value={primary}
              onValueChange={setPrimary}
            ></ColorPicker>
          </div>
          <div className="flex max-w-sm flex-col gap-2">
            <Label className="text-base-11">Secondary Color</Label>
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
        <Button variant="ghost" className="h-10 w-[300px] justify-between pl-0">
          <div
            className="flex h-10 grow flex-col content-center justify-center rounded-md text-sm font-medium"
            style={{
              backgroundColor: `var(--${value}-9)`,
              color: `var(--${value}-12)`,
            }}
          >
            <p>{value}</p>
          </div>
          <div className="i-lucide:chevron-down h-4 w-4 opacity-60"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuLabel>Select a color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-2">
          {options.map((x) => {
            return (
              <DropdownMenuItem key={x} onSelect={() => onValueChange(x)}>
                <Badge
                  variant="default"
                  className="h-8 w-20"
                  style={{
                    backgroundColor: `var(--${x}-9)`,
                    color: `var(--${x}-12)`,
                  }}
                >
                  {x}
                </Badge>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
