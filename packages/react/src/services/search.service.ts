import { VideoQueryContainer } from "@/components/header/searchbar/types";
import { useClient } from "@/hooks/useClient";
import { HTTPError } from "@/lib/fetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type SearchResponse } from "@elastic/elasticsearch/lib/api/types";
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

export function useSearch(
  queryContainer: VideoQueryContainer | undefined,
  offset?: number,
) {
  const client = useClient();
  return useQuery({
    queryKey: ["search", queryContainer?.q, queryContainer?.sort, offset],
    async queryFn() {
      const newQ = {
        ...queryContainer,
        offset: offset ?? 0,
        limit: 24,
      };
      return await client.post<SearchResponse<PlaceholderVideo>, typeof newQ>(
        "/api/v3/search/videoSearch",
        newQ,
      );
    },
    enabled: !!queryContainer,
  });
}
