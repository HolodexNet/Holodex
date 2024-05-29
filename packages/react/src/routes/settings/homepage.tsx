import { SettingsItem } from "@/components/settings/SettingsItem";
import { TopicPicker } from "@/components/topic/TopicPicker";
import { cn } from "@/lib/utils";
import { Badge } from "@/shadcn/ui/badge";
import { Label } from "@/shadcn/ui/label";
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
      label: t("views.settings.gridSize.0"),
      icon: "i-lucide:grid-3x3",
    },
    {
      value: "sm",
      label: t("views.settings.gridSize.1"),
      icon: "i-lucide:list",
    },
  ];

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
      <SettingsItem label={t("views.settings.defaultPage")}>
        <RadioGroup
          className="flex w-full flex-col gap-0 overflow-hidden rounded-lg border border-base"
          value={defaultOpen}
          onValueChange={(val: "Home" | "Favorites") => setDefaultOpen(val)}
        >
          {defaultPages.map(({ label, value }) => (
            <div
              className={cn("flex items-center text-primary-12 space-x-2 p-4", {
                "bg-primaryA-4": value === defaultOpen,
                "text-base-11": value !== defaultOpen,
              })}
            >
              <Label
                htmlFor={"defaultPage" + value}
                className={cn(
                  "flex w-full items-center justify-between hover:cursor-pointer",
                )}
              >
                {label}
              </Label>
              <RadioGroupItem value={value} id={"defaultPage" + value} />
            </div>
          ))}
        </RadioGroup>
      </SettingsItem>
      <SettingsItem label={t("views.settings.gridSizeLabel")}>
        <RadioGroup
          className="ml-auto flex gap-0 rounded-lg"
          onValueChange={(val: "lg" | "md" | "sm") => setSize(val)}
        >
          {gridSizes.map(({ label, value, icon }) => (
            <Label
              className={cn(
                "bg-base-4 border-base border-r-2 px-4 py-2 text-lg first:rounded-l-lg last:rounded-r-lg last:border-r-0 hover:cursor-pointer",
                { "bg-secondary-9": value === size },
              )}
            >
              <div className="flex flex-row items-center gap-1">
                <div className={icon}></div>
                <span>{label}</span>
              </div>
              <RadioGroupItem value={value} className="sr-only" />
            </Label>
          ))}
        </RadioGroup>
      </SettingsItem>
      <SettingsItem label={t("views.settings.ignoredTopicsLabel")}>
        <div className="flex w-full flex-col gap-2">
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
      <SettingsItem label={t("views.settings.hideFeaturesLabel")}>
        <div className="flex w-full flex-col rounded-lg border border-base">
          {hideFeatures.map(({ label, value, onChange }, index) => (
            <Label
              className={cn(
                "flex min-w-[18rem] w-full justify-between items-center gap-4 px-4 py-4 hover:cursor-pointer",
                {
                  "bg-base-4": index % 2,
                },
              )}
              htmlFor={`hidefeature-${label}`}
            >
              {label}
              <Switch
                id={`hidefeature-${label}`}
                checked={value}
                onCheckedChange={onChange}
              />
            </Label>
          ))}
        </div>
      </SettingsItem>
    </div>
  );
}
