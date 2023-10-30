import { useClient } from "@/hooks/useClient";
import { useMutation } from "@tanstack/react-query";

interface SearchAutoCompleteParams {
  q?: string;
  t?: SearchAutoCompleteType[] | SearchAutoCompleteType;
  n?: number;
}

export function useSearchAutoCompleteMutation() {
  const client = useClient();

  return useMutation<SearchAutoComplete, Error, SearchAutoCompleteParams>({
    mutationFn: async (params) =>
      await client.get<SearchAutoComplete>("/api/v3/search/autocomplete", {
        params,
      }),
  });
}
