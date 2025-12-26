import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { orgRankingAtom } from "../../store/org";
import { useFavoriteLive, useLive } from "@/services/live.service";
import { SelectorLiveItem } from "./SelectorLiveItem";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useAtomValue } from "jotai";

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

/** Favorites pseudo-org for the selector */
const FAVORITES_ORG: Org = { name: "Favorites" };

/**
 * Sort videos: live streams first (by start_actual desc), then upcoming (by available_at asc)
 */
function sortLiveVideos(videos: VideoBase[]): VideoBase[] {
  return [...videos].sort((a, b) => {
    const aIsLive = a.status === "live";
    const bIsLive = b.status === "live";

    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;

    if (aIsLive && bIsLive) {
      const aStart = a.start_actual ? new Date(a.start_actual).valueOf() : 0;
      const bStart = b.start_actual ? new Date(b.start_actual).valueOf() : 0;
      return bStart - aStart;
    }

    const aAvailable = a.available_at
      ? new Date(a.available_at).valueOf()
      : Infinity;
    const bAvailable = b.available_at
      ? new Date(b.available_at).valueOf()
      : Infinity;
    return aAvailable - bAvailable;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// VideoListScroller - Shared scroll area with auto-scroll animation
// ─────────────────────────────────────────────────────────────────────────────

interface VideoListScrollerProps {
  videos: VideoBase[];
}

/**
 * Horizontal scrolling list of live/upcoming videos with auto-scroll animation.
 * Features thin blue scrollbar and auto-scrolls left after inactivity.
 */
function VideoListScroller({ videos }: VideoListScrollerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);
  const animationStateRef = useRef<{
    isAnimating: boolean;
    startTime: number;
    startScrollLeft: number;
  }>({ isAnimating: false, startTime: 0, startScrollLeft: 0 });

  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    animationStateRef.current.isAnimating = false;
  }, []);

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

      if (
        timeSinceInteraction >= AUTO_SCROLL_DELAY &&
        viewport.scrollLeft > 0
      ) {
        if (!state.isAnimating) {
          state.isAnimating = true;
          state.startTime = now;
          state.startScrollLeft = viewport.scrollLeft;
        }

        const elapsed = now - state.startTime;
        const progress = Math.min(elapsed / AUTO_SCROLL_DURATION, 1);
        const easedProgress = easeOutBounce(progress);
        const newScrollLeft = state.startScrollLeft * (1 - easedProgress);
        viewport.scrollLeft = Math.max(0, newScrollLeft);

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

  return (
    <ScrollAreaPrimitive.Root className="overflow-hidden relative min-w-0">
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
          {videos.map((video) => (
            <SelectorLiveItem key={video.id} live={video} />
          ))}
        </div>
      </ScrollAreaPrimitive.Viewport>

      <ScrollAreaPrimitive.ScrollAreaScrollbar
        orientation="horizontal"
        className="relative w-full transition-colors h-1.5 touch-none select-none p-px"
      >
        <ScrollAreaPrimitive.ScrollAreaThumb className="w-full rounded-full bg-blue-500 h-1!" />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OrgVideoList - Videos from an organization using useLive()
// ─────────────────────────────────────────────────────────────────────────────

interface OrgVideoListProps {
  orgName: string;
}

function OrgVideoList({ orgName }: OrgVideoListProps) {
  const { data: live } = useLive({ org: orgName });

  const filteredVideos = useVideoFilter(
    live?.items as Video[],
    "stream_schedule",
    "org",
  );

  const sortedVideos = useMemo(
    () => sortLiveVideos(filteredVideos),
    [filteredVideos],
  );

  return <VideoListScroller videos={sortedVideos} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// FavoriteVideoList - Videos from favorites using useFavoriteLive()
// ─────────────────────────────────────────────────────────────────────────────

function FavoriteVideoList() {
  const { data: favorites } = useFavoriteLive();

  const filteredVideos = useVideoFilter(
    favorites as Video[],
    "stream_schedule",
    "favorites",
  );

  const sortedVideos = useMemo(
    () => sortLiveVideos(filteredVideos),
    [filteredVideos],
  );

  return <VideoListScroller videos={sortedVideos} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Selector - Main component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multiview Selector toolbar component.
 * Shows an org dropdown and a horizontally scrolling list of live/upcoming streams.
 * Supports both organization-based video lists and user favorites.
 */
export function Selector() {
  const rankedOrgs = useAtomValue(orgRankingAtom);
  const [currentOrg, setCurrentOrg] = useState<Org>(rankedOrgs[0]);

  const isFavorites = currentOrg.name === "Favorites";

  const onSelect = (org: Org) => {
    if (org.name === currentOrg.name) return;
    setCurrentOrg(org);
  };

  return (
    <div className="flex items-center min-w-0 gap-2">
      <DropdownMenu>
        <div className="flex flex-col items-start">
          <span className="px-3 text-[10px] text-muted-foreground/80 font-extrabold leading-tight">
            Holodex Multiview
          </span>
          <DropdownMenuTrigger className="flex items-center px-3 text-sm gap-1 rounded-md shrink-0 justify-between py-1.5 ring-accent hover:bg-accent focus-visible:outline-none focus-visible:ring-1 active:scale-[97%]">
            {currentOrg.name}
            <div className="shrink-0 opacity-50 h-4 w-4 i-lucide:chevrons-down" />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent className="z-30 w-48">
          {[FAVORITES_ORG, ...rankedOrgs].map((org) => (
            <DropdownMenuItem
              key={org.name}
              className="gap-1 py-2 cursor-pointer"
              onClick={() => onSelect(org)}
            >
              {org.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Conditionally render video list based on selection */}
      {isFavorites ? (
        <FavoriteVideoList />
      ) : (
        <OrgVideoList orgName={currentOrg.name} />
      )}
    </div>
  );
}
