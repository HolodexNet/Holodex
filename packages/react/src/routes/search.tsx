import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { parse } from "picoquery";
import { VideoQueryContainer } from "@/components/header/searchbar/types";
import { useSearch } from "@/services/search.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { useVideoCardSizes } from "@/store/video";

export function Search() {
  const { t } = useTranslation();
  const { search } = useLocation();
  const [queryModel, setQueryModel] = useState<VideoQueryContainer>();
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);

  useEffect(() => {
    if (search) {
      const parsed = parse(search) as unknown as VideoQueryContainer;

      setQueryModel(parsed);
    }
  }, [search]);

  const {
    data,
    status,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSearch(queryModel);

  useEffect(() => {
    console.log(data);
  }, [data]);

  const videos = useMemo(
    () =>
      data?.pages.flatMap((searchResponse) => {
        return searchResponse.hits.hits.map((hit) => hit._source);
      }) ?? [],
    [data?.pages],
  );

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>{t("component.apiError.title")}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{t("component.search.searchLabel")} - Holodex</title>
      </Helmet>
      <div>Hello world</div>
      <MainVideoListing
        videos={videos}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={isLoading}
        size={cardSize}
        isFetchingNextPage={isFetchingNextPage}
      ></MainVideoListing>
    </>
  );
}
