import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { parse } from "picoquery";
import { useSearch } from "@/services/search.service";
import { useVideoCardSizes } from "@/store/video";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import {
  VideoQueryContainer,
  SORT_OPTIONS,
} from "@/components/header/searchbar/types";
import { Button } from "@/shadcn/ui/button";
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
import generatePageNumbers, { cn } from "@/lib/utils";
import { SearchBar } from "@/components/header/searchbar/components/SearchBar";
import { type SearchTotalHits } from "@elastic/elasticsearch/lib/api/types";

const ITEMS_PER_PAGE = 25;

function elasticSearchTotalToValue(total?: number | SearchTotalHits) {
  if (total === undefined) {
    return 0;
  }
  if (typeof total === "number") {
    return total;
  }
  return total.value;
}

export default function Search() {
  const { t } = useTranslation();
  const { search } = useLocation();
  const [queryModel, setQueryModel] = useState<VideoQueryContainer>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] =
    useState<(typeof SORT_OPTIONS)[number]>("score");
  const {
    size: cardSize,
    nextSize,
    setNextSize,
  } = useVideoCardSizes(["list", "md", "lg"]);

  // Calculate offset based on current page
  const offset = useMemo(
    () => (currentPage - 1) * ITEMS_PER_PAGE,
    [currentPage],
  );

  // Update query model when URL search params change
  useEffect(() => {
    if (search) {
      const parsed = parse(search.slice(1)) as unknown as VideoQueryContainer;
      setQueryModel(parsed);
      setSortOption(parsed.sort || "score");
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [search]);

  const { data, status, isLoading } = useSearch(
    {
      ...queryModel,
      sort: sortOption,
    },
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
    setCurrentPage(1);
  };

  const handlePageChange = (targetPage: number) => {
    console.log("page changed", targetPage);
    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate array of page numbers to display
  const pageNumbers = useMemo(
    () => (totalPages > 0 ? generatePageNumbers(currentPage, totalPages) : []),
    [currentPage, totalPages],
  );

  if (status === "error") {
    return <div className="container p-4">{t("component.apiError.title")}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{t("component.search.searchLabel")} - Holodex</title>
      </Helmet>

      <div className="container space-y-4 p-4">
        {/* Search Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl flex-1">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`search.sort.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="shrink-0"
              size="icon-lg"
              variant="ghost"
              onClick={() => setNextSize()}
            >
              <div
                className={cn({
                  "i-lucide:grid-3x3": nextSize === "md",
                  "i-lucide:layout-grid": nextSize === "lg",
                  "i-lucide:list": nextSize === "list",
                })}
              />
            </Button>
          </div>
        </div>

        <div>
          {/* Debug values: */}
          {/* <pre>{JSON.stringify(queryModel, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(sortOption, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(videos, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(totalPages, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(pageNumbers, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(currentPage, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(offset, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(data?.hits.total, null, 2)}</pre> */}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="i-lucide:loader-2 animate-spin text-4xl" />
          </div>
        ) : (
          <>
            <MainVideoListing
              videos={videos}
              size={cardSize}
              className="mb-4"
              nonVirtual
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {/* Previous Page Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      isActive={currentPage > 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  </PaginationItem>
                  {/* Page Numbers */}
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
                  {/* Next Page Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      isActive={currentPage <= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* {<pre>{JSON.stringify(pageNumbers, null, 2)}</pre>} */}
          </>
        )}
      </div>
    </>
  );
}

export { Search };
