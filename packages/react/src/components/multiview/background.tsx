import { isMobileAtom, isSidebarOpenAtom } from "@/hooks/useFrame";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import React from "react";

interface MultiViewBackgroundProps {
  columnWidth?: number;
  rowHeight?: number;
  showTips?: boolean;
  isFullScreen?: boolean;
  collapseToolbar?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const MultiViewBackground = ({
  columnWidth,
  rowHeight,
  showTips = false,
  collapseToolbar = false,
  style = {},
  children,
  isFullScreen = false,
}: MultiViewBackgroundProps) => {
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  // Example: 24 columns, 12 rows (customize as needed)
  // const numColumns = 24;
  // const numRows = 12;

  // Grid background using repeating linear gradients
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `
      repeating-linear-gradient(
        to right,
        #222 0,
        #222 1px,
        transparent 1px,
        transparent ${columnWidth}px
      ),
      repeating-linear-gradient(
        to bottom,
        #222 0,
        #222 1px,
        transparent 1px,
        transparent ${rowHeight}px
      )
    `,
    ...style,
  };

  return (
    <div
      id="multiview-background"
      style={backgroundStyle}
      className={cn(
        "absolute left-0 z-0",
        `bg-size-[${columnWidth}px ${rowHeight}px]`,
        isMobile
          ? "ml-0"
          : isSidebarOpen
            ? "ml-[var(--sidebar-width)]"
            : "ml-0",
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
      {showTips && (
        <div className="pointer-events-none absolute left-1/2 top-1/3 text-center text-lg text-white -translate-y-1/2 -translate-x-1/2">
          Drag videos here to start your multiview!
        </div>
      )}
      {children}
    </div>
  );
};
