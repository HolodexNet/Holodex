import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { defaultOrgs } from "../../store/org";
import { useLive } from "@/services/live.service";
import { LiveChannel } from "./LiveChannel";
import { cn } from "../../lib/utils";

/**
 * ToDos:
 * - select favourites
 */

export function Selector() {
  // create a mock favourites object as an org
  const Favorites: Org = {
    name: "Favorites",
  };
  // based on what the selection is -> use different methods to render title card?
  const [currentOrg, setCurrentOrg] = useState(Favorites);
  const [liveChannels, setLiveChannels] = useState<Live[]>([]);
  const { data } = useLive({ org: currentOrg.name });

  useEffect(() => {
    if (!data) return;
    setLiveChannels(data.items);
    console.log(data);
  }, [data]);

  const onSelect = (org: Org) => {
    if (org.name === currentOrg.name) return;
    setCurrentOrg(org);
    setLiveChannels([]);
  };

  return (
    <div className="flex w-full">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center rounded-md hover: overflow-hidden focus-visible: active: justify-between shrink-0 z-30 mx-2 pl-4 pr-2 min-h-8 w-48 disabled:pointer-events-none focus-visible:outline-hidden focus-visible:ring-1 active:scale-[97%] disabled:opacity-50">
          {currentOrg.name}
          <div className="shrink-0 ml-2 inline-block h-4 w-4 align-middle opacity-50 i-lucide:chevrons-down"></div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-30 w-48">
          {[Favorites, ...defaultOrgs].map((org) => {
            return (
              <DropdownMenuItem
                className="gap-1 cursor-pointer py-2"
                onClick={() => onSelect(org)}
              >
                {org.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        id="live-channel-container"
        className={cn("flex min-h-12 flex-nowrap gap-2 overflow-scroll", {})}
      >
        {liveChannels.map((live) => {
          return (
            <LiveChannel
              key={live.id}
              channelImgLink={live.channel.photo}
              channelName={live.channel.name}
              videoId={live.id}
              topicId={live.topic_id!}
            />
          );
        })}
      </div>
    </div>
  );
}
