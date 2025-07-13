import { MultiViewBackground } from "@/components/multiview/background";
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
import { cn } from "@/lib/utils";
import {
  mdiCardPlusOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiContentSaveOutline,
  mdiDeleteOutline,
  mdiFullscreen,
  mdiGridLarge,
  mdiLinkVariant,
  mdiSync,
  mdiTuneVertical,
  mdiViewGridPlusOutline,
} from "@mdi/js";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";

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
  const toggleFullScreen = () => {
    if (multiviewRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (multiviewRef.current.parentElement) {
        multiviewRef.current.parentElement.requestFullscreen();
      }
    }
  };

  const baseIcons: MultiViewIcon[] = [
    { path: mdiCardPlusOutline, tooltip: "Open Dialog" },
    { path: mdiGridLarge, tooltip: "Change Layout" },
    { path: mdiViewGridPlusOutline, tooltip: "Add Cell" },
    { path: mdiTuneVertical, tooltip: "Media Control" },
    { path: reorderIcon, tooltip: "Reorder Layout" },
  ];

  const icons: MultiViewIcon[] = [
    ...baseIcons,
    { path: mdiSync, tooltip: "Archive Sync" },
    { path: mdiContentSaveOutline, tooltip: "Save Layout" },
    { path: mdiDeleteOutline, tooltip: "Clear" },
    {
      path: mdiFullscreen,
      tooltip: document.fullscreenElement
        ? "Exit Fullscreen"
        : "Enter Fullscreen",
      onClick: toggleFullScreen,
    },
    { path: mdiLinkVariant, tooltip: "Share Layout" },
    { path: mdiChevronUp, tooltip: "Collapse Panel", onClick: closePanel },
  ];

  const mobileIcons: MultiViewIcon[] = [
    ...baseIcons,
    { path: mdiLinkVariant, tooltip: "Share Layout" },
    { path: mdiChevronUp, tooltip: "Collapse Panel", onClick: closePanel },
  ];

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
        </div>
        <MultiViewBackground
          columnWidth={120}
          rowHeight={90}
          showTips={true}
          collapseToolbar={!isBarActive}
        />
      </div>
    </>
  );
}
