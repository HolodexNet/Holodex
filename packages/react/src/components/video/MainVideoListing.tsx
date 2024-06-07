import { useMemo } from "react";
import { VideoCard } from "./VideoCard";
import { SkeletonVideoCard } from "./SkeletonVideoCard";
import { WindowVirtualizer } from "virtua";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

interface MainVideoListingProps {
  videos: VideoBase[];
  size: VideoCardSize;
  fetchNextPage?: () => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export function MainVideoListing({
  videos,
  size,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: MainVideoListingProps) {
  const [ref, bounds] = useMeasure();
  const countPerRow = useMemo(() => {
    if (size === "list") return 1;
    if (size === "lg")
      return Math.max(1, Math.floor(bounds.width / (360 + 16))); // item width + gap
    if (size === "md") return Math.max(1, Math.floor(bounds.width / (240 + 8)));
    if (size === "sm") return Math.max(1, Math.floor(bounds.width / (200 + 4)));
    if (size === "xs") return Math.max(1, Math.floor(bounds.width / (180 + 2)));
    return 1;
  }, [bounds.width, size]);

  const videosGroupedByRow = useMemo(() => {
    const out = [];
    for (let i = 0; i < videos.length; i += countPerRow) {
      out.push(videos.slice(i, i + countPerRow));
    }
    return out;
  }, [videos, countPerRow]);

  const listClassName = useMemo(
    () =>
      cn("py-2", {
        "@container grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-x-4 gap-y-4":
          size === "lg",
        "@container grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-2 gap-y-2":
          size === "md",
        "@container flex flex-col max-w-screen mx-auto": size === "list",
      }),
    [size],
  );

  // const fetchedCountRef = useRef(-1);
  return (
    <div className="w-full" ref={ref}>
      <WindowVirtualizer
        onRangeChange={async (_, end) => {
          if (
            hasNextPage &&
            !isFetchingNextPage &&
            !isLoading &&
            end + 2 > videosGroupedByRow.length //&&
            // fetchedCountRef.current < videosGroupedByRow.length
          ) {
            // fetchedCountRef.current = videosGroupedByRow.length;
            fetchNextPage?.();
          }
        }}
      >
        {videosGroupedByRow.map((videoRow, idx) => {
          return (
            <div key={`row-${idx}`} className={listClassName}>
              {videoRow.map((video) => (
                <VideoCard
                  key={"video-" + video.id}
                  video={video}
                  size={size}
                />
              ))}
            </div>
          );
        })}
        {(isLoading || isFetchingNextPage) && (
          <div key={`row-loading`} className={listClassName}>
            {(isLoading || isFetchingNextPage) &&
              Array.from({
                length: isLoading ? 24 : isFetchingNextPage ? countPerRow : 0,
              }).map((_, index) => (
                <SkeletonVideoCard key={`placeholder-${index}`} />
              ))}
          </div>
        )}
      </WindowVirtualizer>
    </div>
  );
}
