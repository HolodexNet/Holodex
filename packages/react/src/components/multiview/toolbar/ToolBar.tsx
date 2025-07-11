/* eslint-disable tailwindcss/no-custom-classname */
import { cn } from "@/lib/utils";
import { mdiChevronDown } from "@mdi/js";
import { ToolButton } from "./ToolButton";
import { ToolButtonContainer } from "./ToolButtonContainer";
import {
  isSidebarOpenAtom,
  multiViewPanelOpenAtom,
  openMultiViewPanelAtom,
  sidebarShouldBeFullscreenAtom,
} from "@/hooks/useFrame";
import { useAtom, useSetAtom } from "jotai";
// import { useTranslation } from "react-i18next";
import { defaultOrgs } from "@/store/org";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { LiveChannel } from "./LiveChannel";
import { useLive } from "@/services/live.service";
import { useEffect, useRef, useState } from "react";

export function ToolBar() {
  //   const { t } = useTranslation();
  const [open] = useAtom(isSidebarOpenAtom);
  const [isFullScreen] = useAtom(sidebarShouldBeFullscreenAtom);
  const [isBarActive] = useAtom(multiViewPanelOpenAtom);
  const openPanel = useSetAtom(openMultiViewPanelAtom);

  // create a mock favourites object as an org
  const Favorites: Org = {
    name: "Favorites",
  };
  // based on what the selection is -> use different methods to render title card?
  const [currentOrg, setCurrentOrg] = useState(Favorites);
  const [liveChannels, setLiveChannels] = useState<Live[]>([]);
  const { data } = useLive({ org: currentOrg.name });
  const liveChannelContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data) return;
    setLiveChannels(data.items);
  }, [data]);

  const onSelect = (org: Org) => {
    if (org.name === currentOrg.name) return;
    setCurrentOrg(org);
    setLiveChannels([]);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (liveChannelContainerRef.current) {
      if (e.deltaY !== 0) {
        liveChannelContainerRef.current.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }
  };

  return (
    <>
      <div
        className={cn(
          "top-0 grid max-w-full grid-cols-[auto,1fr,auto] items-stretch gap-2 rounded-none bg-base-2 p-2 transition-all md:px-10",
          //isStuckAtTop && "rounded-lg md:mx-8 md:px-2",
          !open ? "sticky" : isFullScreen ? "" : "sticky",
          isBarActive ? "visible" : "hidden",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-h-8 w-48 shrink-0 items-center justify-between overflow-hidden rounded-md bg-base-2 pl-4 pr-2 hover:bg-primary-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-7 active:scale-[97%] active:bg-primaryA-7 disabled:pointer-events-none disabled:opacity-50">
            {currentOrg.name}
            <div className="i-lucide:chevrons-down ml-2 inline-block h-4 w-4 shrink-0 align-middle opacity-50"></div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-30 w-48 bg-base-2">
            {[Favorites, ...defaultOrgs].map((org) => {
              return (
                <DropdownMenuItem
                  className="cursor-pointer gap-1 px-4 py-2 hover:bg-primary-5"
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
          ref={liveChannelContainerRef}
          onWheel={handleWheel}
          className={cn("flex min-h-12 w-full gap-2 overflow-x-scroll", {})}
        >
          {liveChannels.map((live) => {
            return (
              <LiveChannel
                key={live.id}
                videoId={live.id}
                topicId={live.topic_id!}
                channel={live.channel}
                title={live.title.trim()}
              />
            );
          })}
        </div>
        <ToolButtonContainer />
      </div>
      <ToolButton
        className={cn(
          "right-2 top-0 z-20 rounded-none bg-base-2 p-1 transition-all md:px-5",
          "absolute",
          isBarActive ? "hidden" : "visible",
        )}
        icon={{
          path: mdiChevronDown,
          tooltip: "Open Panel",
          onClick: openPanel,
        }}
      />
    </>
  );
}
