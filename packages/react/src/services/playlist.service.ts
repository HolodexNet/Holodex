import { useClient } from "@/hooks/useClient";
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export function usePlaylists(options?: UseQueryOptions<PlaylistStub[]>) {
  const client = useClient();

  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () =>
      await client<PlaylistStub[]>("/api/v2/users/playlists"),
    ...options,
  });
}

export function usePlaylist(id: number, options?: UseQueryOptions<Playlist>) {
  const client = useClient();

  return useQuery({
    queryKey: ["playlist", id],
    queryFn: async () => await client<Playlist>(`/api/v2/playlist/${id}`),
    ...options,
  });
}

export function usePlaylistInclude(
  videoId: string,
  options?: UseQueryOptions<PlaylistInclude[]>,
) {
  const client = useClient();

  return useQuery({
    queryKey: ["playlist", "include", videoId],
    queryFn: async () =>
      await client<PlaylistInclude[]>(`/api/v2/video-playlist/${videoId}`),
    ...options,
  });
}

export function usePlaylistVideoMutation(
  options?: UseMutationOptions<boolean, Error, { id: number; videoId: string }>,
) {
  const client = useClient();

  return useMutation({
    mutationFn: async ({ id, videoId }) =>
      await client<boolean>(`/api/v2/video-playlist/${id}/${videoId}`, {
        method: "PUT",
      }),
    ...options,
  });
}
