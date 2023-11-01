import { useClient } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";

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

export function useLive(params?: UseLiveParams, config?: CommonQueryConfig) {
  const client = useClient();

  return useQuery<Live[]>({
    queryKey: ["live", params],
    queryFn: async () =>
      await client<Live[]>("/api/v2/live", {
        params: {
          ...params,
        },
      }),
    ...config,
  });
}
