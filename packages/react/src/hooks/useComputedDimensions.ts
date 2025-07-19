import { useAtomValue } from "jotai";
import { useState, useEffect } from "react";
import { isSidebarOpenAtom, multiViewPanelOpenAtom } from "./useFrame";

const HEADER_HEIGHT = 60;
const TOOLBAR_HEIGHT = 64;
const SIDEBAR_WIDTH = 208;
const CELL_COUNT = 24;

export const useComputedDimensions = (isFullScreen = false) => {
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const isBarActive = useAtomValue(multiViewPanelOpenAtom);

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [cellDimensions, setCellDimensions] = useState({
    columnWidth: 0,
    rowHeight: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const height =
        window.innerHeight -
        (isFullScreen
          ? isBarActive
            ? TOOLBAR_HEIGHT
            : 0
          : isBarActive
            ? TOOLBAR_HEIGHT + HEADER_HEIGHT
            : HEADER_HEIGHT);
      const width = isSidebarOpen
        ? window.innerWidth - SIDEBAR_WIDTH
        : window.innerWidth;

      setCellDimensions({
        columnWidth: Math.max(width / CELL_COUNT, 1),
        rowHeight: Math.max(height / CELL_COUNT, 1),
      });

      setDimensions({
        width,
        height,
      });
    };

    updateDimensions();
    // Listen for resize events
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isFullScreen, isBarActive, isSidebarOpen]);

  return {
    cellDimensions,
    dimensions,
  };
};
