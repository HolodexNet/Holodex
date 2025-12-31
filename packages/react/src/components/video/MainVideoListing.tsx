import { useMemo } from "react";
import { MemoizedVideoCard } from "./VideoCard";
import { SkeletonVideoCard } from "./SkeletonVideoCard";
import { VirtuosoGrid } from "react-virtuoso";
import { cn } from "@/lib/utils";
import { VirtuosoLoadingFooter } from "@/components/common/Loading";
import { nonVirtualAtom } from "@/store/settings";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

interface LoadMoreCardProps {
  onClick?: () => void;
  isLoading?: boolean;
  size: VideoCardSize;
}

function LoadMoreCard({ onClick, isLoading, size }: LoadMoreCardProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "group border-base-6 bg-base-3 hover:bg-base-4 relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 hover:border-primary disabled:cursor-wait disabled:opacity-70",
        {
          // Match the aspect ratio behavior of video cards for different sizes
          "aspect-video": size !== "list",
          "min-h-20 py-4": size === "list",
        },
      )}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="border-base-6 h-8 w-8 animate-spin rounded-full border-4 border-t-primary" />
          <span className="text-base-11 text-sm">{t("views.app.loading")}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-base-11 i-heroicons:arrow-down-circle h-10 w-10 transition-colors group-hover:text-primary" />
          <span className="text-base-11 text-sm font-medium transition-colors group-hover:text-primary">
            {t("component.mainVideoListing.loadMore")}
          </span>
        </div>
      )}
    </button>
  );
}

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
  const settingsNonVirtual = useAtomValue(nonVirtualAtom);
  const isNonVirtual = nonVirtual ?? settingsNonVirtual;

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
  if (isNonVirtual) {
    return (
      <div className={listClassName}>
        {videos?.map((video, idx) => (
          <MemoizedVideoCard
            key={`videocard-${idx}-${video.id}`}
            video={video}
            size={size}
          />
        ))}
        {hasNextPage && (
          <LoadMoreCard
            size={size}
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          />
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
        console.log("End Reached");
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
