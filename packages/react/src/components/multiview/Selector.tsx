import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { defaultOrgs } from "../../store/org";
import { useLive } from "@/services/live.service";
import { LiveChannelIcon } from "./LiveChannelIcon";
import { cn } from "../../lib/utils";

// I need a way to get a list of data containing the option name
// based on the option selected, a list of current streams should be displayed
// we need a current selection to hold the data
/**
 * Options beyond the existing orgs:
 * - favorites
 * - youtube url
 * - twitch url
 * - all vtubers
 */

// temporarily we will just get the favourites option

export function Selector() {
  // create a mock favourites object as an org
  const Favorites: Org = {
    name: "Favorites",
  };
  // based on what the selection is -> use different methods to render title card?
  const [currentOrg, setCurrentOrg] = useState(Favorites);
  const [liveChannels, setLiveChannels] = useState<Live[]>([]);
  const channels = useLive({ org: currentOrg.name });

  useEffect(() => {
    const data = channels.data;
    if (!data) return;
    setLiveChannels(data);
    console.log(data);
  }, [channels.data]);

  const onSelect = (org: Org) => {
    if (org.name === currentOrg.name) return;
    setCurrentOrg(org);
    setLiveChannels([]);
  };

  return (
    <div className="flex w-full">
      <DropdownMenu>
        <DropdownMenuTrigger className="z-30 mx-2 flex min-h-8 w-48 shrink-0 items-center justify-between overflow-hidden rounded-md bg-base-2 pl-4 pr-2 hover:bg-primary-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-7 active:scale-[97%] active:bg-primaryA-7 disabled:pointer-events-none disabled:opacity-50">
          {currentOrg.name}
          <div className="i-lucide:chevrons-down ml-2 inline-block h-4 w-4 shrink-0 align-middle opacity-50"></div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-30 w-48 bg-base-2">
          {[Favorites, ...defaultOrgs].map((org) => {
            return (
              <DropdownMenuItem
                className="cursor-pointer gap-1 py-2"
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
        {liveChannels.map((channel) => {
          return (
            <LiveChannelIcon
              imageLink={channel.channel.photo}
              channelName={channel.channel.name}
            />
          );
        })}
      </div>
    </div>
  );
}
