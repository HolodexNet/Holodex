import { SettingsItem } from "@/components/settings/SettingsItem";
import {
  THEME_BASE_COLORS,
  THEME_COLORS,
  darkAtom,
  primaryAtom,
  secondaryAtom,
} from "@/hooks/useTheme";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";
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
import { useVideoCardSizes } from "@/store/video";
import { hideThumbnailAtom, englishNameAtom } from "@/store/settings";

export function SettingsTheme() {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);
  const [primary, setPrimary] = useAtom(primaryAtom);
  const [secondary, setSecondary] = useAtom(secondaryAtom);
  const { size, setSize } = useVideoCardSizes(["lg", "md", "sm"]);
  const [hideThumbnail, setHideThumbnail] = useAtom(hideThumbnailAtom);
  const [useENName, setUseENName] = useAtom(englishNameAtom);

  const gridSizes = [
    {
      value: "lg",
      label: t("views.settings.gridSize.0"),
      icon: "i-lucide:layout-grid",
    },
    {
      value: "md",
      label: t("views.settings.gridSize.1"),
      icon: "i-lucide:grid-3x3",
    },
    {
      value: "sm",
      label: t("views.settings.gridSize.2"),
      icon: "i-lucide:list",
    },
  ] as const;

  return (
    <div className="flex flex-col">
      <SettingsItem label={t("views.settings.darkModeLabel")} fullWidth>
        <div className="flex items-center gap-3">
          <div className={dark ? "i-lucide:moon" : "i-lucide:sun"} />
          <Label>{dark ? "Dark Mode" : "Light Mode"}</Label>
          <div className="flex grow" />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDark(!dark)}
            className={cn("size-10", dark && "bg-base-4")}
          >
            <div className={dark ? "i-lucide:moon" : "i-lucide:sun"} />
          </Button>
        </div>
      </SettingsItem>

      <SettingsItem label="Theme Colors" fullWidth>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Label>Primary Color</Label>
            <ColorPicker
              options={THEME_COLORS.concat(THEME_BASE_COLORS)}
              value={primary}
              onValueChange={setPrimary}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label>Secondary Color</Label>
            <ColorPicker
              options={THEME_COLORS.concat(THEME_BASE_COLORS)}
              value={secondary}
              onValueChange={setSecondary}
            />
          </div>
        </div>
      </SettingsItem>

      <SettingsItem label={t("views.settings.gridSizeLabel")} fullWidth>
        <div className="flex flex-col gap-2">
          {gridSizes.map(({ label, value, icon }) => (
            <div key={value} className="flex items-center gap-3">
              <Checkbox
                checked={size === value}
                onCheckedChange={() => setSize(value)}
                id={`gridSize-${value}`}
              />
              <Label
                htmlFor={`gridSize-${value}`}
                className={cn("flex cursor-pointer items-center gap-1", {
                  "opacity-70": size !== value,
                })}
              >
                <div className={icon}></div>
                <span>{label}</span>
              </Label>
            </div>
          ))}
        </div>
      </SettingsItem>

      <SettingsItem label={t("views.settings.displayPreferences")} fullWidth>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="hide_thumbnails"
              checked={hideThumbnail}
              onCheckedChange={() => setHideThumbnail(!hideThumbnail)}
            />
            <Label
              htmlFor="hide_thumbnails"
              className={cn({ "opacity-70": !hideThumbnail })}
            >
              {t("views.settings.hideVideoThumbnailsLabel")}
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="use_english_names"
              checked={useENName}
              onCheckedChange={(c) => setUseENName(!!c)}
            />
            <Label
              htmlFor="use_english_names"
              className={cn({ "opacity-70": !useENName })}
            >
              {t("views.settings.useEnglishNameMsg")}
            </Label>
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
      <DropdownMenuContent>
        <DropdownMenuLabel>Select a color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-2">
          {options.map((x) => (
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
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
