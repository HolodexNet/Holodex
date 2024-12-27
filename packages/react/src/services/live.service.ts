import { useClient } from "@/hooks/useClient";
import { hidePlaceholderAtom } from "@/store/settings";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { VideoServiceResponse } from "./video.service";

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

const STANDARD_CONFIG_LIVE_QUERY = {
  refetchInterval: 3 * 60 * 1000, // 3 minutes
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  staleTime: 2.5 * 60 * 1000, // 2.5 minutes
};

export function useLive(params?: UseLiveParams, config?: CommonQueryConfig) {
  const client = useClient();

  return useQuery({
    queryKey: ["live", params],
    queryFn: async () =>
      await client<VideoServiceResponse<Live>>("/api/v3/live", {
        params: {
          ...params,
          limit: 3000,
        },
      }),
    ...STANDARD_CONFIG_LIVE_QUERY,
    ...config,
  });
}

export function useFavoriteLive(config?: CommonQueryConfig) {
  const client = useClient();
  const hidePlaceholder = useAtomValue(hidePlaceholderAtom); // Assume this hook exists to get user settings

  return useQuery<Live[]>({
    queryKey: ["favorite-live", hidePlaceholder, client.loggedIn],
    queryFn: async () =>
      await client.get<Live[]>("/api/v2/users/live", {
        params: {
          includePlaceholder: !hidePlaceholder ? 1 : 0,
        },
      }),
    ...STANDARD_CONFIG_LIVE_QUERY,
    ...config,
  });
}
