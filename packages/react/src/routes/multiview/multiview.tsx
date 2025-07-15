import { ToolBar } from "@/components/multiview/toolbar/ToolBar";
import {
  MultiViewIcon,
  ToolButton,
} from "@/components/multiview/toolbar/ToolButton";
import {
  closeMultiViewPanelAtom,
  isMobileAtom,
  multiViewPanelOpenAtom,
  openMultiViewPanelAtom,
} from "@/hooks/useFrame";
import { useMultiViewFullScreen } from "@/store/multiview";
import { cn } from "@/lib/utils";

import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { MultiViewBackground } from "@/components/multiview/background";

const reorderIcon =
  "M2 2h8.8v8.8H2V2Zm11.3 11.3H22V22h-8.8v-8.8Zm4.6-10.9a.6.6 0 0 0-1 0l-3.9 4a.6.6 0 1 0 .9.9l3.5-3.6L21 7.3a.6.6 0 0 0 .8-1l-4-4Zm.1 10V2.8h-1.2v9.6H18ZM5.7 21.6c.3.3.7.3 1 0l3.9-4a.6.6 0 1 0-.9-.9l-3.5 3.6-3.6-3.6a.6.6 0 1 0-.9 1l4 4Zm-.2-10v9.6h1.3v-9.6H5.5Z";

// multiview skeleton
// selection bar at the top to change between orgs and allow url insertion
// grid page for drag and drop

export function Multiview() {
  const isBarActive = useAtomValue(multiViewPanelOpenAtom);
  const openPanel = useSetAtom(openMultiViewPanelAtom);
  const multiviewRef = useRef<HTMLDivElement>(null);
  const closePanel = useSetAtom(closeMultiViewPanelAtom);
  const isMobile = useAtomValue(isMobileAtom);

  const { isFullScreen: isFullscreen, toggleFullScreen } =
    useMultiViewFullScreen(multiviewRef.current);

  const baseIcons: MultiViewIcon[] = [
    { path: "i-heroicons:plus-circle", tooltip: "Select Live" },
    { path: "i-heroicons:squares-2x2", tooltip: "Change Layout" },
    { path: "i-heroicons:squares-plus", tooltip: "Add Cell" },
    { path: "i-heroicons:adjustments-vertical", tooltip: "Media Control" },
    { path: "i-heroicons:rectangle-group", tooltip: "Reorder Layout" },
  ];

  const additionalIcons: MultiViewIcon[] = [
    { path: "i-heroicons:link", tooltip: "Share Layout" },
    {
      path: "i-heroicons:chevron-up",
      tooltip: "Collapse Panel",
      onClick: closePanel,
    },
  ];

  const icons: MultiViewIcon[] = [
    ...baseIcons,
    { path: "i-heroicons:arrow-path", tooltip: "Archive Sync" },
    { path: "i-fluent:save-32-regular", tooltip: "Save Layout" },
    { path: "i-heroicons:trash", tooltip: "Clear" },
    {
      path: isFullscreen
        ? "i-heroicons:arrows-pointing-in"
        : "i-heroicons:arrows-pointing-out",
      tooltip: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
      onClick: toggleFullScreen,
    },
    ...additionalIcons,
  ];

  const mobileIcons: MultiViewIcon[] = [...baseIcons, ...additionalIcons];

  return (
    <>
      <Helmet>
        <title>Multiview - Holodex</title>
      </Helmet>
      <div id="multiview" ref={multiviewRef}>
        <div className="flex relative h-full w-full flex-col">
          <ToolBar icons={isMobile ? mobileIcons : icons} />
          <ToolButton
            className={cn(
              "right-4 top-4 z-20 rounded-none bg-base-2 p-1 transition-all md:px-5",
              "absolute",
              isBarActive ? "hidden" : "visible",
            )}
            icon={{
              path: "i-heroicons:chevron-down",
              tooltip: "Open Panel",
              onClick: openPanel,
            }}
          />
        </div>
        {/* 
        divide the available horizontal space by 24 and vertical space by 24 
        take into account of whether the sidebar is open or not
        and the available space
        when it is fullscreen, there is no copyright bar at the bottom
        */}
        <MultiViewBackground columnWidth={24} rowHeight={8} />
      </div>
    </>
  );
}
