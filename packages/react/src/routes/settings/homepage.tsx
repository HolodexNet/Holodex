import { SettingsItem } from "@/components/settings/SettingsItem";
import { TopicPicker } from "@/components/topic/TopicPicker";
import { cn } from "@/lib/utils";
import { Badge } from "@/shadcn/ui/badge";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";
import {
  defaultOpenAtom,
  filterDeadStreamsAtom,
  filterLongStreamsAtom,
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

  const [filterDeadStreams, setFilterDeadStreams] = useAtom(
    filterDeadStreamsAtom,
  );
  const [filterLongStreams, setFilterLongStreams] = useAtom(
    filterLongStreamsAtom,
  );

  const defaultPages = [
    {
      value: "Home",
      label: t("views.settings.defaultHomepage.lastVisitedOrgHome"),
      icon: "i-lucide:home",
    },
    {
      value: "Favorites",
      label: t("views.settings.defaultHomepage.favoritesWhenLoggedIn"),
      icon: "i-heroicons:heart",
    },
  ] as const;

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
    {
      label: t("views.settings.filterDeadStreams"),
      value: filterDeadStreams,
      onChange: () => setFilterDeadStreams(!filterDeadStreams),
    },
    {
      label: t("views.settings.filterLongStreams"),
      value: filterLongStreams,
      onChange: () => setFilterLongStreams(!filterLongStreams),
    },
  ] as const;

  return (
    <div className="flex flex-col">
      <SettingsItem label={t("views.settings.defaultPage")} fullWidth>
        <div className="flex flex-col gap-2">
          {defaultPages.map(({ value, label, icon }) => (
            <div
              key={"defaultPage-" + value}
              className="flex items-center gap-3"
            >
              <Checkbox
                checked={defaultOpen === value}
                onCheckedChange={() => setDefaultOpen(value)}
                id={`defaultPage-${value}`}
              />
              <Label
                htmlFor={`defaultPage-${value}`}
                className={cn("flex cursor-pointer items-center gap-1", {
                  "opacity-70": defaultOpen !== value,
                })}
              >
                <div className={icon}></div>
                <span>{label}</span>
              </Label>
            </div>
          ))}
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
      <SettingsItem label={t("views.settings.ignoredTopicsLabel")} fullWidth>
        <div className="flex flex-col gap-2">
          <TopicPicker
            onSelect={(topic) => setIgnoredTopics([...ignoredTopics, topic])}
          />
          <div className="flex flex-wrap gap-2">
            {ignoredTopics.map((topic) => (
              <Badge
                key={"ignored-topic-" + topic}
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
        <div className="flex w-full flex-col items-start gap-3">
          {hideFeatures.map(({ label, value, onChange }) => (
            <div key={"hidefeature-" + label} className="flex gap-3">
              <Checkbox
                checked={value}
                onCheckedChange={onChange}
                id={`hidefeature-${label}`}
              />
              <Label
                className={cn("cursor-pointer", { "opacity-70": !value })}
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
