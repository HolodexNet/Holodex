import { VideoQueryContainer } from "@/components/header/searchbar/types";
import { useClient } from "@/hooks/useClient";
import { HTTPError } from "@/lib/fetch";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { type SearchResponse } from "elasticsearch";
interface SearchAutoCompleteParams {
  q?: string;
  t?: SearchAutoCompleteType[] | SearchAutoCompleteType;
  n?: number;
}

export function useSearchAutoCompleteMutation() {
  const client = useClient();

  return useMutation<SearchAutoComplete, HTTPError, SearchAutoCompleteParams>({
    mutationFn: async (params) =>
      await client.get<SearchAutoComplete>("/api/v3/search/autocomplete", {
        params,
      }),
  });
}

export function useSearch(queryContainer: VideoQueryContainer | undefined) {
  const client = useClient();

  return useInfiniteQuery({
    initialPageParam: undefined as string[] | undefined,
    queryKey: [
      "search",
      queryContainer?.q,
      queryContainer?.pagination.sort,
      queryContainer?.pagination.sort,
    ],
    async queryFn({ pageParam }) {
      let newQ;
      if (pageParam) {
        newQ = {
          ...queryContainer,
          pagination: {
            ...queryContainer?.pagination,
            search_after: pageParam,
          },
        };
      } else {
        newQ = queryContainer;
      }

      return await client.post<SearchResponse<PlaceholderVideo>, typeof newQ>(
        "/api/v3/search/videoSearch",
        newQ,
      );
    },
    getNextPageParam: (lastPage, _) => {
      return lastPage?.hits?.hits?.[lastPage?.hits?.hits?.length ?? 1 - 1]
        ?.sort;
    },
    enabled: !!queryContainer,
  });
}
