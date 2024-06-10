import { SettingsItem } from "@/components/settings/SettingsItem";
import { TopicPicker } from "@/components/topic/TopicPicker";
import { cn } from "@/lib/utils";
import { Badge } from "@/shadcn/ui/badge";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/shadcn/ui/radio-group";
import { Switch } from "@/shadcn/ui/switch";
import {
  defaultOpenAtom,
  hideCollabStreamsAtom,
  hidePlaceholderAtom,
  hideThumbnailAtom,
  ignoredTopicsAtom,
} from "@/store/settings";
import { useVideoCardSizes } from "@/store/video";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

export function SettingsHomepage() {
  const { t } = useTranslation();
  const [defaultOpen, setDefaultOpen] = useAtom(defaultOpenAtom);
  const { size, setSize } = useVideoCardSizes(["lg", "md", "sm"]);
  const [ignoredTopics, setIgnoredTopics] = useAtom(ignoredTopicsAtom);
  const [hideThumbnail, setHideThumbnail] = useAtom(hideThumbnailAtom);
  const [hideCollab, setHideCollab] = useAtom(hideCollabStreamsAtom);
  const [hidePlaceholder, setHidePlaceholder] = useAtom(hidePlaceholderAtom);

  const defaultPages = [
    {
      value: "Home",
      label: t("views.settings.defaultHomepage.lastVisitedOrgHome"),
    },
    {
      value: "Favorites",
      label: t("views.settings.defaultHomepage.favoritesWhenLoggedIn"),
    },
  ];

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

  const hideFeatures = [
    {
      label: t("views.settings.hideVideoThumbnailsLabel"),
      value: hideThumbnail,
      onChange: () => setHideThumbnail(!hideThumbnail),
    },
    {
      label: t("views.settings.hideCollabStreamsLabel"),
      value: hideCollab,
      onChange: () => setHideCollab(!hideCollab),
    },
    {
      label: t("views.settings.hidePlaceholderStreams"),
      value: hidePlaceholder,
      onChange: () => setHidePlaceholder(!hidePlaceholder),
    },
  ];

  return (
    <div className="flex flex-col p-2 md:p-4">
      <SettingsItem label={t("views.settings.defaultPage")} fullWidth>
        <div className="flex flex-col gap-2">
          <div
            className={cn("flex cursor-pointer items-center gap-2", {
              "text-primary-8": defaultOpen === "Home",
            })}
            onClick={() => setDefaultOpen("Home")}
          >
            <div className="i-lucide:home"></div>
            <div>{t("views.settings.defaultHomepage.lastVisitedOrgHome")}</div>
          </div>
          <div
            className={cn("flex cursor-pointer items-center gap-2", {
              "text-primary-8": defaultOpen === "Favorites",
            })}
            onClick={() => setDefaultOpen("Favorites")}
          >
            <div className="i-lucide:heart"></div>
            <div>
              {t("views.settings.defaultHomepage.favoritesWhenLoggedIn")}
            </div>
          </div>
        </div>
      </SettingsItem>
      <SettingsItem label={t("views.settings.gridSizeLabel")} fullWidth>
        <div className="flex flex-col gap-2">
          {gridSizes.map(({ label, value, icon }) => (
            <div
              className={cn("flex cursor-pointer items-center gap-2", {
                "text-primary-8": value === size,
              })}
              onClick={() => setSize(value)}
            >
              <div className={icon}></div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </SettingsItem>
      <SettingsItem label={t("views.settings.ignoredTopicsLabel")} fullWidth>
        <div className="flex flex-col gap-2">
          <TopicPicker
            onSelect={(topic) => setIgnoredTopics([...ignoredTopics, topic])}
          />
          <div className="flex flex-wrap gap-2">
            {ignoredTopics.map((topic) => (
              <Badge
                onClick={() =>
                  setIgnoredTopics(ignoredTopics.filter((t) => t !== topic))
                }
              >
                {topic}
                <div className="i-heroicons:x-mark ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      </SettingsItem>
      <SettingsItem label={t("views.settings.hideFeaturesLabel")} fullWidth>
        <div className="flex w-full flex-col items-start gap-2">
          {hideFeatures.map(({ label, value, onChange }, index) => (
            <div className="flex gap-2">
              <Checkbox
                checked={value}
                onCheckedChange={onChange}
                id={`hidefeature-${label}`}
              />
              <Label
                className={cn("cursor-pointer", {
                  "bg-base-3": index % 2,
                })}
                htmlFor={`hidefeature-${label}`}
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </SettingsItem>
    </div>
  );
}
