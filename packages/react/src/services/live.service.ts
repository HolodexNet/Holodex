import { useClient } from "@/hooks/useClient";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

interface UseLiveParams {
  channel_id?: string;
  status?: VideoStatus;
  lang?: string[];
  type?: VideoType[];
  topic?: string;
  include?: VideoIncludeParam[];
  org?: string;
  mentioned_channel_id?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number; // less than 50
  offset?: number;
  paginated?: string;
  max_upcoming_hours?: number;
  id?: string;
}

function listToString(list: string[] | undefined) {
  if (!list) return undefined;
  return list.join(",");
}

export function useLive(params?: UseLiveParams, config?: CommonQueryConfig) {
  const client = useClient();

  return useQuery<Live[]>({
    queryKey: ["live", params],
    queryFn: async () =>
      await client<Live[]>("/api/v2/live", {
        params: {
          ...params,
          type: listToString(params?.type),
          lang: listToString(params?.lang),
          include: listToString(params?.include),
        },
      }),
    ...config,
  });
}
