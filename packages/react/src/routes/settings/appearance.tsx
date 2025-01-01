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
import { useVideoCardSizes } from "@/store/video";
import { hideThumbnailAtom, englishNameAtom } from "@/store/settings";
import { Separator } from "@/shadcn/ui/separator";
import ToggleableFeatureGroup from "@/components/settings/ToggleableFeature";

export const SettingsTheme = () => {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);
  const [primary, setPrimary] = useAtom(primaryAtom);
  const [secondary, setSecondary] = useAtom(secondaryAtom);
  const { size, setSize } = useVideoCardSizes(["lg", "md", "list"]);
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
      value: "list",
      label: t("views.settings.gridSize.2"),
      icon: "i-lucide:list",
    },
  ] as const;

  const gridSizeFeatures = gridSizes.map(({ label, value, icon }) => ({
    id: `gridSize-${value}`,
    checked: size === value,
    onCheckedChange: () => setSize(value),
    label,
    variant: "icon" as const,
    icon,
  }));

  // Then the display preference features
  const displayPreferenceFeatures = [
    {
      id: "hide_thumbnails",
      checked: hideThumbnail,
      onCheckedChange: () => setHideThumbnail(!hideThumbnail),
      label: t("views.settings.hideVideoThumbnailsLabel"),
      variant: "icon" as const,
      icon: "i-lucide:image",
    },
    {
      id: "use_english_names",
      checked: useENName,
      onCheckedChange: () => setUseENName(!useENName),
      label: t("views.settings.useEnglishNameMsg"),
      variant: "icon" as const,
      icon: "i-lucide:languages",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Color Pickers */}
      <SettingsItem label={t("views.settings.theme")} fullWidth>
        <div className="flex items-center justify-between">
          <div
            className="flex grow cursor-pointer items-center gap-3"
            onClick={() => setDark(!dark)}
          >
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
                    ? "i-heroicons:moon text-primary-11"
                    : "i-heroicons:sun text-primary-11",
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
              "h-10 w-10 p-0 text-primary-12 transition-colors",
              dark ? "bg-base-4" : "bg-primary-4",
            )}
          >
            <div
              className={cn(
                "block w-5",
                dark ? "i-heroicons:moon" : "i-heroicons:sun",
              )}
            />
          </Button>
        </div>
        <Separator />
        <ColorPickerRow
          label="Primary Color"
          value={primary}
          onChange={setPrimary}
          options={THEME_COLORS.concat(THEME_BASE_COLORS)}
        />
        <Separator />
        <ColorPickerRow
          label="Secondary Color"
          value={secondary}
          onChange={setSecondary}
          options={THEME_COLORS.concat(THEME_BASE_COLORS)}
        />
      </SettingsItem>
      {/* Grid Size Selection */}
      <SettingsItem label={t("views.settings.gridSizeLabel")} fullWidth>
        <ToggleableFeatureGroup features={gridSizeFeatures} />
      </SettingsItem>
      {/* Display Preferences */}
      <SettingsItem label={t("views.settings.hideFeaturesLabel")} fullWidth>
        <ToggleableFeatureGroup
          features={displayPreferenceFeatures}
          showDividers
        />
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