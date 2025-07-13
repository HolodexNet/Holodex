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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { LiveChannel } from "./LiveChannel";
import { useLive } from "@/services/live.service";
import { useRef, useState } from "react";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import { useVideoSort } from "@/hooks/useVideoSort";
import { MultiViewIcon } from "./ToolButton";
import { useTranslation } from "react-i18next";
import { Button } from "@/shadcn/ui/button";

type VideoWithExtra = VideoBase & {
  platform: string;
};

export function ToolBar({ icons }: { icons: MultiViewIcon[] }) {
  const { t } = useTranslation();
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
        "top-0 z-20 grid h-[var(--toolbar-height)] max-w-full items-stretch content-center gap-4 rounded-none bg-base-2 py-2 px-4 transition-all duration-300 md:px-10",
        !open ? "sticky" : isFullScreen ? "" : "sticky",
        isBarActive ? "visible" : "hidden",
        isMobile ? "justify-center" : "grid-cols-[auto_1fr_auto]",
      )}
    >
      {!isMobile && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  "w-48 h-full box-border z-30 flex justify-between items-center px-4",
                )}
                variant="default"
              >
                {t(currentOrg.name)}
                <div className="shrink-0 ml-2 inline-block h-4 w-4 align-middle opacity-50 i-lucide:chevrons-down"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-base-2 z-30">
              {[Favorites, ...defaultOrgs].map((org) => {
                return (
                  <DropdownMenuItem
                    key={`${org.name}-selection`}
                    className="cursor-pointer gap-1 px-4 py-2"
                    onClick={() => onSelect(org)}
                  >
                    {t(org.name)}
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
