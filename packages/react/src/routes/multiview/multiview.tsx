import { ToolBar } from "@/components/multiview/toolbar/ToolBar";
import {
  MultiViewIcon,
  ToolButton,
} from "@/components/multiview/toolbar/ToolButton";
import {
  closeMultiViewPanelAtom,
  isMobileAtom,
  isSidebarOpenAtom,
  multiViewPanelOpenAtom,
  openMultiViewPanelAtom,
} from "@/hooks/useFrame";
import {
  clearMultiviewCellsAtom,
  readMultiviewCellsAtom,
  useMultiViewFullScreen,
} from "@/store/multiview";
import { cn } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { MultiViewBackground } from "@/components/multiview/background";
import "../../components/multiview/Multiview.scss";
import { Cell, VideoCell } from "@/types/multiview";
import { Layout } from "@/components/multiview/cell/Layout";

const reorderIcon =
  "M2 2h8.8v8.8H2V2Zm11.3 11.3H22V22h-8.8v-8.8Zm4.6-10.9a.6.6 0 0 0-1 0l-3.9 4a.6.6 0 1 0 .9.9l3.5-3.6L21 7.3a.6.6 0 0 0 .8-1l-4-4Zm.1 10V2.8h-1.2v9.6H18ZM5.7 21.6c.3.3.7.3 1 0l3.9-4a.6.6 0 1 0-.9-.9l-3.5 3.6-3.6-3.6a.6.6 0 1 0-.9 1l4 4Zm-.2-10v9.6h1.3v-9.6H5.5Z";

// multiview skeleton
// selection bar at the top to change between orgs and allow url insertion
// grid page for drag and drop

export function Multiview() {
  const multiviewRef = useRef<HTMLDivElement>(null);

  const isBarActive = useAtomValue(multiViewPanelOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const { cells } = useAtomValue(readMultiviewCellsAtom);

  const openPanel = useSetAtom(openMultiViewPanelAtom);
  const closePanel = useSetAtom(closeMultiViewPanelAtom);
  const clearCells = useSetAtom(clearMultiviewCellsAtom);

  const { isFullScreen: isFullscreen, toggleFullScreen } =
    useMultiViewFullScreen(multiviewRef);

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
    { path: "i-heroicons:trash", tooltip: "Clear", onClick: clearCells },
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
      <div id="multiview" ref={multiviewRef} className="relative">
        <div className="relative flex w-full flex-col h-full">
          <ToolBar
            icons={isMobile ? mobileIcons : icons}
            currentVideoIds={cells
              .filter((c: Cell) => c.type === "video")
              .map((c: VideoCell) => c.i.replace("video_", ""))}
          />
          <ToolButton
            className={cn(
              "right-4 top-4 z-40 rounded-none bg-base-2 p-1 transition-all md:px-5",
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
        <div
          className={cn(
            "absolute left-0 z-0 overflow-hidden",
            isSidebarOpen ? "w-[calc(100vw-var(--sidebar-width))]" : "w-full",
            isFullscreen
              ? isBarActive
                ? "min-h-[calc(100vh-var(--toolbar-height))]"
                : "min-h-full"
              : isBarActive
                ? "min-h-[calc(100vh-var(--toolbar-height)-var(--header-height))]"
                : "min-h-[calc(100vh-var(--header-height))]",
          )}
        >
          <MultiViewBackground
            isFullScreen={isFullscreen}
            showTips={cells.length === 0}
          />
          {cells.length > 0 && <Layout isFullScreen={isFullscreen} />}
        </div>
      </div>
    </>
  );
}
