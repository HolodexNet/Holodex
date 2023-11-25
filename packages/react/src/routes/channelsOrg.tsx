import { ChannelCard } from "@/components/channel/ChannelCard";
import { cn } from "@/lib/utils";
import { useChannels } from "@/services/channel.service";
import { Label } from "@/shadcn/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shadcn/ui/radio-group";
import { Switch } from "@/shadcn/ui/switch";
import { orgAtom } from "@/store/org";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

export default function ChannelsOrg() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { org } = useParams();
  const currentOrg = useAtomValue(orgAtom);

  const {
    data: channels,
    fetchNextPage: fetchChannels,
    isLoading,
  } = useChannels({
    org,
    sort: "suborg",
  });

  useEffect(() => {
    navigate(`/org/${currentOrg}/channels`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg]);

  const [displayStyle, setDisplayStyle] = useState(() =>
    window.innerWidth > 498 ? "grid" : "list",
  );

  const channelList = useMemo(() => channels?.pages.flat() ?? [], [channels]);

  return (
    <>
      <Helmet>
        <title>
          {currentOrg} {t("component.mainNav.channels")} - Holodex
        </title>
      </Helmet>
      <div className="container h-full w-full px-4 md:p-8">
        <div className="flex flex-row">
          <RadioGroup
            className="ml-auto flex gap-0 rounded-lg"
            onValueChange={(val: "grid" | "list") => setDisplayStyle(val)}
          >
            <Label
              className={cn(
                "bg-base-4 border-base border-r-2 px-4 py-2 text-lg first:rounded-l-lg last:rounded-r-lg last:border-r-0 hover:cursor-pointer",
                { "bg-secondary-9": displayStyle == "grid" },
              )}
            >
              <div className="i-lucide:grid-3x3"></div>
              <RadioGroupItem value="grid" className="sr-only" />
            </Label>
            <Label
              className={cn(
                "bg-base-4 border-base border-r-2 px-4 py-2 text-lg first:rounded-l-lg last:rounded-r-lg last:border-r-0 hover:cursor-pointer",
                { "bg-secondary-9": displayStyle == "list" },
              )}
            >
              <div className="i-lucide:list"></div>
              <RadioGroupItem value="list" className="sr-only" />
            </Label>
          </RadioGroup>
        </div>
        <VirtuosoGrid
          useWindowScroll
          listClassName={
            displayStyle == "grid"
              ? "w-full grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-x-4 gap-y-6"
              : "w-full flex flex-col gap-y-2"
          }
          data={channelList}
          itemContent={(_, channel) => (
            <ChannelCard
              size={displayStyle == "grid" ? "lg" : "sm"}
              {...channel}
              key={"channel-" + channel.id}
            />
          )}
          endReached={async () => {
            await fetchChannels();
          }}
        />
      </div>
    </>
  );
}
