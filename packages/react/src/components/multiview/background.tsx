import { isMobileAtom, isSidebarOpenAtom } from "@/hooks/useFrame";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import React from "react";
import "./Multiview.scss";

interface MultiViewBackgroundProps {
  columnWidth?: number;
  rowHeight?: number;
  showTips?: boolean;
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
        "absolute left-0 z-0 transition-all duration-300",
        `bg-size-[${columnWidth}px ${rowHeight}px]`,
        isMobile
          ? "ml-0"
          : isSidebarOpen
            ? "ml-[var(--sidebar-width)]"
            : "ml-0",
        isSidebarOpen ? "w-[calc(100%-var(--sidebar-width))]" : "w-full",
        collapseToolbar
          ? "h-[calc(100%-var(--header-height))]"
          : "h-[calc(100%-var(--header-height)-var(--toolbar-height))]",
      )}
    >
      {showTips && (
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/3 -translate-y-1/2 text-center text-lg text-white",
            "-translate-x-1/2",
          )}
        >
          Drag videos here to start your multiview!
        </div>
      )}
      {children}
    </div>
  );
};
