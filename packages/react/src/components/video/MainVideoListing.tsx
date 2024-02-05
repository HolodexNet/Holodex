import { useMemo } from "react";
import { VideoCard } from "./VideoCard";
import { SkeletonVideoCard } from "./SkeletonVideoCard";
import { WindowVirtualizer } from "virtua";

interface MainVideoListingProps {
  videos: VideoBase[];
  size: VideoCardSize;
  className: string;
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
  const countPerRow = useMemo(() => {
    if (size === "list") return 1;
    if (size === "lg") return Math.max(1, Math.floor(containerWidth / 360));
    if (size === "md") return Math.max(1, Math.floor(containerWidth / 240));
    if (size === "sm") return Math.max(1, Math.floor(containerWidth / 200));
    if (size === "xs") return Math.max(1, Math.floor(containerWidth / 180));
    return 1;
  }, [containerWidth, size]);

  const videosGroupedByRow = useMemo(() => {
    const out = [];
    for (let i = 0; i < videos.length; i += countPerRow) {
      out.push(videos.slice(i, i + countPerRow));
    }
    return out;
  }, [videos, countPerRow]);

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
            <div key={`row-${idx}`} className={className}>
              {videoRow.map((video) => (
                <VideoCard key={"video-" + video.id} {...video} size={size} />
              ))}
            </div>
          );
        })}
        {(isLoading || isFetchingNextPage) && (
          <div key={`row-loading`} className={className}>
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
