import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { defaultOrgs } from "../../store/org";
import { useLive } from "@/services/live.service";
import { SelectorLiveItem } from "./SelectorLiveItem";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

/** Auto-scroll delay in milliseconds (how long to wait after last interaction before scrolling left) */
const AUTO_SCROLL_DELAY = 8000;
/** Duration of the scroll-back animation in milliseconds */
const AUTO_SCROLL_DURATION = 500;

/** Easing function: starts slow, accelerates towards the end */
function easeOutBounce(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}

/**
 * Multiview Selector toolbar component.
 * Shows an org dropdown and a horizontally scrolling list of live/upcoming streams.
 * Channels are sorted: live streams (by start time, most recent first),
 * then upcoming streams (by available_at, soonest first).
 *
 * Features a thin blue scrollbar (via Radix ScrollArea) and auto-scrolls to the left after inactivity.
 */
export function Selector() {
  // Create a mock favourites object as an org
  const Favorites: Org = {
    name: "Favorites",
  };

  const [currentOrg, setCurrentOrg] = useState(Favorites);
  const { data: live } = useLive({ org: currentOrg.name });

  const liveChannels = useVideoFilter(
    live?.items as Video[],
    "stream_schedule",
    "org",
  );

  // Ref for the scrollable viewport
  const viewportRef = useRef<HTMLDivElement>(null);
  // Track last user interaction time
  const lastInteractionRef = useRef<number>(Date.now());
  // Animation frame ID for cleanup
  const animationFrameRef = useRef<number | null>(null);
  // Track animation state
  const animationStateRef = useRef<{
    isAnimating: boolean;
    startTime: number;
    startScrollLeft: number;
  }>({ isAnimating: false, startTime: 0, startScrollLeft: 0 });

  // Sort live channels: live streams first (by start_actual desc), then upcoming (by available_at asc)
  const sortedLiveChannels = useMemo(() => {
    return [...liveChannels].sort((a, b) => {
      // Live streams come first
      const aIsLive = a.status === "live";
      const bIsLive = b.status === "live";

      if (aIsLive && !bIsLive) return -1;
      if (!aIsLive && bIsLive) return 1;

      if (aIsLive && bIsLive) {
        // Both are live: sort by start_actual descending (most recently started first)
        const aStart = a.start_actual ? new Date(a.start_actual).valueOf() : 0;
        const bStart = b.start_actual ? new Date(b.start_actual).valueOf() : 0;
        return bStart - aStart;
      }

      // Both are upcoming: sort by available_at ascending (soonest first)
      const aAvailable = a.available_at
        ? new Date(a.available_at).valueOf()
        : Infinity;
      const bAvailable = b.available_at
        ? new Date(b.available_at).valueOf()
        : Infinity;
      return aAvailable - bAvailable;
    });
  }, [liveChannels]);

  // Reset last interaction time on user activity and cancel animation
  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    animationStateRef.current.isAnimating = false;
  }, []);

  // Auto-scroll effect with easeInQuart easing
  useEffect(() => {
    const animate = () => {
      const viewport = viewportRef.current;
      if (!viewport) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const now = Date.now();
      const timeSinceInteraction = now - lastInteractionRef.current;
      const state = animationStateRef.current;

      // Check if we should start scrolling
      if (
        timeSinceInteraction >= AUTO_SCROLL_DELAY &&
        viewport.scrollLeft > 0
      ) {
        // Start animation if not already animating
        if (!state.isAnimating) {
          state.isAnimating = true;
          state.startTime = now;
          state.startScrollLeft = viewport.scrollLeft;
        }

        // Calculate animation progress (0 to 1)
        const elapsed = now - state.startTime;
        const progress = Math.min(elapsed / AUTO_SCROLL_DURATION, 1);

        // Apply easeOutBounce easing
        const easedProgress = easeOutBounce(progress);

        // Calculate new scroll position
        const newScrollLeft = state.startScrollLeft * (1 - easedProgress);
        viewport.scrollLeft = Math.max(0, newScrollLeft);

        // Stop animating when complete
        if (progress >= 1) {
          state.isAnimating = false;
          viewport.scrollLeft = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const onSelect = (org: Org) => {
    if (org.name === currentOrg.name) return;
    setCurrentOrg(org);
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <DropdownMenu>
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-muted-foreground/80 px-3 font-extrabold leading-tight">
            Holodex Multiview
          </span>
          <DropdownMenuTrigger className="flex items-center px-3 text-sm shrink-0 justify-between gap-1 rounded-md py-1.5 ring-accent hover:bg-accent focus-visible:outline-none focus-visible:ring-1 active:scale-[97%]">
            {currentOrg.name}
            <div className="shrink-0 opacity-50 h-4 w-4 i-lucide:chevrons-down" />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent className="z-30 w-48">
          {[/*Favorites, (fav not supported yet)*/ ...defaultOrgs].map(
            (org) => (
              <DropdownMenuItem
                key={org.name}
                className="gap-1 cursor-pointer py-2"
                onClick={() => onSelect(org)}
              >
                {org.name}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Live channel list - horizontal scroll with Radix ScrollArea */}
      <ScrollAreaPrimitive.Root className="min-w-0 overflow-hidden relative">
        <ScrollAreaPrimitive.Viewport
          ref={viewportRef}
          className="px-2 size-full"
          onMouseMove={handleInteraction}
          onTouchStart={handleInteraction}
        >
          <div
            id="live-channel-container"
            className="flex items-center py-2 gap-3 pr-4"
          >
            {sortedLiveChannels.map((live) => (
              <SelectorLiveItem key={live.id} live={live} />
            ))}
          </div>
        </ScrollAreaPrimitive.Viewport>

        {/* Thin blue horizontal scrollbar */}
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          orientation="horizontal"
          className="relative w-full h-1.5 touch-none select-none p-px transition-colors"
        >
          <ScrollAreaPrimitive.ScrollAreaThumb className="w-full rounded-full bg-blue-500 !h-1" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>

        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    </div>
  );
}
