import React from "react";
import { atom, useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import ToggleableFeatureGroup from "@/components/settings/ToggleableFeature";
import { Button } from "@/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import {
  filterDeadStreamsAtom,
  filterLongStreamsAtom,
  hideCollabStreamsAtom,
  hidePlaceholderAtom,
} from "@/store/settings";
import { DatePicker } from "../common/DatePicker";
import { Label } from "@/shadcn/ui/label";

export const VideoListSettingsMenu: React.FC<{
  activeTab: string;
}> = ({ activeTab }) => {
  const { t } = useTranslation();

  const [hideCollab, setHideCollab] = useAtom(hideCollabStreamsAtom);
  const [hidePlaceholder, setHidePlaceholder] = useAtom(hidePlaceholderAtom);
  const [filterDeadStreams, setFilterDeadStreams] = useAtom(
    filterDeadStreamsAtom,
  );
  const [filterLongStreams, setFilterLongStreams] = useAtom(
    filterLongStreamsAtom,
  );

  const hideFeatures = [
    {
      id: "hide_collab",
      checked: hideCollab,
      onCheckedChange: () => setHideCollab(!hideCollab),
      label: t("views.settings.hideCollabStreamsLabel"),
      variant: "basic" as const,
    },
    {
      id: "hide_placeholder",
      checked: hidePlaceholder,
      onCheckedChange: () => setHidePlaceholder(!hidePlaceholder),
      label: t("views.settings.hidePlaceholderStreams"),
      variant: "basic" as const,
    },
    {
      id: "filter_dead_streams",
      checked: filterDeadStreams,
      onCheckedChange: () => setFilterDeadStreams(!filterDeadStreams),
      label: t("views.settings.filterDeadStreams"),
      variant: "basic" as const,
    },
    {
      id: "filter_long_streams",
      checked: filterLongStreams,
      onCheckedChange: () => setFilterLongStreams(!filterLongStreams),
      label: t("views.settings.filterLongStreams"),
      variant: "basic" as const,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="shrink-0"
          size="icon-lg"
          variant="ghost"
          role="button"
          type="button"
        >
          <div className="i-lucide:list-filter" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[80vw]">
        <div role="menu" className="grid gap-4">
          {activeTab === "live" && <SortBySelect />}
          {(activeTab === "archive" || activeTab === "clips") && (
            <UploadedBeforeDatePicker />
          )}
          <ToggleableFeatureGroup features={hideFeatures} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Types
export type LiveStreamSortOption = "latest" | "viewers";

// Atoms and constants
export const liveStreamSortByAtom = atom<LiveStreamSortOption>("latest");

const sortOptions: { value: LiveStreamSortOption; label: string }[] = [
  { value: "latest", label: "Latest" },
  {
    value: "viewers",
    label: "Most Viewers",
  },
];

export const SortBySelect: React.FC = () => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useAtom(liveStreamSortByAtom);
  const id = "sort_live_streams";

  return (
    <div>
      <Label htmlFor={id}>{t("Sort By")}</Label>
      <Select
        value={sortBy}
        onValueChange={(value: LiveStreamSortOption) => {
          setSortBy(value);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={t("Sort by")} />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Atoms and constants
export const pastVideoFilterByAtom = atom<Date | undefined>(undefined);

export const UploadedBeforeDatePicker: React.FC = () => {
  const { t } = useTranslation();
  const [toDate, setToDate] = useAtom(pastVideoFilterByAtom);
  const id = "filter_past_videos";

  return (
    <div>
      <Label htmlFor={id}>{t("Uploaded Before")}</Label>
      <DatePicker
        id={id}
        className="w-full"
        selected={toDate}
        onSelect={setToDate}
      />
    </div>
  );
};
