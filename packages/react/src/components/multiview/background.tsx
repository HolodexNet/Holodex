import { useComputedDimensions } from "@/hooks/useComputedDimensions";
import { isMobileAtom } from "@/hooks/useFrame";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import React from "react";

interface MultiViewBackgroundProps {
  showTips?: boolean;
  isFullScreen?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const MultiViewBackground = ({
  showTips = false,
  style = {},
  children,
  isFullScreen = false,
}: MultiViewBackgroundProps) => {
  const isMobile = useAtomValue(isMobileAtom);
  const { cellDimensions } = useComputedDimensions(isFullScreen);

  // Grid background using repeating linear gradients
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `
      repeating-linear-gradient(
        to right,
        #222 0,
        #222 1px,
        transparent 1px,
        transparent ${cellDimensions.columnWidth}px
      ),
      repeating-linear-gradient(
        to bottom,
        #222 0,
        #222 1px,
        transparent 1px,
        transparent ${cellDimensions.rowHeight}px
      )
    `,
    ...style,
  };

  return (
    <div
      id="multiview-background"
      style={backgroundStyle}
      className={cn(
        `bg-size-[${cellDimensions.columnWidth}px ${cellDimensions.rowHeight}px]`,
        "absolute h-full w-full",
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
