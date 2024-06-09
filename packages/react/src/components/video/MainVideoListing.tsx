import { useMemo } from "react";
import { VideoCard } from "./VideoCard";
import { SkeletonVideoCard } from "./SkeletonVideoCard";
import { WindowVirtualizer } from "virtua";
import { cn } from "@/lib/utils";

interface MainVideoListingProps {
  videos: VideoBase[];
  size: VideoCardSize;
  className?: string;
  fetchNextPage?: () => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  containerWidth: number;
}

export function MainVideoListing({
  containerWidth,
  videos,
  size,
  className,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: MainVideoListingProps) {
  let countPerRow;
  switch (size) {
    case "list":
      countPerRow = 1;
      break;
    case "lg":
      countPerRow = Math.max(1, Math.floor(containerWidth / 360));
      break;
    case "md":
      countPerRow = Math.max(1, Math.floor(containerWidth / 240));
      break;
    case "sm":
      countPerRow = Math.max(1, Math.floor(containerWidth / 200));
      break;
    case "xs":
      countPerRow = Math.max(1, Math.floor(containerWidth / 180));
      break;
    default:
      countPerRow = 1;
  }

  const videosGroupedByRow = useMemo(() => {
    const out = [];
    for (let i = 0; i < videos.length; i += countPerRow) {
      out.push(videos.slice(i, i + countPerRow));
    }
    return out;
  }, [videos, countPerRow]);

  const listClassName = useMemo(
    () =>
      cn(
        "px-4 py-2 md:px-8",
        {
          "@container grid gap-4": size === "lg",
          "@container grid gap-2": size === "md",
          "@container flex flex-col max-w-screen mx-auto px-4 py-1":
            size === "list",
        },
        className,
      ),
    [size, className],
  );

  // const fetchedCountRef = useRef(-1);
  return (
    <div className="w-full">
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
            <div
              key={`row-${idx}`}
              className={listClassName}
              style={{ gridTemplateColumns: `repeat(${countPerRow}, 1fr)` }}
            >
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
          <div
            key={`row-loading`}
            className={listClassName}
            style={{ gridTemplateColumns: `repeat(${countPerRow}, 1fr)` }}
          >
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
