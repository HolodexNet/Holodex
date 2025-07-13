import { cn } from "@/lib/utils";
import { ToolButtonContainer } from "./ToolButtonContainer";
import {
  isMobileAtom,
  isSidebarOpenAtom,
  multiViewPanelOpenAtom,
  sidebarShouldBeFullscreenAtom,
} from "@/hooks/useFrame";
import { useAtom, useAtomValue } from "jotai";
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
import { useRef, useState } from "react";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import { useVideoSort } from "@/hooks/useVideoSort";
import { MultiViewIcon } from "./ToolButton";

type VideoWithExtra = VideoBase & {
  platform: string;
};

export function ToolBar({ icons }: { icons: MultiViewIcon[] }) {
  //   const { t } = useTranslation();
  const [open] = useAtom(isSidebarOpenAtom);
  const [isFullScreen] = useAtom(sidebarShouldBeFullscreenAtom);
  const [isBarActive] = useAtom(multiViewPanelOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);

  // create a mock favourites object as an org
  const Favorites: Org = {
    name: "Favorites",
  };
  // based on what the selection is -> use different methods to render title card?
  const [currentOrg, setCurrentOrg] = useState(Favorites);
  const { data: live } = useLive({
    org: currentOrg.name,
    type: ["stream"],
  });

  const liveChannelContainerRef = useRef<HTMLDivElement>(null);

  const liveFiltered = useVideoFilter(
    live?.items as Video[],
    "stream_schedule",
    "org",
  );

  // sort livestreams by video list settings
  const nowLiveSorted = useVideoSort(liveFiltered, "stream_schedule");
  const nowLiveSortedWithPlatform: VideoWithExtra[] = nowLiveSorted.map(
    (video) => ({
      ...video,
      platform: (video as VideoWithExtra).platform ?? "",
    }),
  );

  const onSelect = (org: Org) => {
    if (org.name === currentOrg.name) return;
    setCurrentOrg(org);
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
    <div
      id="multiview-toolbar"
      className={cn(
        "top-0 z-20 grid h-[var(--toolbar-height)] max-w-full items-stretch gap-2 rounded-none bg-base-2 p-2 transition-all duration-300 md:px-10",
        !open ? "sticky" : isFullScreen ? "" : "sticky",
        isBarActive ? "visible" : "hidden",
        isMobile ? "justify-center" : "grid-cols-[auto_1fr_auto]",
      )}
    >
      {!isMobile && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex min-h-8 w-48 shrink-0 items-center justify-between overflow-hidden rounded-md bg-base-2 pl-4 pr-2 hover:bg-primary-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-7 active:scale-[97%] active:bg-primaryA-7 disabled:pointer-events-none disabled:opacity-50">
              {currentOrg.name}
              <div className="shrink-0 ml-2 inline-block h-4 w-4 align-middle opacity-50 i-lucide:chevrons-down"></div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-base-2 z-30">
              {[Favorites, ...defaultOrgs].map((org) => {
                return (
                  <DropdownMenuItem
                    className="hover:bg-primary-5 cursor-pointer gap-1 px-4 py-2"
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
            {nowLiveSortedWithPlatform.map((live) => {
              return <LiveChannel key={live.id} video={live} />;
            })}
          </div>
        </>
      )}
      <ToolButtonContainer icons={icons} />
    </div>
  );
}
