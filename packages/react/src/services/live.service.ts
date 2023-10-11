import { useClient } from "@/hooks/useClient";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface UseLiveParams {
  channel_id?: string;
  status?: VideoStatus;
  lang?: string[];
  type?: VideoType[];
  topic?: string;
  include?:VideoIncludeParam[];
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

export function useLive(
  params?: UseLiveParams,
  config?: UseQueryOptions<Live[], AxiosError>,
) {
  const client = useClient();

  return useQuery<Live[], AxiosError>(
    ["live", params],
    async () => (await client<Live[]>("/live", { params })).data,
    config,
  );
}
