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
    <div className="flex items-center gap-2 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-sm shrink-0 justify-between gap-1 rounded-md px-3 py-1.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 active:scale-[97%]">
          {currentOrg.name}
          <div className="shrink-0 opacity-50 h-4 w-4 i-lucide:chevrons-down" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-30 w-48">
          {[Favorites, ...defaultOrgs].map((org) => (
            <DropdownMenuItem
              key={org.name}
              className="cursor-pointer gap-1 py-2"
              onClick={() => onSelect(org)}
            >
              {org.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Live channel list - horizontal scroll */}
      <div
        id="live-channel-container"
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted",
        )}
      >
        {liveChannels.map((live) => (
          <LiveChannel
            key={live.id}
            channelImgLink={live.channel.photo}
            channelName={live.channel.name}
            videoId={live.id}
            topicId={live.topic_id!}
          />
        ))}
      </div>
    </div>
  );
}
