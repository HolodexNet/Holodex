import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shadcn/ui/sheet";
import { useSearch } from "@/services/search.service";
import {
  MemoizedVideoCard,
  OnClickHandler,
} from "@/components/video/VideoCard";
import { SORT_OPTIONS } from "@/components/header/searchbar/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shadcn/ui/pagination";
import generatePageNumbers from "@/lib/utils";
import { SearchBar } from "@/components/header/searchbar/components/SearchBar";
import { estypes } from "@elastic/elasticsearch";
import { useSetAtom } from "jotai";
import { fillCellAtom, addVideoCellAtom } from "@/store/multiview";
import {
  StateSearchParameterProvider,
  useSearchParameters,
} from "@/components/header/searchbar/context/SearchParameterContext";

const ITEMS_PER_PAGE = 25;

function elasticSearchTotalToValue(total?: number | estypes.SearchTotalHits) {
  if (total === undefined) return 0;
  if (typeof total === "number") return total;
  return total.value;
}

interface AddVideoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, fill this cell instead of adding a new one */
  targetCellId?: string;
  /** Initial query items to pre-populate the search bar with */
  initialQueryItems?: import("@/components/header/searchbar/types").QueryItem[];
}

/**
 * Inner content component that consumes the SearchParameterContext.
 * This allows search state to be managed via React state instead of URL.
 */
function AddVideoSheetContent({
  targetCellId,
  onOpenChange,
}: Pick<AddVideoSheetProps, "targetCellId" | "onOpenChange">) {
  const { t } = useTranslation();
  const fillCell = useSetAtom(fillCellAtom);
  const addVideoCell = useSetAtom(addVideoCellAtom);

  // Use the search parameter context for state management
  const {
    queryContainer,
    sortOption,
    setSortOption,
    currentPage,
    setCurrentPage,
  } = useSearchParameters();

  // Calculate offset based on current page
  const offset = useMemo(
    () => (currentPage - 1) * ITEMS_PER_PAGE,
    [currentPage],
  );

  const { data, isLoading } = useSearch(
    queryContainer
      ? {
          ...queryContainer,
          sort: sortOption,
        }
      : undefined,
    offset,
  );

  const videos = useMemo(
    () => data?.hits.hits.map((hit) => hit._source!) ?? [],
    [data?.hits.hits],
  );

  const totalPages = useMemo(
    () =>
      Math.ceil(elasticSearchTotalToValue(data?.hits.total) / ITEMS_PER_PAGE),
    [data?.hits.total],
  );

  const handleSortChange = (value: string) => {
    setSortOption(value as (typeof SORT_OPTIONS)[number]);
  };

  const handlePageChange = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages) return;
    setCurrentPage(targetPage);
  };

  // Handle video selection - add to multiview
  const handleVideoSelect = useCallback<OnClickHandler>(
    (_part, video, event) => {
      event.stopPropagation();
      event.preventDefault();

      if (targetCellId) {
        // Fill existing cell
        fillCell({ cellId: targetCellId, videoId: video.id });
      } else {
        // Add a new video cell with the selected video
        addVideoCell({ x: 0, y: 0, w: 6, h: 4, videoId: video.id });
      }
      onOpenChange(false);
    },
    [targetCellId, fillCell, addVideoCell, onOpenChange],
  );

  // Generate array of page numbers to display
  const pageNumbers = useMemo(
    () => (totalPages > 0 ? generatePageNumbers(currentPage, totalPages) : []),
    [currentPage, totalPages],
  );

  return (
    <>
      <SheetHeader className="shrink-0">
        <SheetTitle className="flex items-center gap-2">
          <span className="i-lucide:plus-circle h-5 w-5" />
          {t("views.multiview.addArchive")}
        </SheetTitle>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4">
        {/* Search Controls */}
        <div className="flex shrink-0 flex-col gap-3">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`views.search.sort.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {queryContainer && (
              <span className="text-xs text-muted-foreground">
                {elasticSearchTotalToValue(data?.hits.total)} results
              </span>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!queryContainer ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-muted-foreground">
              <span className="i-lucide:search h-12 w-12 opacity-40" />
              <div>
                <p className="font-medium">Search for archived videos</p>
                <p className="text-sm">
                  Enter a vtuber name, topic, or search term above
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <div className="i-lucide:loader-2 animate-spin text-4xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1 px-2">
              {videos.map((video, idx) => (
                <MemoizedVideoCard
                  key={`videocard-${idx}-${video.id}`}
                  video={video}
                  size="list"
                  onClick={handleVideoSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="shrink-0 pb-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    isActive={currentPage > 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                </PaginationItem>
                {pageNumbers.map((pageNum, idx) => (
                  <PaginationItem key={`page-${pageNum}-${idx}`}>
                    {pageNum === -1 ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    isActive={currentPage < totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Sheet component that embeds the search functionality for adding videos to multiview.
 * In "archive" mode, shows the full search interface.
 * When a video is selected, it either fills the target cell or adds a new cell.
 *
 * Uses StateSearchParameterProvider to keep search state in React state
 * rather than URL parameters, since this is a modal/sheet context.
 */
export function AddVideoSheet({
  open,
  onOpenChange,
  targetCellId,
  initialQueryItems,
}: AddVideoSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
      >
        <StateSearchParameterProvider initialQueryItems={initialQueryItems}>
          <AddVideoSheetContent
            targetCellId={targetCellId}
            onOpenChange={onOpenChange}
          />
        </StateSearchParameterProvider>
      </SheetContent>
    </Sheet>
  );
}
