import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { openSidebarAtom } from "./useFrame";

/// Sets up event handlers to handle swipe right event to open sidebar
export function useSwipeRightInit() {
  const swipeRightX = useRef<number | null>(null);
  const swipeRightY = useRef<number | null>(null);
  const directionLock = useRef<"horizontal" | "vertical" | null>(null);
  const openSidebar = useSetAtom(openSidebarAtom);
  const handleSwipeRightStart = (e: TouchEvent) => {
    // Check if the touch starts near the left edge of the screen
    const SWIPE_RIGHT_START_POINT = 30;
    if (e.touches[0].clientX <= SWIPE_RIGHT_START_POINT) {
      swipeRightX.current = e.touches[0].clientX;
      swipeRightY.current = e.touches[0].clientY;
    } else {
      swipeRightX.current = null;
      swipeRightY.current = null;
    }
  };
  const handleSwipeRightMove = (e: TouchEvent) => {
    if (swipeRightX.current === null || swipeRightY.current === null) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const deltaX = touchEndX - swipeRightX.current;
    const deltaY = touchEndY - swipeRightY.current;

    const INITIAL_MOVEMENT_THRESHOLD = 10;
    const SWIPE_RIGHT_THRESHOLD = 100;

    // Lock the direction based on the initial movement
    if (directionLock.current === null) {
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > INITIAL_MOVEMENT_THRESHOLD
      ) {
        directionLock.current = "horizontal";
      } else if (
        Math.abs(deltaY) > Math.abs(deltaX) &&
        Math.abs(deltaY) > INITIAL_MOVEMENT_THRESHOLD
      ) {
        directionLock.current = "vertical";
      }
    }

    // Check if the movement is primarily horizontal and to the right
    if (
      directionLock.current === "horizontal" &&
      deltaX > SWIPE_RIGHT_THRESHOLD
    ) {
      openSidebar();
      swipeRightX.current = null;
      swipeRightY.current = null;
    }
  };
  const handleSwipeRightEnd = () => {
    swipeRightX.current = null;
    swipeRightY.current = null;
    directionLock.current = null;
  };
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      root.addEventListener("touchstart", handleSwipeRightStart);
      root.addEventListener("touchmove", handleSwipeRightMove);
      root.addEventListener("touchend", handleSwipeRightEnd);
    }
    return () => {
      root?.removeEventListener("touchstart", handleSwipeRightStart);
      root?.removeEventListener("touchmove", handleSwipeRightMove);
      root?.removeEventListener("touchend", handleSwipeRightEnd);
    };
  });
}
