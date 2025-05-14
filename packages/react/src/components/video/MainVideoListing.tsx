import { useMemo } from "react";
import { MemoizedVideoCard } from "./VideoCard";
import { SkeletonVideoCard } from "./SkeletonVideoCard";
import { VirtuosoGrid } from "react-virtuoso";
import { cn } from "@/lib/utils";
import { VirtuosoLoadingFooter } from "@/components/common/Loading";

interface MainVideoListingProps {
  videos?: VideoBase[];
  size: VideoCardSize;
  className?: string;
  fetchNextPage?: () => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  nonVirtual?: boolean;
}

export function MainVideoListing({
  videos,
  size,
  className,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  nonVirtual,
}: MainVideoListingProps) {
  const listClassName = useMemo(
    () =>
      cn(
        "grid w-full gap-4 px-4 py-2 @container md:px-8",
        {
          "grid-cols-1 gap-1": size === "list",
          "grid-cols-[repeat(auto-fill,minmax(340px,1fr))]": size === "lg",
          "grid-cols-[repeat(auto-fill,minmax(250px,1fr))]": size === "md",
          "grid-cols-[repeat(auto-fill,minmax(190px,1fr))]": size === "sm",
          "grid-cols-[repeat(auto-fill,minmax(160px,1fr))]": size === "xs",
        },
        className,
      ),
    [size, className],
  );

  if (isLoading) {
    return (
      <div className={listClassName}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonVideoCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // If nonVirtual is true, render a simple grid
  if (nonVirtual) {
    return (
      <div className={listClassName}>
        {videos?.map((video, idx) => (
          <MemoizedVideoCard
            key={`videocard-${idx}-${video.id}`}
            video={video}
            size={size}
          />
        ))}
        {isFetchingNextPage && hasNextPage && (
          <div className="flex justify-center py-4 col-span-full">
            <VirtuosoLoadingFooter
              context={{
                size: "sm",
                isLoading: true,
                hasNextPage: true,
                loadMore: fetchNextPage,
                autoload: !!fetchNextPage,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      data={videos ?? []}
      listClassName={listClassName}
      itemContent={(idx, video) => (
        <MemoizedVideoCard
          key={`videocard-${idx}-${video.id}`}
          video={video}
          size={size}
        />
      )}
      endReached={async () => {
        if (hasNextPage && !isFetchingNextPage && !isLoading) {
          await fetchNextPage?.();
        }
      }}
      overscan={10}
      context={{
        size: "sm",
        isLoading: !!isLoading || !!isFetchingNextPage,
        hasNextPage: !!hasNextPage,
        loadMore: fetchNextPage,
        autoload: !!fetchNextPage,
      }}
      components={
        hasNextPage && !isLoading
          ? {
              Footer: VirtuosoLoadingFooter,
            }
          : {}
      }
    />
  );
}
