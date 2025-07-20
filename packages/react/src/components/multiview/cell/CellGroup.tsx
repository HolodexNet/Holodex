import { isSidebarOpenAtom, isMobileAtom } from "@/hooks/useFrame";
import { cn } from "@/lib/utils";
import { readMultiviewCellsAtom } from "@/store/multiview";
import { useAtomValue } from "jotai";
import { VideoCell } from "./video/VideoCell";
import { useComputedDimensions } from "@/hooks/useComputedDimensions";
import { CellContainer } from "./CellContainer";

export interface CellDimension {
  width: number;
  height: number;
}

interface CellGroupProps {
  isFullScreen?: boolean;
  collapseToolbar?: boolean;
}

export function CellGroup({
  isFullScreen = false,
  collapseToolbar,
}: CellGroupProps) {
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const { cells } = useAtomValue(readMultiviewCellsAtom);
  const { dimensions } = useComputedDimensions(isFullScreen);

  return (
    <div
      className={cn(
        "bg-red z-30 absolute overflow-hidden",
        // isMobile
        //   ? "ml-0"
        //   : isSidebarOpen
        //     ? "ml-[var(--sidebar-width)]"
        //     : "ml-0",
        isSidebarOpen ? "w-[calc(100%-var(--sidebar-width))]" : "w-full",
        isFullScreen
          ? collapseToolbar
            ? "h-full"
            : "h-[calc(100%-var(--toolbar-height))]"
          : collapseToolbar
            ? "h-[calc(100%-var(--header-height))]"
            : "h-[calc(100%-var(--toolbar-height)-var(--header-height))]",
      )}
    >
      {cells.map((cell) => {
        switch (cell.type) {
          case "video":
            return (
              <CellContainer
                height={dimensions.height}
                width={dimensions.width}
              >
                <VideoCell
                  key={cell.id}
                  video={cell.video}
                  height={dimensions.height}
                  width={dimensions.width}
                />
              </CellContainer>
            );
          case "chat":
            return (
              <CellContainer
                height={dimensions.height}
                width={dimensions.width}
              >
                <p>Chat cell not implemented yet</p>
              </CellContainer>
            );
          case "placeholder":
            return (
              <CellContainer
                height={dimensions.height}
                width={dimensions.width}
              >
                <p>Placeholder cell not implemented yet</p>
              </CellContainer>
            );
        }
      })}
    </div>
  );
}
