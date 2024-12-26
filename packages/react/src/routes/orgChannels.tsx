import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { VirtuosoLoadingFooter } from "@/components/common/Loading";
import { useChannels } from "@/services/channel.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";

// Types
type DisplayStyle = "grid" | "list";
type SortOption = "suborg" | "subscriber_count" | "view_count";

// Atoms and constants
const orgChannelDisplayStyleAtom = atomWithStorage<DisplayStyle>(
  "orgChannelDisplayStyle",
  window.innerWidth > 498 ? "grid" : "list",
);

const orgChannelSortByAtom = atomWithStorage<SortOption>(
  "orgChannelSortBy",
  "suborg",
);

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: "suborg", label: "Standard Sort", icon: "i-lucide:arrow-down-a-z" },
  {
    value: "subscriber_count",
    label: "Subscribers",
    icon: "i-lucide:users",
  },
  {
    value: "view_count",
    label: "Views",
    icon: "i-lucide:eye",
  },
];

// Group component
const GroupComponent: React.FC<{
  group: string;
  channels: Channel[];
  displayStyle: DisplayStyle;
}> = ({ group, channels, displayStyle }) => {
  return (
    <React.Fragment>
      {group && <h2 className="mb-4 mt-6 text-xl font-bold">{group}</h2>}
      {displayStyle === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-4">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              {...channel}
              variant="card"
              size="lg"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((channel) => (
            <div key={channel.id} className="py-1">
              <ChannelCard
                key={channel.id}
                {...channel}
                variant="list"
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

// Main ChannelsOrg component
export function ChannelsOrg() {
  const { t } = useTranslation();
  const { org } = useParams();

  const [displayStyle, setDisplayStyle] = useAtom(orgChannelDisplayStyleAtom);
  const [sortBy, setSortBy] = useAtom(orgChannelSortByAtom);

  const {
    data: channels,
    fetchNextPage: fetchChannels,
    isFetchingNextPage,
    hasNextPage,
  } = useChannels({
    org,
    sort: sortBy,
    order:
      sortBy === "subscriber_count" || sortBy === "view_count" ? "desc" : "asc",
  });

  const sortedAndGroupedChannels = useMemo(() => {
    const processedChannels = channels?.pages.flat() ?? [];

    if (sortBy === "suborg") {
      const groupedChannels: Record<string, Channel[]> = {};
      processedChannels.forEach((channel) => {
        const group = channel.group || "Other";
        if (!groupedChannels[group]) {
          groupedChannels[group] = [];
        }
        groupedChannels[group].push(channel);
      });

      // Sort groups internally by suborg
      Object.keys(groupedChannels).forEach((group) => {
        groupedChannels[group].sort((a, b) =>
          (a.suborg || "").localeCompare(b.suborg || ""),
        );
      });

      return groupedChannels;
    }

    return { "": processedChannels };
  }, [channels, sortBy]);

  return (
    <>
      <Helmet>
        <title>
          TODO PUT CURRENT ORG HERE {t("component.mainNav.channels")} - Holodex
        </title>
      </Helmet>
      <div className="h-full w-full px-4 md:p-8">
        <div className="mb-6 flex flex-row gap-4">
          {/* Controls */}
          <div className="flex gap-1">
            <Button
              variant={displayStyle === "grid" ? "default" : "base-outline"}
              size="icon-lg"
              className="h-9 w-9"
              onClick={() => setDisplayStyle("grid")}
            >
              <span className="i-lucide:layout-grid text-base" />
            </Button>
            <Button
              variant={displayStyle === "list" ? "default" : "base-outline"}
              size="icon-lg"
              className="h-9 w-9"
              onClick={() => setDisplayStyle("list")}
            >
              <span className="i-lucide:list text-base" />
            </Button>
          </div>

          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => {
              setSortBy(value);
            }}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span className={cn(option.icon, "text-base")} />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          {Object.entries(sortedAndGroupedChannels).map(
            ([group, channelsInGroup]) => (
              <GroupComponent
                key={group}
                group={group}
                channels={channelsInGroup}
                displayStyle={displayStyle}
              />
            ),
          )}
        </div>
        {hasNextPage && (
          <VirtuosoLoadingFooter
            context={{
              size: "sm",
              isLoading: isFetchingNextPage,
              hasNextPage: hasNextPage ?? false,
              loadMore: fetchChannels,
              autoload: true,
            }}
          />
        )}
      </div>
    </>
  );
}
