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

export default function SettingsTheme() {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);
  const [base, setBase] = useAtom(baseAtom);
  const [primary, setPrimary] = useAtom(primaryAtom);
  const [secondary, setSecondary] = useAtom(secondaryAtom);

  return (
    <div className="flex flex-col p-2 md:p-4">
      <SettingsItem label={t("views.settings.darkModeLabel")}>
        <Switch checked={dark} onCheckedChange={setDark} />
      </SettingsItem>

      <SettingsItem label={"Theme Colors"}>
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap gap-4">
            <div className="flex max-w-sm flex-col gap-2">
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
        </div>
      </SettingsItem>
    </div>
  );
}

interface ColorPickerProps {
  options: string[];
}

function ColorPicker({ options, ...rest }: ColorPickerProps & SelectProps) {
  return (
    <Select {...rest}>
      <SelectTrigger className="max-w-sm">
        <SelectValue placeholder="Select a Color" />
      </SelectTrigger>
      <SelectContent className="max-h-48">
        <SelectGroup>
          <SelectLabel>Colors</SelectLabel>
          {options.map((x) => {
            return (
              <SelectItem key={x} value={x}>
                <Badge
                  variant="default"
                  className="w-32"
                  style={{
                    backgroundColor: `var(--${x}-9)`,
                    color: `var(--${x}-12)`,
                  }}
                >
                  {x}
                </Badge>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
