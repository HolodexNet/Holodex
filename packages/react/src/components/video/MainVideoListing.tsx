import { useMemo } from "react";
import { VideoCard } from "./VideoCard";
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
}

export function MainVideoListing({
  videos,
  size,
  className,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: MainVideoListingProps) {
  const listClassName = useMemo(
    () =>
      cn(
        "grid w-full gap-4 px-4 py-2 @container md:px-8",
        {
          "grid-cols-1": size === "list",
          "grid-cols-[repeat(auto-fill,minmax(340px,1fr))]": size === "lg",
          "grid-cols-[repeat(auto-fill,minmax(220px,1fr))]": size === "md",
          "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]": size === "sm",
          "grid-cols-[repeat(auto-fill,minmax(160px,1fr))]": size === "xs",
        },
        className,
      ),
    [size, className],
  );

  // const Footer = () =>
  //   (isLoading || isFetchingNextPage) && (
  //     <div className={listClassName}>
  //       {Array.from({ length: 8 }).map((_, index) => (
  //         <SkeletonVideoCard key={`placeholder-${index}`} />
  //       ))}
  //     </div>
  //   );

  return (
    <VirtuosoGrid
      useWindowScroll
      data={isLoading ? ([1, 2, 3, 4, 5, 6] as unknown as VideoBase[]) : videos}
      listClassName={listClassName}
      itemContent={(index, video) =>
        isLoading ? (
          <SkeletonVideoCard key={`placeholder-${index}`} />
        ) : (
          <VideoCard key={`video-${video.id}`} video={video} size={size} />
        )
      }
      endReached={async () => {
        if (hasNextPage && !isFetchingNextPage && !isLoading) {
          await fetchNextPage?.();
        }
      }}
      context={{
        size: "sm",
        isLoading: !!isLoading || !!isFetchingNextPage,
        hasNextPage: !!hasNextPage,
        loadMore: fetchNextPage,
      }}
      components={
        hasNextPage
          ? {
              Footer: VirtuosoLoadingFooter,
            }
          : {}
      }
    />
  );
}
