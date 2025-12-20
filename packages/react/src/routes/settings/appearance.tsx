import { SettingsItem } from "@/components/settings/SettingsItem";
import { Button } from "@/shadcn/ui/button";

import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { darkAtom, primaryHexAtom, secondaryHexAtom } from "@/hooks/useTheme";
import { useVideoCardSizes } from "@/store/video";
import { hideThumbnailAtom, englishNameAtom } from "@/store/settings";
import ToggleableFeatureGroup from "@/components/settings/ToggleableFeature";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { useEffect } from "react";
import { Label } from "@/shadcn/ui/label";
import { useDebounceValue } from "usehooks-ts";

export const SettingsTheme = () => {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);
  const [primaryHex, setPrimaryHex] = useAtom(primaryHexAtom);
  const [secondaryHex, setSecondaryHex] = useAtom(secondaryHexAtom);

  const [primaryColor, setPrimaryColor] = useColor(primaryHex);
  const [secondaryColor, setSecondaryColor] = useColor(secondaryHex);

  const [debouncedPrimaryColor] = useDebounceValue(primaryColor, 500);
  const [debouncedSecondaryColor] = useDebounceValue(secondaryColor, 500);

  useEffect(() => {
    setPrimaryHex(debouncedPrimaryColor.hex);
  }, [debouncedPrimaryColor, setPrimaryHex]);

  useEffect(() => {
    setSecondaryHex(debouncedSecondaryColor.hex);
  }, [debouncedSecondaryColor, setSecondaryHex]);

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
            className="flex items-center grow cursor-pointer gap-3"
            onClick={() => setDark(!dark)}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                dark ? "" : "",
              )}
            >
              <div
                className={cn(
                  "h-5 w-5",
                  dark ? "i-heroicons:moon " : "i-heroicons:sun ",
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                {dark ? "Dark Mode" : "Light Mode"}
              </span>
              <span className="text-sm">
                {dark ? "Easier on the eyes" : "Better contrast"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setDark(!dark)}
            className={cn("h-10 w-24 p-0  transition-colors", dark ? "" : "")}
          >
            <div
              className={cn(
                "block w-5",
                dark ? "i-heroicons:moon" : "i-heroicons:sun",
              )}
            />
          </Button>
        </div>
        <div className="pt-4 space-y-4">
          {/* We need to wrap ColorPicker in a way that doesn't crash. 
               The previous crash might have been due to missing CSS import or Portal issues. 
               Adding the CSS import here just in case. 
           */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Primary Color</Label>
              <div className="border rounded-lg p-2 bg-card">
                <ColorPicker
                  color={primaryColor}
                  onChange={setPrimaryColor}
                  hideInput={["hsv"]}
                  hideAlpha
                  height={150}
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Secondary Color</Label>
              <div className="border rounded-lg p-2 bg-card">
                <ColorPicker
                  color={secondaryColor}
                  onChange={setSecondaryColor}
                  hideInput={["hsv"]}
                  hideAlpha
                  height={150}
                />
              </div>
            </div>
          </div>
        </div>
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
